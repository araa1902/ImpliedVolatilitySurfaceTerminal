#!/usr/bin/env python3
"""
Flask server for Implied Volatility Surface Construction
"""

from impliedVolatilitySurface import app
import sys
import os

if __name__ == "__main__":
    # Set environment variables for development
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    host = '127.0.0.1'  # localhost only for security
    
    print(f"Starting Implied Volatility Surface API server...")
    print(f"Server running at: http://{host}:{port}")
    print(f"API endpoints available:")
    print(f"  - GET  /api/health")
    print(f"  - GET  /api/market_data?ticker=SPY")
    print(f"  - GET  /api/stock_info?ticker=SPY")
    print(f"  - POST /api/surface")
    print(f"  - POST /api/slice_analysis")
    print(f"  - POST /api/export_snapshot")
    print()
    
    try:
        app.run(host=host, port=port, debug=True, threaded=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")
        sys.exit(1)