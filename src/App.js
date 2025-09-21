import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { notification } from 'antd';
import Header from './components/Header';
import DataPanel from './components/DataPanel';
import VolatilitySurface from './components/VolatilitySurface';
import MarketData from './components/MarketData';
import ControlPanel from './components/ControlPanel';

const AppContainer = styled.div`
  height: 100vh;
  background: var(--bg-terminal);
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: ${props => `${props.leftWidth}px 6px 1fr 6px ${props.rightWidth}px`};
  grid-template-rows: 1fr;
  gap: 0;
  background: var(--bg-terminal);
  flex: 1;
  min-height: 0;
  border-top: 1px solid var(--border-secondary);
`;

const LeftPanel = styled.div`
  background: var(--bg-panel);
  border-right: 2px solid var(--border-secondary);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const CenterPanel = styled.div`
  background: var(--bg-terminal);
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: 1px solid var(--border-secondary);
  border-right: 1px solid var(--border-secondary);
`;

const RightPanel = styled.div`
  background: var(--bg-panel);
  border-left: 2px solid var(--border-secondary);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SurfaceContainer = styled.div`
  flex: 1;
  padding: 16px;
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

// Add a resizer between grid columns
const Resizer = styled.div`
  width: 4px;
  cursor: col-resize;
  background: var(--border-secondary);
  border-left: 1px solid var(--bloomberg-orange);
  border-right: 1px solid var(--bloomberg-orange);
  transition: background 0.1s ease;
  
  &:hover {
    background: var(--bloomberg-orange);
  }
