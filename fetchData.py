# This API fetches data from freeoptionschain API: https://github.com/benjamincham/freeoptionschain
import pandas as pd
from datetime import datetime
import warnings
from FOC import FOC, OptionType
import numpy as np

warnings.simplefilter(action="ignore", category=FutureWarning)


class DataFetcher:
    """
    Retrieves option data (live via yfinance or synthetic fallback).
    """

    def __init__(self, ticker: str, use_live: bool = False, max_expirations: int = 6):
        self.ticker = ticker
        self.use_live = use_live
        self.max_expirations = max_expirations

    def fetch_option_data(self) -> tuple[float, pd.DataFrame]:
        """
        Returns (spot_price, option_data DataFrame).
        """
        if self.use_live:
            try:
                # Create instance of freeoptionschain
                ref_FOC = FOC()
                
                # Get expiration dates for the ticker
                expiration_dates = ref_FOC.get_expiration_dates(self.ticker)
                
                if not expiration_dates or len(expiration_dates) == 0:
                    print(f"No expiration dates found for {self.ticker}, using synthetic data")
                    return self._synthetic_option_data()
                
                # Limit to max_expirations
                expiration_dates = expiration_dates[:self.max_expirations]
                
                all_chains = pd.DataFrame()
                current_price = None
                
                for exp_date in expiration_dates:
                    try:
                        # Fetch CALL options for this expiration date
                        call_chain = ref_FOC.get_options_chain(self.ticker, exp_date, OptionType.CALL)
                        
                        if call_chain and len(call_chain) > 0:
                            # Convert to DataFrame if it's not already
                            if not isinstance(call_chain, pd.DataFrame):
                                call_df = pd.DataFrame(call_chain)
                            else:
                                call_df = call_chain.copy()
                            
                            # Add metadata
                            call_df["option_type"] = "call"
                            call_df["expiration_date"] = pd.to_datetime(exp_date)
                            
                            # Get current price from the first option if not already set
                            if current_price is None and 'underlying_price' in call_df.columns:
                                current_price = float(call_df['underlying_price'].iloc[0])
                            elif current_price is None and 'stock_price' in call_df.columns:
                                current_price = float(call_df['stock_price'].iloc[0])
                            
                            all_chains = pd.concat([all_chains, call_df], ignore_index=True)
                            
                    except Exception as e:
                        print(f"Error fetching options for {exp_date}: {e}")
                        continue
                
                if all_chains.empty:
                    print(f"No valid options data found for {self.ticker}, using synthetic data")
                    return self._synthetic_option_data()
                
                # If we couldn't get current price from options data, estimate it
                if current_price is None:
                    # Use ATM strike as approximation
                    if 'strike' in all_chains.columns:
                        current_price = float(all_chains['strike'].median())
                    else:
                        current_price = 100.0
                
                # Filter for valid options with volume and bid/ask
                option_data = all_chains[
                    (all_chains.get("volume", 0) > 0)
                    & (all_chains.get("bid", 0) > 0)
                    & (all_chains.get("ask", 0) > 0)
                ].copy()

                if option_data.empty:
                    print(f"No options with volume/bid/ask found for {self.ticker}, using synthetic data")
                    return self._synthetic_option_data()

                # Calculate mid price
                option_data["mid_price"] = (option_data["bid"] + option_data["ask"]) / 2.0
                
                # Calculate time to maturity
                now = datetime.now()
                option_data["time_to_maturity"] = (
                    option_data["expiration_date"] - now
                ).dt.total_seconds() / (365.25 * 24 * 3600)

                # Select relevant columns
                cols = [
                    "strike",
                    "bid", 
                    "ask",
                    "volume",
                    "option_type",
                    "expiration_date",
                    "mid_price",
                    "time_to_maturity",
                ]
                
                # Only include columns that exist
                available_cols = [col for col in cols if col in option_data.columns]
                
                return current_price, option_data[available_cols].reset_index(drop=True)

            except Exception as e:
                print(f"Error fetching live data for {self.ticker}: {e}")
                return self._synthetic_option_data()

        # Fallback if live mode not enabled or fails
        return self._synthetic_option_data()

    def _synthetic_option_data(self) -> tuple[float, pd.DataFrame]:
        """
        Generates a synthetic but realistic option chain for testing/demo.
        """
        from blackScholes import black_scholes_price

        # Ticker-specific parameters
        ticker_params = {
            'SPY': {'price': 420.0, 'base_vol': 0.18, 'vol_of_vol': 0.25},
            'QQQ': {'price': 350.0, 'base_vol': 0.22, 'vol_of_vol': 0.30},
            'AAPL': {'price': 175.0, 'base_vol': 0.25, 'vol_of_vol': 0.35},
            'MSFT': {'price': 350.0, 'base_vol': 0.23, 'vol_of_vol': 0.28},
            'GOOGL': {'price': 140.0, 'base_vol': 0.24, 'vol_of_vol': 0.32},
            'TSLA': {'price': 200.0, 'base_vol': 0.40, 'vol_of_vol': 0.50},
            'NVDA': {'price': 450.0, 'base_vol': 0.35, 'vol_of_vol': 0.45},
            'META': {'price': 300.0, 'base_vol': 0.28, 'vol_of_vol': 0.38},
        }
        
        params = ticker_params.get(self.ticker, {'price': 100.0, 'base_vol': 0.20, 'vol_of_vol': 0.30})
        S0 = params['price']
        base_vol = params['base_vol']
        vol_of_vol = params['vol_of_vol']
        
        r = 0.02
        # Generate strikes around current price
        strike_range = S0 * 0.4  # ±40% around spot
        strikes = np.linspace(S0 - strike_range, S0 + strike_range, 13)
        maturities = np.array([15, 30, 60, 120, 240]) / 365.25
        rows = []
        now = datetime.now()

        def sigma_surface(k, t):
            moneyness = (k / S0) - 1.0
            # Ticker-specific volatility surface
            return base_vol + 0.10 * (1 - np.exp(-t * 3)) + vol_of_vol * (moneyness**2)

        for T in maturities:
            exp_date = now + pd.Timedelta(days=T * 365.25)
            for K in strikes:
                sigma = float(sigma_surface(K, T))
                mid = float(black_scholes_price(S0, K, T, r, sigma, option_type="call"))
                spread = max(0.05, 0.002 * K)
                bid = max(0.01, mid - spread / 2)
                ask = mid + spread / 2
                volume = int(max(1, (1 - abs((K - S0) / 40)) * 400))

                rows.append(
                    {
                        "strike": K,
                        "bid": bid,
                        "ask": ask,
                        "volume": volume,
                        "option_type": "call",
                        "expiration_date": exp_date,
                        "mid_price": mid,
                        "time_to_maturity": T,
                    }
                )

        df = pd.DataFrame(rows)
        return S0, df

    @staticmethod
    def format_for_json(df: pd.DataFrame) -> list[dict]:
        """
        Utility to convert option chain to JSON-safe list.
        """
        if df.empty:
            return []
        out = []
        for _, r in df.iterrows():
            out.append({
                "strike": float(r["strike"]),
                "bid": float(r.get("bid", 0)),
                "ask": float(r.get("ask", 0)),
                "volume": int(r.get("volume", 0)),
                "option_type": r.get("option_type", "call"),
                "expiration_date": str(r.get("expiration_date")),
                "mid_price": float(r.get("mid_price", 0)),
                "time_to_maturity": float(r.get("time_to_maturity", 0))
            })
        return out
