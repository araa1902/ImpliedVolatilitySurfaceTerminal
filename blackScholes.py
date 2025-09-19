import numpy as np
from scipy.stats import norm
from scipy.optimize import brentq


class BlackScholes:
    """
    Black-Scholes pricing and implied volatility methods.
    """

    @staticmethod
    def price(S, K, T, r, sigma, option_type):
        if T <= 0:
            if option_type.lower() == "call":
                return max(S - K, 0.0)
            elif option_type.lower() == "put":
                return max(K - S, 0.0)
        d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        if option_type.lower() == "call":
            return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        elif option_type.lower() == "put":
            return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

    @staticmethod
    def implied_volatility(market_price, S, K, T, r, option_type):
        if T <= 0 or S <= 0 or K <= 0 or market_price <= 0:
            return np.nan

        def price_diff(sigma):
            return BlackScholes.price(S, K, T, r, sigma, option_type) - market_price

        try:
            return brentq(price_diff, 1e-5, 5.0, maxiter=100, disp=False)
        except (ValueError, RuntimeError):
            return np.nan


# Convenience free functions
def black_scholes_price(S, K, T, r, sigma, option_type="call"):
    return BlackScholes.price(S, K, T, r, sigma, option_type)


def implied_volatility(market_price, S, K, T, r, option_type="call"):
    return BlackScholes.implied_volatility(market_price, S, K, T, r, option_type)