`;

// Quick toast helper replacing antd message/notification
const toast = {
  success: (msg) => console.log('✅', msg),
  warning: (msg) => console.warn('⚠️', msg),
  error: (msg) => console.error('❌', msg),
  info: (msg) => console.info('ℹ️', msg),
};

function App() {
  const [marketData, setMarketData] = useState([]);
  const [surfaceData, setSurfaceData] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  // Link state for synchronized context
  const [isLinked, setIsLinked] = useState(true);

  // Resizable panels
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(340);
  const draggingRef = useRef(null); // 'left' | 'right' | null
  const containerRef = useRef(null);

  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [surfaceConfig, setSurfaceConfig] = useState({
    smoothing: 50,
    interpolation: 'cubic',
    showContours: true,
    colorScheme: 'viridis',
    resolution: 50
  });
  
  const wsRef = useRef(null);
  const dataIntervalRef = useRef(null);
  const backendUrl = useRef(process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'); // configurable backend base

  // Toast utility using antd notifications
  const toast = {
    success: (message) => notification.success({ message, placement: 'topRight', duration: 3 }),
    error: (message) => notification.error({ message, placement: 'topRight', duration: 4 }),
    warning: (message) => notification.warning({ message, placement: 'topRight', duration: 3 }),
    info: (message) => notification.info({ message, placement: 'topRight', duration: 3 })
  };

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('volatility-surface-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setSurfaceConfig(prev => ({ ...prev, ...config }));
        setSelectedSymbol(config.selectedSymbol || 'SPY');
      } catch (error) {
        console.warn('Failed to load saved configuration:', error);
      }
    }
  }, []);

  // Save configuration when it changes
  useEffect(() => {
    const configToSave = { ...surfaceConfig, selectedSymbol };
    localStorage.setItem('volatility-surface-config', JSON.stringify(configToSave));
  }, [surfaceConfig, selectedSymbol]);

  // MOVE generateMockData BEFORE fetchMarketData to fix initialization order
  const generateMockData = useCallback(() => {
    try {
      const basePrice = { 
        'SPY': 400, 'QQQ': 350, 'IWM': 180, 'AAPL': 175, 
        'MSFT': 350, 'GOOGL': 140, 'TSLA': 200, 'NVDA': 450 
      }[selectedSymbol] || 400;
      
      const strikes = Array.from({length: 15}, (_, i) => basePrice * (0.8 + i * 0.04));
      const expirations = ['2024-01-19', '2024-02-16', '2024-03-15', '2024-04-19', '2024-06-21'];
      
      const data = [];
      strikes.forEach(strike => {
        expirations.forEach((expiry, expIndex) => {
          const timeToExpiry = (expIndex + 1) * 0.25;
          const moneyness = Math.log(basePrice / strike);
          
          // More realistic volatility smile
          const baseVol = 0.2 + 0.1 * Math.exp(-timeToExpiry);
          const skew = 0.05 * moneyness;
          const smile = 0.02 * moneyness * moneyness;
          const impliedVol = Math.max(0.05, baseVol + skew + smile + (Math.random() - 0.5) * 0.02);
          
          // Black-Scholes approximation for option prices
          const callPrice = Math.max(0.01, basePrice * 0.1 * impliedVol * Math.sqrt(timeToExpiry) + Math.max(0, basePrice - strike));
          const putPrice = Math.max(0.01, basePrice * 0.1 * impliedVol * Math.sqrt(timeToExpiry) + Math.max(0, strike - basePrice));
          
          data.push({
            key: `${strike.toFixed(0)}-${expiry}`,
            strike: strike,
            expiry,
            timeToExpiry,
            callPrice,
            putPrice,
            impliedVol,
            delta: Math.random() * 0.8 + 0.1,
            gamma: Math.random() * 0.01 + 0.001,
            theta: -(Math.random() * 0.1 + 0.01),
            vega: Math.random() * 0.2 + 0.05,
            volume: Math.floor(Math.random() * 1000),
            openInterest: Math.floor(Math.random() * 5000)
          });
        });
      });
      
      setMarketData(data);
      setError(null);
    } catch (error) {
      setError('Failed to process market data');
      console.error('Data generation error:', error);
    }
  }, [selectedSymbol]);

  // FETCH MARKET DATA (backend first, fallback to mock) - now generateMockData is defined
  const fetchMarketData = useCallback(async (symbol = selectedSymbol) => {
    try {
      const res = await fetch(`${backendUrl.current}/api/market_data?ticker=${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json && json.options) {
        const rows = json.options.map(o => ({
          key: `${o.strike}-${o.expiration_date}`,
            strike: o.strike,
            expiry: o.expiration_date,
            timeToExpiry: o.time_to_maturity,
            callPrice: o.mid_price, // call-only synthetic
            putPrice: o.mid_price,  // placeholder if only calls
            impliedVol: o.estimated_iv ?? o.implied_vol ?? null,
            delta: null,
            gamma: null,
            theta: null,
            vega: null,
            volume: o.volume,
            openInterest: o.open_interest ?? 0
        }));
        setMarketData(rows);
        setError(null);
        setLastUpdate(new Date());
        return true;
      }
      throw new Error('Malformed response');
    } catch (e) {
      console.warn('Backend market data failed, using mock. Reason:', e.message);
      generateMockData(); // now this is defined
      return false;
    }
  }, [selectedSymbol, generateMockData]); // generateMockData defined earlier

  // SURFACE CALCULATION via backend
  const handleCalculateSurface = useCallback(async (params = {}) => {
    if (marketData.length === 0) {
      toast.warning('No market data available');
      return;
    }
    const cfg = { ...surfaceConfig, ...params };
    setIsCalculating(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl.current}/api/surface`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: selectedSymbol, config: cfg })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (!json || !json.surface) throw new Error('Malformed surface response');
      const s = json.surface;
      setSurfaceData({
        strikes: s.strikes,
        times: s.times,
        volatilities: s.grid,
        rawPoints: s.points,
        config: cfg,
        timestamp: new Date(s.timestamp),
        symbol: selectedSymbol,
        dataPoints: s.points.length
      });
      toast.success('Surface calculated');
    } catch (e) {
      console.warn('Backend surface failed, falling back. Reason:', e.message);
      // Fallback to original mock calculation block
      try {
        // Simulate complex surface calculation with progress
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const strikes = Array.from({length: 25}, (_, i) => 
          Math.min(...marketData.map(d => d.strike)) + i * 
          (Math.max(...marketData.map(d => d.strike)) - Math.min(...marketData.map(d => d.strike))) / 24
        );
        
        const times = Array.from({length: 20}, (_, i) => 0.05 + i * 0.15);
        
        // Enhanced volatility surface with realistic term structure
        const z = strikes.map(strike => 
          times.map(time => {
            const basePrice = { 
              'SPY': 400, 'QQQ': 350, 'IWM': 180, 'AAPL': 175, 
              'MSFT': 350, 'GOOGL': 140, 'TSLA': 200, 'NVDA': 450 
            }[selectedSymbol] || 400;
            const moneyness = Math.log(basePrice / strike);
            const termStructure = 0.15 + 0.05 * Math.sqrt(time);
            const skew = 0.03 * moneyness / Math.sqrt(time + 0.1);
            const smile = 0.02 * moneyness * moneyness / (time + 0.1);
            
            return Math.max(0.05, 
              termStructure + skew + smile + 
              (Math.random() - 0.5) * 0.01 * (1 + surfaceConfig.smoothing / 100)
            );
          })
        );

        setSurfaceData({
          strikes,
          times,
          volatilities: z,
          config: surfaceConfig,
          timestamp: new Date(),
          symbol: selectedSymbol,
          dataPoints: marketData.length
        });
        
      } catch (error) {
        setError('Surface calculation failed');
        toast.error('Failed to calculate volatility surface. Please try again.');
      }
    } finally {
      setIsCalculating(false);
    }
  }, [marketData, surfaceConfig, selectedSymbol]);

  // INITIAL DATA LOAD / REFRESH INTERVAL
  useEffect(() => {
    fetchMarketData();
    const id = setInterval(() => fetchMarketData(), 10000);
    return () => clearInterval(id);
  }, [fetchMarketData]);

  // Remove original simulated WebSocket interval body except retaining connectivity flags
  // Optional: mark isConnected depending on last fetch success
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleError = () => {
      setIsConnected(false);
      setError('Disconnected from market data feed');
      toast.error('Unable to connect to market data. Retrying...');
    };

    // Simulate connection check
    const id = setInterval(() => {
      if (Math.random() > 0.95) {
        handleError();
      } else {
        checkConnection();
      }
    }, 5000);

    return () => clearInterval(id);
  }, []);

  // MOVE handleExportData BEFORE keyboard shortcuts useEffect
  const handleExportData = useCallback(() => {
    try {
      const exportData = {
        marketData,
        surfaceData,
        config: surfaceConfig,
        symbol: selectedSymbol,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volatility-surface-${selectedSymbol}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, [marketData, surfaceData, surfaceConfig, selectedSymbol]);

  // Update keyboard shortcuts to call new handler - now handleExportData is defined
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            fetchMarketData();
            break;
          case 's':
            e.preventDefault();
            handleExportData();
            break;
          case 'Enter':
            e.preventDefault();
            handleCalculateSurface();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fetchMarketData, handleExportData, handleCalculateSurface]);

  // Mouse handlers for resizers
  const startDrag = (side) => {
    draggingRef.current = side;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const onMouseMove = (e) => {
    if (!containerRef.current || !draggingRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minPanel = 220;
    const maxPanel = 600;
    if (draggingRef.current === 'left') {
      const newLeft = clamp(e.clientX - rect.left, minPanel, Math.min(maxPanel, rect.width - rightWidth - 300));
      setLeftWidth(newLeft);
    } else if (draggingRef.current === 'right') {
      const newRight = clamp(rect.right - e.clientX, minPanel, Math.min(maxPanel, rect.width - leftWidth - 300));
      setRightWidth(newRight);
    }
  };
  const endDrag = () => {
    draggingRef.current = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', endDrag);
  };

  return (
    <AppContainer>
      <Header 
        selectedSymbol={selectedSymbol} 
        setSelectedSymbol={setSelectedSymbol}
        isConnected={isConnected}
        onExport={handleExportData}
        isLinked={isLinked}
        setIsLinked={setIsLinked}
      />
      
      <MainContent
        ref={containerRef}
        leftWidth={leftWidth}
        rightWidth={rightWidth}
      >
        <LeftPanel>
          <DataPanel 
            marketData={marketData}
            onCalculateSurface={handleCalculateSurface}
            isCalculating={isCalculating}
            error={error}
            onRefresh={fetchMarketData}
            selectedSymbol={selectedSymbol}
          />
        </LeftPanel>

        <Resizer onMouseDown={() => startDrag('left')} />

        <CenterPanel>
          <SurfaceContainer>
            <VolatilitySurface 
              data={surfaceData}
              isCalculating={isCalculating}
              symbol={selectedSymbol}
              config={surfaceConfig}
              error={error}
            />
          </SurfaceContainer>
        </CenterPanel>

        <Resizer onMouseDown={() => startDrag('right')} />

        <RightPanel>
          <MarketData data={marketData} symbol={selectedSymbol} />
          <ControlPanel 
            config={surfaceConfig}
            onChange={setSurfaceConfig}
            surfaceData={surfaceData}
          />
        </RightPanel>
      </MainContent>
    </AppContainer>
  );
}

export default App;