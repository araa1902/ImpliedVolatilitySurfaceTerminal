import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
import time
from dataclasses import asdict, dataclass
from fetchData import DataFetcher
from blackScholes import implied_volatility
from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.interpolate import griddata, Rbf
from scipy.ndimage import gaussian_filter
from pykrige.ok import OrdinaryKriging

@dataclass
class SurfaceMeta:
    ticker: str
    interpolation: str
    smoothing: int
    resolution: int
    timestamp: float

class ImpliedVolatilitySurface:
    """
    Generate and visualise the implied volatility surface for a given ticker.
    """

    def __init__(self, ticker: str, risk_free_rate: float = 0.04, use_live: bool = False):
        self.ticker = ticker
        self.risk_free_rate = risk_free_rate
        self.data_fetcher = DataFetcher(ticker, use_live=use_live)
        self.current_price = 0.0
        self.option_data = pd.DataFrame()
        self.iv_surface_data = pd.DataFrame()
        self._grid_cache = {}

    def generate_surface_data(self):
        print(f"Fetching data for {self.ticker} (live={self.data_fetcher.use_live})...")
        self.current_price, self.option_data = self.data_fetcher.fetch_option_data()

        if self.option_data.empty:
            print("No option data available.")
            return

        print(f"Calculating implied volatilities for {len(self.option_data)} options...")
        def calculate_implied_volatility(row):
            result = implied_volatility(
                market_price=row["mid_price"],
                S=self.current_price,
                K=row["strike"],
                T=row["time_to_maturity"],
                r=self.risk_free_rate,
                option_type=row["option_type"],
            )
            return result[0] if isinstance(result, tuple) else result

        self.option_data["implied_vol"] = self.option_data.apply(calculate_implied_volatility, axis=1)

        self.option_data.dropna(subset=["implied_vol"], inplace=True)
        self.option_data = self.option_data[self.option_data["implied_vol"] > 0.001]

        if self.option_data.empty:
            print("No valid implied volatilities.")
            return

        self.iv_surface_data = (
            self.option_data.pivot_table(
                values="implied_vol", index="strike", columns="time_to_maturity", aggfunc="mean"
            )
            .sort_index()
            .sort_index(axis=1)
        )

    def check_arbitrage_violations(self, strikes, times, grid):
        """
        Check for calendar and butterfly arbitrage violations
        """
        violations = []
        
        # Calendar arbitrage check
        for i, strike in enumerate(strikes):
            for j in range(len(times) - 1):
                short_vol = grid[i][j]
                long_vol = grid[i][j + 1]
                
                # Total variance should be non-decreasing
                short_var = short_vol**2 * times[j]
                long_var = long_vol**2 * times[j + 1]
                
                if short_var > long_var:
                    violations.append({
                        'type': 'calendar',
                        'strike': float(strike),
                        'time_short': float(times[j]),
                        'time_long': float(times[j + 1]),
                        'severity': 'high' if short_var > long_var * 1.2 else 'medium'
                    })
        
        # Butterfly arbitrage check
        for j, time_val in enumerate(times):
            for i in range(1, len(strikes) - 1):
                left_vol = grid[i - 1][j]
                center_vol = grid[i][j]
                right_vol = grid[i + 1][j]
                
                # Check convexity in variance space
                left_var = left_vol**2
                center_var = center_vol**2
                right_var = right_vol**2
                
                expected_center = (left_var + right_var) / 2
                if center_var > expected_center * 1.1:  # 10% tolerance
                    violations.append({
                        'type': 'butterfly',
                        'time': float(time_val),
                        'strikes': [float(strikes[i-1]), float(strikes[i]), float(strikes[i+1])],
                        'severity': 'medium'
                    })
        
        return violations

    def calculate_calibration_metrics(self, model_grid, market_data):
        """
        Calculate calibration error metrics
        """
        if not hasattr(self, 'option_data') or self.option_data.empty:
            return {'rmse': 0, 'mae': 0, 'max_error': 0, 'r_squared': 0}
        
        # Compare model implied vols to market implied vols
        errors = []
        model_ivs = []
        market_ivs = []
        
        for _, row in self.option_data.iterrows():
            market_iv = row['implied_vol']
            
            # Find closest grid point (simplified interpolation)
            strike_idx = np.argmin(np.abs(np.array(self.iv_surface_data.index) - row['strike']))
            time_idx = np.argmin(np.abs(np.array(self.iv_surface_data.columns) - row['time_to_maturity']))
            
            try:
                model_iv = model_grid[strike_idx][time_idx]
                error = model_iv - market_iv
                errors.append(error)
                model_ivs.append(model_iv)
                market_ivs.append(market_iv)
            except (IndexError, TypeError):
                continue
        
        if not errors:
            return {'rmse': 0, 'mae': 0, 'max_error': 0, 'r_squared': 0}
        
        errors = np.array(errors)
        rmse = np.sqrt(np.mean(errors**2))
        mae = np.mean(np.abs(errors))
        max_error = np.max(np.abs(errors))
        
        # R-squared
        ss_res = np.sum(errors**2)
        ss_tot = np.sum((np.array(market_ivs) - np.mean(market_ivs))**2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        return {
            'rmse': float(rmse),
            'mae': float(mae),
            'max_error': float(max_error),
            'r_squared': float(r_squared)
        }

    def compute_interpolated_surface(self, method: str = "cubic", smoothing: int = 50, resolution: int = 50):
        """
        Enhanced version with arbitrage checks and calibration metrics
        """
        if self.iv_surface_data.empty:
            self.generate_surface_data()
        if self.iv_surface_data.empty:
            return None

        strikes = self.iv_surface_data.index.values.astype(float)
        times = self.iv_surface_data.columns.values.astype(float)
        base_values = self.iv_surface_data.values.astype(float)

        # Raw points flatten
        T, S = np.meshgrid(times, strikes)
        points_raw = np.column_stack([S.ravel(), T.ravel()])
        values_raw = base_values.ravel()

        # Filter out NaN values
        valid_mask = ~np.isnan(values_raw)
        points_raw = points_raw[valid_mask]
        values_raw = values_raw[valid_mask]
        
        if len(values_raw) == 0:
            print("Warning: No valid implied volatility values found")
            return None

        # Target grid
        s_lin = np.linspace(strikes.min(), strikes.max(), resolution)
        t_lin = np.linspace(times.min(), times.max(), resolution)
        Sg, Tg = np.meshgrid(s_lin, t_lin, indexing="ij")

        method_lower = method.lower()
        grid = None

        if method_lower in ("linear", "cubic", "nearest") and griddata is not None:
            grid = griddata(points_raw, values_raw, (Sg, Tg), method="cubic" if method_lower == "cubic" else method_lower, fill_value=float(np.nanmean(values_raw)))
        elif method_lower == "kriging":
            if OrdinaryKriging is not None:
                try:
                    ok = OrdinaryKriging(points_raw[:,0], points_raw[:,1], values_raw, verbose=False, enable_plotting=False)
                    grid, _ = ok.execute("grid", s_lin, t_lin)
                except Exception:
                    # fallback
                    if griddata is not None:
                        grid = griddata(points_raw, values_raw, (Sg, Tg), method="linear", fill_value=float(np.nanmean(values_raw)))
                    else:
                        grid = base_values
            else:
                if griddata is not None:
                    grid = griddata(points_raw, values_raw, (Sg, Tg), method="linear", fill_value=float(np.nanmean(values_raw)))
                else:
                    grid = base_values
        else:
            # fallback simple
            grid = base_values

        # Ensure no NaN values in final grid
        if grid is not None:
            nan_mask = np.isnan(grid)
            if np.any(nan_mask):
                grid[nan_mask] = np.nanmean(values_raw)  # Fill NaNs with mean value

        # Smoothing
        if smoothing > 0:
            sigma = (smoothing / 100) * 2.0
            if gaussian_filter is not None:
                grid = gaussian_filter(grid, sigma=sigma)
            else:
                # simple moving average fallback
                k = max(1, int(sigma * 2) + 1)
                pad = k // 2
                pad_grid = np.pad(grid, pad, mode='edge')
                smoothed = np.zeros_like(grid)
                for i in range(grid.shape[0]):
                    for j in range(grid.shape[1]):
                        smoothed[i, j] = pad_grid[i:i+k, j:j+k].mean()
                grid = smoothed

        # Add arbitrage checks
        arbitrage_violations = self.check_arbitrage_violations(s_lin, t_lin, grid)
        
        # Add calibration metrics
        calibration_metrics = self.calculate_calibration_metrics(grid, self.option_data)

        meta = SurfaceMeta(
            ticker=self.ticker,
            interpolation=method_lower,
            smoothing=int(smoothing),
            resolution=int(resolution),
            timestamp=time.time()
        )

        return {
            "strikes": s_lin.tolist(),
            "times": t_lin.tolist(),
            "grid": grid.tolist(),
            "volatilities": grid.tolist(),  # For backward compatibility
            "points": [
                {"strike": float(s), "time": float(t), "iv": float(v)}
                for (s, t), v in zip(points_raw, values_raw)
            ],
            "arbitrage_violations": arbitrage_violations,
            "calibration_metrics": calibration_metrics,
            "meta": asdict(meta),
            "timestamp": meta.timestamp,
            "dataPoints": len(points_raw)
        }

    def to_json(self, **kwargs):
        surface = self.compute_interpolated_surface(**kwargs)
        return json.dumps({"surface": surface}, default=float)

    def plot_surface(self):
        if self.iv_surface_data.empty:
            print("No surface data found.")
            return

        strikes = self.iv_surface_data.index.values
        maturities = self.iv_surface_data.columns.values
        iv_values = self.iv_surface_data.values

        X, Y = np.meshgrid(maturities, strikes)
        Z = iv_values

        from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
        fig = plt.figure(figsize=(14, 10))
        ax = fig.add_subplot(111, projection="3d")
        surf = ax.plot_surface(X, Y, Z, edgecolor="none")

        ax.set_xlabel("Time to Maturity (Years)")
        ax.set_ylabel("Strike Price")
        ax.set_zlabel("Implied Volatility")
        ax.set_title(f"Implied Volatility Surface for {self.ticker}", fontsize=16)

        fig.colorbar(surf, shrink=0.5, aspect=5, label="Implied Volatility")
        plt.tight_layout()
        plt.show()

        # Volatility Smile
        shortest_maturity = float(maturities.min())
        smile_data = self.option_data.loc[
            np.isclose(self.option_data["time_to_maturity"], shortest_maturity, rtol=1e-3)
        ]

        if not smile_data.empty:
            plt.figure(figsize=(10, 6))
            plt.scatter(smile_data["strike"], smile_data["implied_vol"])
            plt.xlabel("Strike Price")
            plt.ylabel("Implied Volatility")
            plt.title(
                f"Volatility Smile (Expiration ≈ {int(shortest_maturity * 365)} days)",
                fontsize=14,
            )
            plt.grid(True, linestyle="--", alpha=0.6)
            plt.show()

# ------------------ Embedded API Server ------------------
try:
    _FLASK_AVAILABLE = True
except Exception:
    _FLASK_AVAILABLE = False

app = None
if _FLASK_AVAILABLE:
    app = Flask(__name__)
    CORS(app)

    _instances = {}

    def _get_instance(ticker: str):
        if ticker not in _instances:
            _instances[ticker] = ImpliedVolatilitySurface(ticker, use_live=False)
            _instances[ticker].generate_surface_data()
        return _instances[ticker]

    @app.route("/api/stock_info", methods=["GET"])
    def api_stock_info():
        """Get comprehensive stock information"""
        ticker = request.args.get("ticker")
        if not ticker:
            return jsonify({"error": "ticker parameter is required"}), 400
        
        # Create a DataFetcher instance
        fetcher = DataFetcher(ticker, use_live=True)
        stock_info = fetcher.fetch_stock_info()
        
        return jsonify({
            "ticker": ticker,
            "stock_info": stock_info
        })

    @app.route("/api/market_data", methods=["GET"])
    def api_market_data():
        ticker = request.args.get("ticker")
        if not ticker:
            return jsonify({"error": "ticker parameter is required"}), 400
            
        ivs = _get_instance(ticker)
        if ivs.option_data.empty:
            return jsonify({"ticker": ticker, "options": []})
        # Ensure we have implied vols; regenerate if missing
        if "implied_vol" not in ivs.option_data.columns or ivs.option_data["implied_vol"].isna().all():
            ivs.generate_surface_data()
        opts = ivs.option_data.copy()
        # JSON safe
        opts["expiration_date"] = opts["expiration_date"].dt.strftime("%Y-%m-%d")
        return jsonify({
            "ticker": ticker,
            "spot": ivs.current_price,
            "options": opts.to_dict(orient="records")
        })

    @app.route("/api/surface", methods=["POST"])
    def api_surface():
        data = request.get_json(force=True)
        ticker = data.get("ticker")
        if not ticker:
            return jsonify({"error": "ticker parameter is required"}), 400
            
        config = data.get("config", {})
        method = config.get("interpolation", "cubic")
        smoothing = int(config.get("smoothing", 50))
        resolution = int(config.get("resolution", 50))
        ivs = _get_instance(ticker)
        surf = ivs.compute_interpolated_surface(method=method, smoothing=smoothing, resolution=resolution)
        if surf is None:
            return jsonify({"error": "No surface data"}), 400
        return jsonify({"surface": surf})

    @app.route("/api/health", methods=["GET"])
    def api_health():
        return jsonify({"status": "ok"})

    @app.route("/api/export_snapshot", methods=["POST"])
    def api_export_snapshot():
        """Enhanced export with multiple formats"""
        data = request.get_json(force=True)
        ticker = data.get("ticker")
        if not ticker:
            return jsonify({"error": "ticker parameter is required"}), 400
            
        format_type = data.get("format", "json")
        include_analysis = data.get("include_analysis", True)
        
        ivs = _get_instance(ticker)
        surf = ivs.compute_interpolated_surface()
        
        if surf is None:
            return jsonify({"error": "No surface data"}), 400
        
        export_data = {
            "surface": surf,
            "timestamp": time.time(),
            "analysis": {
                "arbitrage_clean": len(surf.get("arbitrage_violations", [])) == 0,
                "calibration_quality": surf.get("calibration_metrics", {}),
                "data_points": surf.get("dataPoints", 0)
            } if include_analysis else {}
        }
        
        return jsonify(export_data)

    @app.route("/api/slice_analysis", methods=["POST"])
    def api_slice_analysis():
        """Generate 2D slice data"""
        data = request.get_json(force=True)
        ticker = data.get("ticker")
        if not ticker:
            return jsonify({"error": "ticker parameter is required"}), 400
            
        slice_type = data.get("slice_type", "smile")  # 'smile' or 'term'
        slice_value = data.get("slice_value", 30)
        
        ivs = _get_instance(ticker)
        surf = ivs.compute_interpolated_surface()
        
        if surf is None:
            return jsonify({"error": "No surface data"}), 400
        
        strikes = np.array(surf["strikes"])
        times = np.array(surf["times"])
        grid = np.array(surf["grid"])
        
        if slice_type == "smile":
            # Find closest time (convert days to years)
            target_time = slice_value / 365.25
            time_idx = np.argmin(np.abs(times - target_time))
            
            slice_data = {
                "x": strikes.tolist(),
                "y": grid[:, time_idx].tolist(),
                "type": "smile",
                "value": float(times[time_idx] * 365.25),
                "label": f"{slice_value}D Volatility Smile"
            }
        else:  # term structure
            # Find closest strike
            strike_idx = np.argmin(np.abs(strikes - slice_value))
            
            slice_data = {
                "x": (times * 365.25).tolist(),  # Convert to days
                "y": grid[strike_idx, :].tolist(),
                "type": "term",
                "value": float(strikes[strike_idx]),
                "label": f"${slice_value} Term Structure"
            }
        
        return jsonify({"slice": slice_data})
