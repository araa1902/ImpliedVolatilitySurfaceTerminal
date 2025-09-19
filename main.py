from impliedVolatilitySurface import ImpliedVolatilitySurface


def main(ticker_symbol):
    risk_free_rate_value = 0.04
    use_live = False

    surface_generator = ImpliedVolatilitySurface(
        ticker=ticker_symbol,
        risk_free_rate=risk_free_rate_value,
        use_live=use_live,
    )

    surface_generator.generate_surface_data()
    surface_generator.plot_surface()


if __name__ == "__main__":
    main("SPY")
