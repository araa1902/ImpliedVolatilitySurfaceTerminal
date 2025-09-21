# This API fetches data from freeoptionschain API: https://github.com/benjamincham/freeoptionschain
import pandas as pd
from datetime import datetime, timedelta
import warnings
from FOC import FOC, OptionType
import numpy as np
import time
import requests
from typing import Dict, Optional
import json

warnings.simplefilter(action="ignore", category=FutureWarning)

# Simple in-memory cache
_STOCK_INFO_CACHE = {}
_CACHE_EXPIRY_MINUTES = 5

class DataFetcher:
    """
    Retrieves option data (live via FOC or synthetic fallback) and stock info via Twelve Data API.
    """

    def __init__(self, ticker: str, use_live: bool = False, max_expirations: int = 6):
        self.ticker = ticker
        self.use_live = use_live
        self.max_expirations = max_expirations
        self.last_request_time = 0
        self.min_request_interval = 1.0  # Minimum 1 second between requests
        self.twelve_data_api_key = "0df69dce9d184e34a7b477c9e9a224d3"
        self.twelve_data_base_url = "https://api.twelvedata.com"

    def _rate_limit(self):
        """Implement rate limiting to avoid hitting API limits."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            time.sleep(sleep_time)
        self.last_request_time = time.time()

    def _get_cached_stock_info(self, ticker: str) -> Optional[Dict]:
        """Get cached stock info if available and not expired."""
        cache_key = f"stock_info_{ticker}"
        if cache_key in _STOCK_INFO_CACHE:
            cached_data, timestamp = _STOCK_INFO_CACHE[cache_key]
            if datetime.now() - timestamp < timedelta(minutes=_CACHE_EXPIRY_MINUTES):
                print(f"Using cached data for {ticker}")
                return cached_data
        # Return fallback stock info instead of option data when there's an error
        return self._fallback_stock_info()

    def _cache_stock_info(self, ticker: str, data: Dict):
        """Cache stock info data."""
        cache_key = f"stock_info_{ticker}"
        _STOCK_INFO_CACHE[cache_key] = (data, datetime.now())

    def _fetch_from_twelve_data(self, ticker: str) -> Optional[Dict]:
        """
        Fetch comprehensive stock data from Twelve Data API using minimal calls.
        Returns a dictionary with stock information.
        """
        try:
            self._rate_limit()
            
            # Single API call to get comprehensive real-time data including statistics
            url = f"{self.twelve_data_base_url}/quote"
            params = {
                "symbol": ticker,
                "apikey": self.twelve_data_api_key,
                "format": "JSON"
            }
            
            print(f"Fetching real-time data for {ticker} from Twelve Data...")
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code != 200:
                print(f"Twelve Data API error: {response.status_code} - {response.text}")
                return None
                
            quote_data = response.json()
            
            # Check for API errors
            if "status" in quote_data and quote_data["status"] == "error":
                print(f"Twelve Data API error: {quote_data.get('message', 'Unknown error')}")
                return None
            
            # Get additional company profile data in a second call
            profile_url = f"{self.twelve_data_base_url}/profile"
            profile_params = {
                "symbol": ticker,
                "apikey": self.twelve_data_api_key,
                "format": "JSON"
            }
            
            profile_data = {}
            try:
                self._rate_limit()
                profile_response = requests.get(profile_url, params=profile_params, timeout=10)
                if profile_response.status_code == 200:
                    profile_data = profile_response.json()
                    if "status" in profile_data and profile_data["status"] == "error":
                        profile_data = {}
            except Exception as e:
                print(f"Profile data fetch failed: {e}")
                profile_data = {}
            
            # Get historical data for performance calculations (1 month)
            hist_url = f"{self.twelve_data_base_url}/time_series"
            hist_params = {
                "symbol": ticker,
                "interval": "1day",
                "outputsize": 30,  # Last 30 days
                "apikey": self.twelve_data_api_key,
                "format": "JSON"
            }
            
            historical_data = {}
            try:
                self._rate_limit()
                hist_response = requests.get(hist_url, params=hist_params, timeout=10)
                if hist_response.status_code == 200:
                    historical_data = hist_response.json()
                    if "status" in historical_data and historical_data["status"] == "error":
                        historical_data = {}
            except Exception as e:
                print(f"Historical data fetch failed: {e}")
                historical_data = {}
            
            # Parse quote data
            current_price = float(quote_data.get("close", 0))
            if current_price == 0:
                print(f"No valid price data for {ticker}")
                return None
            
            previous_close = float(quote_data.get("previous_close", current_price))
            day_change = current_price - previous_close
            day_change_percent = (day_change / previous_close * 100) if previous_close > 0 else 0
            
            # Calculate performance metrics from historical data
            week_change = 0
            month_change = 0
            ytd_change = 0
            annual_vol = 20.0  # Default
            
            if "values" in historical_data and historical_data["values"]:
                prices = [float(day["close"]) for day in historical_data["values"] if day.get("close")]
                if len(prices) >= 2:
                    # Week change (5 trading days)
                    if len(prices) >= 5:
                        week_start_price = prices[4]  # 5 days ago
                        week_change = ((current_price - week_start_price) / week_start_price) * 100
                    
                    # Month change
                    month_start_price = prices[-1]  # Oldest price in our 30-day window
                    month_change = ((current_price - month_start_price) / month_start_price) * 100
                    
                    # Calculate volatility
                    returns = []
                    for i in range(1, len(prices)):
                        ret = (prices[i-1] - prices[i]) / prices[i]
                        returns.append(ret)
                    
                    if returns:
                        daily_vol = np.std(returns)
                        annual_vol = daily_vol * np.sqrt(252) * 100
            
            # YTD calculation (approximate)
            ytd_change = month_change * 2  # Rough estimate if we don't have year-start data
            
            # Parse company profile data
            company_name = profile_data.get("name", ticker)
            sector = profile_data.get("sector", "N/A")
            industry = profile_data.get("industry", "N/A")
            market_cap = profile_data.get("market_cap", 0)
            employees = profile_data.get("employees", 0)
            
            # Get exchange from quote data
            exchange = quote_data.get("exchange", "NASDAQ")
            
            # Generate analyst targets (Twelve Data doesn't provide this in free tier)
            target_mean = current_price * 1.1  # 10% upside assumption
            target_high = current_price * 1.3
            target_low = current_price * 0.8
            
            return {
                "symbol": ticker,
                "company_name": company_name,
                "sector": sector,
                "industry": industry,
                "market_cap": market_cap,
                "enterprise_value": market_cap,  # Approximation
                "price_data": {
                    "current_price": current_price,
                    "previous_close": previous_close,
                    "open": float(quote_data.get("open", current_price)),
                    "day_high": float(quote_data.get("high", current_price)),
                    "day_low": float(quote_data.get("low", current_price)),
                    "week_52_high": float(quote_data.get("fifty_two_week", {}).get("high", current_price * 1.2)),
                    "week_52_low": float(quote_data.get("fifty_two_week", {}).get("low", current_price * 0.8)),
                },
                "performance": {
                    "ytd_change": ytd_change,
                    "month_change": month_change,
                    "week_change": week_change,
                    "day_change_percent": day_change_percent,
                    "day_change": day_change,
                },
                "volatility": {
                    "daily_volatility": annual_vol / np.sqrt(252),
                    "annual_volatility": annual_vol,
                    "beta": 1.0,  # Default, would need additional API call
                },
                "volume": {
                    "current_volume": int(quote_data.get("volume", 0)),
                    "avg_volume": int(quote_data.get("average_volume", quote_data.get("volume", 0))),
                    "volume_ratio": 1.0,  # Would need historical volume data
                },
                "fundamentals": {
                    "pe_ratio": float(quote_data.get("pe", 0)),
                    "forward_pe": 0,  # Not available in quote endpoint
                    "price_to_book": 0,  # Not available in quote endpoint
                    "price_to_sales": 0,  # Not available in quote endpoint
                    "dividend_yield": float(quote_data.get("dividend_yield", 0)),
                    "peg_ratio": 0,  # Not available in quote endpoint
                },
                "analyst_data": {
                    "target_high": target_high,
                    "target_low": target_low,
                    "target_mean": target_mean,
                    "recommendation": "hold",  # Default
                    "number_of_analysts": 0,  # Not available in free tier
                },
                "last_updated": datetime.now().isoformat(),
                "currency": quote_data.get("currency", "USD"),
                "exchange": exchange,
                "timezone": quote_data.get("timezone", "America/New_York"),
                "data_source": "twelve_data",
                "is_live_data": True,
            }
            
        except requests.exceptions.RequestException as e:
            print(f"Twelve Data API request failed for {ticker}: {e}")
            return None
        except Exception as e:
            print(f"Twelve Data API error for {ticker}: {e}")
            return None

    def _fetch_from_alpha_vantage(self, ticker: str) -> Optional[Dict]:
        """
        Fetch stock data from Alpha Vantage API (backup option).
        """
        try:
            # For demo purposes, we'll simulate this API call
            print(f"Alpha Vantage API not configured, skipping for {ticker}")
            return None
        except Exception as e:
            print(f"Alpha Vantage API error for {ticker}: {e}")
            return None

    def _fetch_from_financial_modeling_prep(self, ticker: str) -> Optional[Dict]:
        """
        Fetch from Financial Modeling Prep API (alternative source).
        """
        try:
            print(f"Financial Modeling Prep API not configured, skipping for {ticker}")
            return None
        except Exception as e:
            print(f"Financial Modeling Prep API error for {ticker}: {e}")
            return None

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
                        return self._synthetic_option_data()
                
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
                now = pd.Timestamp(datetime.now())
                # Ensure expiration_date is datetime type and handle possible NaT values
                option_data["expiration_date"] = pd.to_datetime(option_data["expiration_date"])
                # Use pandas vectorized operations with to_numpy() to avoid type issues
                option_data["time_to_maturity"] = (
                    (pd.to_datetime(option_data["expiration_date"]) - now).dt.total_seconds() / (365.25 * 24 * 3600)
                )

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
                
                # Always ensure a DataFrame is returned by explicitly creating a DataFrame
                if len(available_cols) > 1:
                    result_df = pd.DataFrame(option_data[available_cols]).reset_index(drop=True)
                else:
                    result_df = pd.DataFrame(option_data[[available_cols[0]]]).reset_index(drop=True)
                
                return current_price, result_df

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

        # Ticker-specific parameters with more comprehensive coverage
        ticker_params = {
            'SPY': {'price': 420.0, 'base_vol': 0.18, 'vol_of_vol': 0.25},
            'QQQ': {'price': 350.0, 'base_vol': 0.22, 'vol_of_vol': 0.30},
            'IWM': {'price': 180.0, 'base_vol': 0.28, 'vol_of_vol': 0.35},
            'AAPL': {'price': 175.0, 'base_vol': 0.25, 'vol_of_vol': 0.35},
            'MSFT': {'price': 350.0, 'base_vol': 0.23, 'vol_of_vol': 0.28},
            'GOOGL': {'price': 140.0, 'base_vol': 0.24, 'vol_of_vol': 0.32},
            'TSLA': {'price': 200.0, 'base_vol': 0.40, 'vol_of_vol': 0.50},
            'NVDA': {'price': 450.0, 'base_vol': 0.35, 'vol_of_vol': 0.45},
            'META': {'price': 300.0, 'base_vol': 0.28, 'vol_of_vol': 0.38},
            'AMZN': {'price': 140.0, 'base_vol': 0.26, 'vol_of_vol': 0.33},
            'BTC-USD': {'price': 45000.0, 'base_vol': 0.60, 'vol_of_vol': 0.80},
            'ETH-USD': {'price': 2500.0, 'base_vol': 0.70, 'vol_of_vol': 0.90},
        }
        
        # Default parameters for unknown tickers
        default_params = {'price': 100.0, 'base_vol': 0.20, 'vol_of_vol': 0.30}
        params = ticker_params.get(self.ticker, default_params)
        
        # If ticker not in predefined list, generate reasonable defaults based on ticker characteristics
        if self.ticker not in ticker_params:
            # Adjust default price based on ticker patterns
            if 'USD' in self.ticker or 'BTC' in self.ticker or 'ETH' in self.ticker:
                # Crypto patterns
                params = {'price': 30000.0, 'base_vol': 0.50, 'vol_of_vol': 0.70}
            elif len(self.ticker) <= 3:
                # Likely an ETF or major stock
                params = {'price': 150.0, 'base_vol': 0.22, 'vol_of_vol': 0.30}
            else:
                # Individual stock
                params = {'price': 75.0, 'base_vol': 0.25, 'vol_of_vol': 0.35}
        
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
                mid_price = black_scholes_price(S0, K, T, r, sigma, option_type="call")
                mid = float(mid_price) if mid_price is not None else 0.0
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

    def fetch_stock_info(self) -> dict:
        """
        Retrieve comprehensive stock information using Twelve Data API with fallbacks.
        Returns a dictionary with company info, financial metrics, and market data.
        """
        # Check cache first
        cached_data = self._get_cached_stock_info(self.ticker)
        if cached_data:
            return cached_data

        # Try multiple data sources in order of preference
        stock_data = None
        data_source = "unknown"
        
        # 1. Try Twelve Data API first (primary source)
        try:
            stock_data = self._fetch_from_twelve_data(self.ticker)
            if stock_data:
                data_source = "twelve_data"
                print(f"Successfully fetched real data for {self.ticker} from Twelve Data")
        except Exception as e:
            print(f"Twelve Data failed for {self.ticker}: {e}")

        # 2. Try Alpha Vantage (if configured)
        if not stock_data:
            try:
                stock_data = self._fetch_from_alpha_vantage(self.ticker)
                if stock_data:
                    data_source = "alpha_vantage"
                    print(f"Successfully fetched data for {self.ticker} from Alpha Vantage")
            except Exception as e:
                print(f"Alpha Vantage failed for {self.ticker}: {e}")

        # 3. Try Financial Modeling Prep (if configured)
        if not stock_data:
            try:
                stock_data = self._fetch_from_financial_modeling_prep(self.ticker)
                if stock_data:
                    data_source = "financial_modeling_prep"
                    print(f"Successfully fetched data for {self.ticker} from Financial Modeling Prep")
            except Exception as e:
                print(f"Financial Modeling Prep failed for {self.ticker}: {e}")

        # 4. Fallback to enhanced synthetic data
        if not stock_data:
            print(f"All real data sources failed for {self.ticker}, using enhanced synthetic data")
            stock_data = self._fallback_stock_info()
            data_source = "synthetic_fallback"

        # Add metadata about data source
        stock_data["data_source"] = data_source
        stock_data["is_live_data"] = data_source not in ["synthetic_fallback"]
        
        # Cache the result
        if stock_data:
            self._cache_stock_info(self.ticker, stock_data)
            
        return stock_data

    def _fallback_stock_info(self) -> dict:
        """
        Returns basic fallback stock info when all APIs fail.
        """
        # Get synthetic price from our existing method
        spot_price, _ = self._synthetic_option_data()
        
        # Generate more realistic company info based on ticker
        company_info = self._generate_company_info()
        
        return {
            "symbol": self.ticker,
            "company_name": company_info["name"],
            "sector": company_info["sector"],
            "industry": company_info["industry"],
            "market_cap": 0,
            "enterprise_value": 0,
            "data_source": "synthetic_fallback",
            "is_live_data": False,
            "price_data": {
                "current_price": spot_price,
                "previous_close": spot_price * 0.99,
                "open": spot_price * 1.01,
                "day_high": spot_price * 1.02,
                "day_low": spot_price * 0.98,
                "week_52_high": spot_price * 1.25,
                "week_52_low": spot_price * 0.75,
            },
            "performance": {
                "ytd_change": 5.5,
                "month_change": 2.1,
                "week_change": -0.8,
                "day_change_percent": -1.0,
                "day_change": -spot_price * 0.01,
            },
            "volatility": {
                "daily_volatility": 1.8,
                "annual_volatility": 28.5,
                "beta": 1.2,
            },
            "volume": {
                "current_volume": 1500000,
                "avg_volume": 1200000,
                "volume_ratio": 1.25,
            },
            "fundamentals": {
                "pe_ratio": 22.5,
                "forward_pe": 18.2,
                "price_to_book": 3.8,
                "price_to_sales": 5.2,
                "dividend_yield": 1.8,
                "peg_ratio": 1.5,
            },
            "analyst_data": {
                "target_high": spot_price * 1.3,
                "target_low": spot_price * 0.8,
                "target_mean": spot_price * 1.1,
                "recommendation": "buy",
                "number_of_analysts": 12,
            },
            "last_updated": datetime.now().isoformat(),
            "currency": "USD",
            "exchange": company_info["exchange"],
            "timezone": "America/New_York",
        }

    def _generate_company_info(self) -> dict:
        """Generate realistic company info based on ticker."""
        known_companies = {
            'AAPL': {'name': 'Apple Inc.', 'sector': 'Technology', 'industry': 'Consumer Electronics', 'exchange': 'NASDAQ'},
            'MSFT': {'name': 'Microsoft Corporation', 'sector': 'Technology', 'industry': 'Software', 'exchange': 'NASDAQ'},
            'GOOGL': {'name': 'Alphabet Inc.', 'sector': 'Communication Services', 'industry': 'Internet Content', 'exchange': 'NASDAQ'},
            'TSLA': {'name': 'Tesla, Inc.', 'sector': 'Consumer Cyclical', 'industry': 'Auto Manufacturers', 'exchange': 'NASDAQ'},
            'NVDA': {'name': 'NVIDIA Corporation', 'sector': 'Technology', 'industry': 'Semiconductors', 'exchange': 'NASDAQ'},
            'META': {'name': 'Meta Platforms, Inc.', 'sector': 'Communication Services', 'industry': 'Internet Content', 'exchange': 'NASDAQ'},
            'AMZN': {'name': 'Amazon.com, Inc.', 'sector': 'Consumer Cyclical', 'industry': 'Internet Retail', 'exchange': 'NASDAQ'},
            'SPY': {'name': 'SPDR S&P 500 ETF Trust', 'sector': 'Financial Services', 'industry': 'Exchange Traded Fund', 'exchange': 'NYSE'},
            'QQQ': {'name': 'Invesco QQQ Trust', 'sector': 'Financial Services', 'industry': 'Exchange Traded Fund', 'exchange': 'NASDAQ'},
            'IWM': {'name': 'iShares Russell 2000 ETF', 'sector': 'Financial Services', 'industry': 'Exchange Traded Fund', 'exchange': 'NYSE'},
        }
        
        if self.ticker in known_companies:
            return known_companies[self.ticker]
        
        # Generate default info for unknown tickers
        return {
            'name': f'{self.ticker} Corporation',
            'sector': 'Technology',
            'industry': 'Software',
            'exchange': 'NASDAQ' if len(self.ticker) <= 4 else 'NYSE'
        }

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
