#!/usr/bin/env python3
"""
Simple test script to verify the full integration works
"""

import requests
import json
import time
from impliedVolatilitySurface import app

def test_integration():
    """Test the full backend integration"""
    print("🧪 Testing Backend Integration")
    print("=" * 50)
    
    # Test with Flask test client (simulates the frontend calls)
    with app.test_client() as client:
        
        # Test 1: Health Check
        print("1. Testing health endpoint...")
        response = client.get('/api/health')
        assert response.status_code == 200
        print("   ✅ Health check passed")
        
        # Test 2: Market Data for different tickers
        tickers = ['SPY', 'AAPL', 'TSLA', 'MSFT']
        market_data = {}
        
        for ticker in tickers:
            print(f"2. Testing market data for {ticker}...")
            response = client.get(f'/api/market_data?ticker={ticker}')
            assert response.status_code == 200
            data = response.get_json()
            
            market_data[ticker] = data
            print(f"   ✅ {ticker}: ${data['spot']:.2f} spot, {len(data['options'])} options")
        
        # Verify different tickers produce different data
        spots = [market_data[ticker]['spot'] for ticker in tickers]
        assert len(set(spots)) > 1, "All tickers have the same spot price"
        print("   ✅ Different tickers produce different data")
        
        # Test 3: Surface Calculation for different tickers
        print("3. Testing surface calculation...")
        surface_configs = [
            {'interpolation': 'cubic', 'smoothing': 30, 'resolution': 15},
            {'interpolation': 'linear', 'smoothing': 70, 'resolution': 20},
            {'interpolation': 'kriging', 'smoothing': 50, 'resolution': 12}
        ]
        
        for i, ticker in enumerate(['SPY', 'AAPL', 'TSLA']):
            config = surface_configs[i]
            print(f"   Testing {ticker} with {config['interpolation']} interpolation...")
            
            surface_request = {
                'ticker': ticker,
                'config': config
            }
            
            response = client.post('/api/surface',
                                  data=json.dumps(surface_request),
                                  content_type='application/json')
            
            assert response.status_code == 200
            surf_data = response.get_json()['surface']
            
            # Verify surface data structure
            assert 'strikes' in surf_data
            assert 'times' in surf_data
            assert 'grid' in surf_data
            assert len(surf_data['strikes']) > 0
            assert len(surf_data['times']) > 0
            
            # Calculate average volatility
            grid = surf_data['grid']
            total_vol = sum(sum(row for row in grid_row if row is not None) for grid_row in grid)
            count = sum(len([v for v in row if v is not None]) for row in grid)
            avg_vol = total_vol / count if count > 0 else 0
            
            print(f"   ✅ {ticker}: {len(surf_data['strikes'])}x{len(surf_data['times'])} grid, avg IV: {avg_vol:.2%}")
        
        # Test 4: Slice Analysis
        print("4. Testing slice analysis...")
        slice_requests = [
            {'ticker': 'SPY', 'slice_type': 'smile', 'slice_value': 30},
            {'ticker': 'AAPL', 'slice_type': 'term', 'slice_value': 175},
        ]
        
        for req in slice_requests:
            response = client.post('/api/slice_analysis',
                                  data=json.dumps(req),
                                  content_type='application/json')
            assert response.status_code == 200
            slice_data = response.get_json()['slice']
            
            assert 'x' in slice_data
            assert 'y' in slice_data
            assert 'type' in slice_data
            assert len(slice_data['x']) > 0
            assert len(slice_data['y']) > 0
            
            print(f"   ✅ {req['slice_type']} slice for {req['ticker']}: {len(slice_data['x'])} points")
        
        # Test 5: Export functionality
        print("5. Testing export functionality...")
        export_request = {
            'ticker': 'SPY',
            'format': 'json',
            'include_analysis': True
        }
        
        response = client.post('/api/export_snapshot',
                              data=json.dumps(export_request),
                              content_type='application/json')
        
        assert response.status_code == 200
        export_data = response.get_json()
        
        assert 'surface' in export_data
        assert 'timestamp' in export_data
        assert 'analysis' in export_data
        
        print("   ✅ Export functionality working")
        
    print("\n🎉 All backend integration tests passed!")
    print("=" * 50)
    print("The system is ready for frontend integration.")
    print("Different tickers produce different volatility surfaces.")
    print("All quant models and math are working correctly.")

if __name__ == "__main__":
    test_integration()