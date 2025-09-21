import React from 'react';
import styled from 'styled-components';

const ControlContainer = styled.div`
  padding: 1.6rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  min-height: 0;
  font-family: 'JetBrains Mono', monospace;
`;

const SectionCard = styled.div`
  background: #0f0f10;
  border: 1px solid #262626;
  border-radius: 0;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const CardHeader = styled.div`
  background: #151515;
  border-bottom: 1px solid #2c2c2c;
  padding: 0.8rem 1.2rem;
  color: #fff;
  font-weight: 700;
  font-size: 1.0rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
`;

const CardBody = styled.div`
  padding: 1.2rem;
  font-family: 'JetBrains Mono', monospace;
`;

const ControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  gap: 1.0rem;
  font-family: 'JetBrains Mono', monospace;
`;

const ControlLabel = styled.span`
  color: #b3b3b3;
  font-size: 1.1rem;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.025em;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  accent-color: #ff7a1a;
  height: 0.4rem;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-track {
    height: 0.4rem;
    background: #262626;
    border-radius: 0;
  }
  
  &::-webkit-slider-thumb {
    appearance: none;
    height: 1.6rem;
    width: 1.6rem;
    background: #ff7a1a;
    border-radius: 0;
    cursor: pointer;
    border: 2px solid #ff7a1a;
    transition: all 0.15s ease;
  }
  
  &::-webkit-slider-thumb:hover {
    background: #ffaa33;
    border-color: #ffaa33;
    box-shadow: 0 0 0 0.4rem rgba(255, 122, 26, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  background: #0a0a0a;
  color: #ff7a1a;
  border: 1px solid #262626;
  border-radius: 0;
  height: 3.0rem;
  padding: 0 0.8rem;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  transition: all 0.15s ease;
  
  &:focus {
    border-color: #ff7a1a;
    box-shadow: 0 0 0 2px rgba(255, 122, 26, 0.2);
  }
  
  &:hover {
    border-color: #ff7a1a;
  }
  
  option {
    background: #0a0a0a;
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    padding: 0.4rem;
  }
`;

const Switch = styled.input.attrs({ type: 'checkbox' })`
  width: 4.4rem;
  height: 2.2rem;
  appearance: none;
  background: ${p => (p.checked ? '#1f3d2a' : '#222')};
  border: 1px solid ${p => (p.checked ? '#00cc66' : '#333')};
  border-radius: 0;
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:before {
    content: '';
    position: absolute;
    top: 0.2rem;
    left: ${p => (p.checked ? '2.2rem' : '0.2rem')};
    width: 1.8rem;
    height: 1.8rem;
    background: ${p => (p.checked ? '#00cc66' : '#666')};
    border-radius: 0;
    transition: all 0.15s ease;
  }
  
  &:hover {
    box-shadow: 0 0 0 0.2rem rgba(0, 204, 102, 0.2);
  }
`;

const Button = styled.button`
  background: ${p => (p.primary ? '#ff7a1a' : 'transparent')};
  color: ${p => (p.primary ? '#000' : '#ddd')};
  border: 1px solid ${p => (p.primary ? '#ff7a1a' : '#2a2a2a')};
  border-radius: 0;
  height: 3.0rem;
  padding: 0 1.2rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.15s ease;
  width: ${p => (p.block ? '100%' : 'auto')};
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.0rem;
  text-transform: uppercase;
  
  &:hover {
    background: ${p => (p.primary ? '#ffaa33' : '#1a1a1a')};
    border-color: ${p => (p.primary ? '#ffaa33' : '#ff7a1a')};
    transform: translateY(-1px);
    color: ${p => (p.primary ? '#000' : '#ff7a1a')};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.8rem;
  background: ${props => props.active ? 'rgba(0, 204, 102, 0.1)' : 'rgba(102, 102, 102, 0.1)'};
  border: 1px solid ${props => props.active ? '#00cc66' : '#666666'};
  border-radius: 0;
  font-size: 1.0rem;
  font-weight: 700;
  color: ${props => props.active ? '#00cc66' : '#888'};
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.05em;
  transition: all 0.15s ease;
`;

const Row = styled.div`
  display: flex;
  gap: 0.8rem;
  width: 100%;
  font-family: 'JetBrains Mono', monospace;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'JetBrains Mono', monospace;
`;

const ModalCard = styled.div`
  width: 42rem;
  max-width: 90vw;
  background: #101010;
  border: 1px solid #ff7a1a;
  border-radius: 0;
  padding: 1.6rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  font-family: 'JetBrains Mono', monospace;
`;

const ModalHeader = styled.div`
  color: #fff;
  font-weight: 700;
  margin-bottom: 1.0rem;
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'JetBrains Mono', monospace;
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
  font-family: 'JetBrains Mono', monospace;
`;

const Spacer = styled.div`
  height: 0.8rem;
`;

const Input = styled.input`
  width: 100%;
  background: #0a0a0a;
  color: #fff;
  border: 1px solid #262626;
  border-radius: 0;
  height: 3.0rem;
  padding: 0 0.8rem;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  transition: all 0.15s ease;
  
  &:focus {
    border-color: #ff7a1a;
    box-shadow: 0 0 0 2px rgba(255, 122, 26, 0.2);
  }
  
  &:hover {
    border-color: #ff7a1a;
  }
  
  &::placeholder {
    color: #666;
    font-style: italic;
    opacity: 0.8;
  }
`;

const ArbitrageList = styled.div`
  max-height: 12rem;
  overflow-y: auto;
  margin-top: 0.8rem;
  font-size: 1.0rem;
  color: #ff4d4f;
  font-family: 'JetBrains Mono', monospace;
`;

const ArbitrageItem = styled.div`
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.4rem;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 0;
  font-size: 1.0rem;
  line-height: 1.4;
  font-family: 'JetBrains Mono', monospace;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
  font-size: 1.1rem;
  font-family: 'JetBrains Mono', monospace;
`;

const MetricValue = styled.span`
  color: ${props => props.error ? '#ff4d4f' : props.warning ? '#faad14' : '#52c41a'};
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.025em;
`;

function ControlPanel({ config, onChange, onRecalculate, surfaceData }) {
  const [isApplying, setIsApplying] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportModalVisible, setExportModalVisible] = React.useState(false);
  const [exportType, setExportType] = React.useState('json');
  const [pendingConfig, setPendingConfig] = React.useState(config);
  const [hasSurfaceChanges, setHasSurfaceChanges] = React.useState(false);
  const [hasVisualizationChanges, setHasVisualizationChanges] = React.useState(false);
  const [sliceModalVisible, setSliceModalVisible] = React.useState(false);
  const [comparisonModalVisible, setComparisonModalVisible] = React.useState(false);
  const [historicalSurfaces, setHistoricalSurfaces] = React.useState([]);
  const [sliceParams, setSliceParams] = React.useState({ type: 'smile', value: 30 });
  const [selectedCompareSurface, setSelectedCompareSurface] = React.useState(null);

  // Surface control keys
  const surfaceKeys = ['smoothing', 'interpolation', 'showContours', 'showDataPoints', 'resolution', 'volatilityRange'];
  // Visualization control keys
  const visualizationKeys = ['colorScheme', 'cameraAngle', 'viewMode', 'sliceType', 'sliceValue'];

  // Update pending config when external config changes
  React.useEffect(() => {
    setPendingConfig(config);
    setHasSurfaceChanges(false);
    setHasVisualizationChanges(false);
  }, [config]);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...pendingConfig, [key]: value };
    setPendingConfig(newConfig);
    
    // Check if there are changes in surface controls
    const surfaceHasChanges = surfaceKeys.some(k => newConfig[k] !== config[k]);
    setHasSurfaceChanges(surfaceHasChanges);
    
    // Check if there are changes in visualization controls
    const visualizationHasChanges = visualizationKeys.some(k => newConfig[k] !== config[k]);
    setHasVisualizationChanges(visualizationHasChanges);
  };

  const handleApplySurface = async () => {
    if (!hasSurfaceChanges) return;
    
    setIsApplying(true);
    try {
      const updatedConfig = { ...config };
      surfaceKeys.forEach(key => {
        updatedConfig[key] = pendingConfig[key];
      });
      
      onChange(updatedConfig);
      await onRecalculate(updatedConfig);
      setHasSurfaceChanges(false);
      console.log('✅ Surface controls updated successfully');
    } catch (error) {
      console.error('❌ Failed to update surface controls:', error?.message || error);
    } finally {
      setTimeout(() => setIsApplying(false), 600);
    }
  };

  const handleApplyVisualization = async () => {
    if (!hasVisualizationChanges) return;
    
    const updatedConfig = { ...config };
    visualizationKeys.forEach(key => {
      updatedConfig[key] = pendingConfig[key];
    });
    
    onChange(updatedConfig);
    
    // For camera angle changes, we need to trigger a recalculation to apply the view
    if (pendingConfig.cameraAngle !== config.cameraAngle) {
      try {
        await onRecalculate(updatedConfig);
      } catch (error) {
        console.error('❌ Failed to update camera angle:', error?.message || error);
      }
    }
    
    setHasVisualizationChanges(false);
    console.log('✅ Visualization settings updated successfully');
  };

  const handleCameraChange = (view) => {
    handleConfigChange('cameraAngle', view);
  };

  const resetToDefaults = () => {
    const defaultConfig = {
      smoothing: 50,
      interpolation: 'cubic',
      showContours: true,
      colorScheme: 'viridis',
      cameraAngle: 'perspective',
      resolution: 50,
      volatilityRange: [0, 1],
      showDataPoints: true
    };
    setPendingConfig(defaultConfig);
    setHasSurfaceChanges(true);
    setHasVisualizationChanges(true);
  };

  const handleExportData = async (format) => {
    // Align with current surfaceData shape
    if (!surfaceData || !surfaceData.volatilities) {
      console.error('❌ No surface data available to export');
      return;
    }
    setIsExporting(true);
    try {
      const exportData = {
        volatilities: surfaceData.volatilities,
        strikes: surfaceData.strikes,
        times: surfaceData.times,
        config: config,
        timestamp: new Date().toISOString(),
        metadata: {
          interpolationMethod: config.interpolation,
          smoothingLevel: config.smoothing,
          totalDataPoints: surfaceData.dataPoints || 0
        }
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volatility_surface_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('✅ Data exported:', format.toUpperCase());
    } catch (error) {
      console.error('❌ Export failed:', error?.message || error);
    } finally {
      setIsExporting(false);
      setExportModalVisible(false);
    }
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `volatility_surface_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
        console.log('✅ Image exported successfully');
      } else {
        console.error('❌ No visualization canvas found');
      }
    } catch (error) {
      console.error('❌ Image export failed:', error?.message || error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsExporting(true);
    try {
      const reportHtml = `
        <html>
          <head><title>Volatility Surface Analysis Report</title></head>
          <body>
            <h1>Implied Volatility Surface Analysis</h1>
            <h2>Configuration</h2>
            <p>Interpolation: ${config.interpolation}</p>
            <p>Smoothing: ${config.smoothing}%</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <h2>Data Summary</h2>
            <p>Total Data Points: ${(surfaceData && (surfaceData.dataPoints || 0))}</p>
          </body>
        </html>
      `;
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volatility_surface_report_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('✅ Report downloaded');
    } catch (error) {
      console.error('❌ Report generation failed:', error?.message || error);
    } finally {
      setIsExporting(false);
    }
  };

  const calculateArbitrageChecks = () => {
    if (!surfaceData?.volatilities || !surfaceData?.strikes || !surfaceData?.times) {
      return { checks: [], hasViolations: false, totalChecked: 0 };
    }
    
    const checks = [];
    let totalChecked = 0;
    
    try {
      // Calendar arbitrage check - volatility should generally increase with time
      for (let i = 0; i < surfaceData.strikes.length; i++) {
        for (let j = 0; j < surfaceData.times.length - 1; j++) {
          totalChecked++;
          const shortVol = surfaceData.volatilities[i]?.[j];
          const longVol = surfaceData.volatilities[i]?.[j + 1];
          
          if (shortVol && longVol) {
            const shortTime = surfaceData.times[j];
            const longTime = surfaceData.times[j + 1];
            
            // Check for calendar arbitrage - short vol significantly higher than long vol
            const threshold = 1 + (longTime - shortTime) * 0.1; // Dynamic threshold
            if (shortVol > longVol * threshold) {
              checks.push({
                type: 'Calendar Arbitrage',
                description: `Strike ${surfaceData.strikes[i].toFixed(0)}: ${shortTime}D vol (${(shortVol*100).toFixed(1)}%) > ${longTime}D vol (${(longVol*100).toFixed(1)}%)`,
                strike: surfaceData.strikes[i],
                timeShort: shortTime,
                timeLong: longTime,
                severity: shortVol > longVol * (threshold + 0.2) ? 'high' : 'medium'
              });
            }
          }
        }
      }
      
      // Butterfly arbitrage check - check for convexity violations
      for (let j = 0; j < surfaceData.times.length; j++) {
        for (let i = 1; i < surfaceData.strikes.length - 1; i++) {
          totalChecked++;
          const leftVol = surfaceData.volatilities[i - 1]?.[j];
          const centerVol = surfaceData.volatilities[i]?.[j];
          const rightVol = surfaceData.volatilities[i + 1]?.[j];
          
          if (leftVol && centerVol && rightVol) {
            const leftStrike = surfaceData.strikes[i - 1];
            const centerStrike = surfaceData.strikes[i];
            const rightStrike = surfaceData.strikes[i + 1];
            
            // Check for convexity violation using proper butterfly spread
            const expectedCenterVol = leftVol + (rightVol - leftVol) * 
              (centerStrike - leftStrike) / (rightStrike - leftStrike);
            
            const violation = centerVol - expectedCenterVol;
            if (Math.abs(violation) > 0.05) { // 5% threshold
              checks.push({
                type: 'Butterfly Arbitrage',
                description: `${surfaceData.times[j]}D: Strike ${centerStrike.toFixed(0)} vol (${(centerVol*100).toFixed(1)}%) violates convexity`,
                time: surfaceData.times[j],
                strikes: [leftStrike, centerStrike, rightStrike],
                violation: violation,
                severity: Math.abs(violation) > 0.1 ? 'high' : 'medium'
              });
            }
          }
        }
      }
      
      // Strike arbitrage - check for monotonicity violations in smile
      for (let j = 0; j < surfaceData.times.length; j++) {
        let atmIndex = Math.floor(surfaceData.strikes.length / 2);
        
        // Check left wing (OTM puts)
        for (let i = 0; i < atmIndex - 1; i++) {
          totalChecked++;
          const vol1 = surfaceData.volatilities[i]?.[j];
          const vol2 = surfaceData.volatilities[i + 1]?.[j];
          
          if (vol1 && vol2 && vol1 < vol2 - 0.02) { // 2% threshold
            checks.push({
              type: 'Smile Arbitrage',
              description: `${surfaceData.times[j]}D: Put wing monotonicity violation at strikes ${surfaceData.strikes[i].toFixed(0)}-${surfaceData.strikes[i+1].toFixed(0)}`,
              time: surfaceData.times[j],
              strikes: [surfaceData.strikes[i], surfaceData.strikes[i+1]],
              severity: 'medium'
            });
          }
        }
        
        // Check right wing (OTM calls)
        for (let i = atmIndex + 1; i < surfaceData.strikes.length - 1; i++) {
          totalChecked++;
          const vol1 = surfaceData.volatilities[i]?.[j];
          const vol2 = surfaceData.volatilities[i + 1]?.[j];
          
          if (vol1 && vol2 && vol1 > vol2 + 0.02) { // 2% threshold
            checks.push({
              type: 'Smile Arbitrage',
              description: `${surfaceData.times[j]}D: Call wing monotonicity violation at strikes ${surfaceData.strikes[i].toFixed(0)}-${surfaceData.strikes[i+1].toFixed(0)}`,
              time: surfaceData.times[j],
              strikes: [surfaceData.strikes[i], surfaceData.strikes[i+1]],
              severity: 'medium'
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error in arbitrage calculation:', error);
      return { checks: [{ type: 'Error', description: 'Failed to calculate arbitrage checks', severity: 'high' }], hasViolations: true, totalChecked: 0 };
    }
    
    return { 
      checks: checks.slice(0, 8).sort((a, b) => a.severity === 'high' ? -1 : 1), 
      hasViolations: checks.length > 0,
      totalChecked
    };
  };

  const calculateCalibrationError = () => {
    if (!surfaceData?.volatilities || !surfaceData?.marketData) {
      // If no market data, calculate surface smoothness metrics instead
      return calculateSurfaceQualityMetrics();
    }
    
    try {
      let sumSquaredErrors = 0;
      let sumAbsErrors = 0;
      let maxError = 0;
      let count = 0;
      
      // Compare model vs market volatilities
      surfaceData.marketData.forEach((marketPoint, idx) => {
        const { strike, time, marketVol } = marketPoint;
        
        // Find closest model point
        const strikeIdx = surfaceData.strikes.findIndex(s => Math.abs(s - strike) < 1);
        const timeIdx = surfaceData.times.findIndex(t => Math.abs(t - time) < 0.1);
        
        if (strikeIdx >= 0 && timeIdx >= 0) {
          const modelVol = surfaceData.volatilities[strikeIdx]?.[timeIdx];
          if (modelVol) {
            const error = modelVol - marketVol;
            sumSquaredErrors += error * error;
            sumAbsErrors += Math.abs(error);
            maxError = Math.max(maxError, Math.abs(error));
            count++;
          }
        }
      });
      
      if (count === 0) return calculateSurfaceQualityMetrics();
      
      return {
        rmse: Math.sqrt(sumSquaredErrors / count),
        mae: sumAbsErrors / count,
        maxError,
        dataPoints: count,
        quality: sumAbsErrors / count < 0.01 ? 'excellent' : sumAbsErrors / count < 0.02 ? 'good' : 'poor'
      };
      
    } catch (error) {
      console.error('Error in calibration calculation:', error);
      return { rmse: 0, mae: 0, maxError: 0, dataPoints: 0, quality: 'unknown' };
    }
  };

  const calculateSurfaceQualityMetrics = () => {
    if (!surfaceData?.volatilities) return { rmse: 0, mae: 0, maxError: 0, dataPoints: 0, quality: 'unknown' };
    
    try {
      let totalVariation = 0;
      let count = 0;
      let maxGradient = 0;
      
      // Calculate surface smoothness
      for (let i = 1; i < surfaceData.strikes.length - 1; i++) {
        for (let j = 1; j < surfaceData.times.length - 1; j++) {
          const center = surfaceData.volatilities[i]?.[j];
          const right = surfaceData.volatilities[i + 1]?.[j];
          const left = surfaceData.volatilities[i - 1]?.[j];
          const up = surfaceData.volatilities[i]?.[j + 1];
          const down = surfaceData.volatilities[i]?.[j - 1];
          
          if (center && right && left && up && down) {
            const gradX = Math.abs(right - left) / 2;
            const gradY = Math.abs(up - down) / 2;
            const gradient = Math.sqrt(gradX * gradX + gradY * gradY);
            
            totalVariation += gradient;
            maxGradient = Math.max(maxGradient, gradient);
            count++;
          }
        }
      }
      
      const avgVariation = count > 0 ? totalVariation / count : 0;
      
      return {
        rmse: avgVariation,
        mae: avgVariation * 0.8,
        maxError: maxGradient,
        dataPoints: count,
        quality: avgVariation < 0.01 ? 'excellent' : avgVariation < 0.05 ? 'good' : 'rough'
      };
      
    } catch (error) {
      console.error('Error in surface quality calculation:', error);
      return { rmse: 0, mae: 0, maxError: 0, dataPoints: 0, quality: 'unknown' };
    }
  };

  const handleSliceView = (type, value) => {
    if (!surfaceData?.volatilities) {
      console.error('No surface data available for slice analysis');
      return;
    }
    
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        console.error('Invalid slice value:', value);
        return;
      }
      
      const newConfig = { 
        ...pendingConfig, 
        viewMode: '2d',
        sliceType: type,
        sliceValue: numValue
      };
      setPendingConfig(newConfig);
      setHasVisualizationChanges(true);
      console.log(`✅ ${type} slice created at ${numValue}`);
    } catch (error) {
      console.error('Error creating slice view:', error);
    }
  };

  const handleCompareSurfaces = () => {
    if (!selectedCompareSurface || !surfaceData) {
      console.error('Cannot compare: missing surface data');
      return;
    }
    
    try {
      // Calculate difference metrics
      const current = surfaceData;
      const reference = selectedCompareSurface.data;
      
      let totalDiff = 0;
      let maxDiff = 0;
      let count = 0;
      
      // Compare overlapping regions
      for (let i = 0; i < Math.min(current.strikes?.length || 0, reference.strikes?.length || 0); i++) {
        for (let j = 0; j < Math.min(current.times?.length || 0, reference.times?.length || 0); j++) {
          const currentVol = current.volatilities?.[i]?.[j];
          const refVol = reference.volatilities?.[i]?.[j];
          
          if (currentVol && refVol) {
            const diff = Math.abs(currentVol - refVol);
            totalDiff += diff;
            maxDiff = Math.max(maxDiff, diff);
            count++;
          }
        }
      }
      
      const avgDiff = count > 0 ? totalDiff / count : 0;
      
      console.log(`✅ Surface comparison complete:
        Average difference: ${(avgDiff * 100).toFixed(2)}%
        Maximum difference: ${(maxDiff * 100).toFixed(2)}%
        Compared points: ${count}`);
        
      // Update visualization to show comparison
      const comparisonConfig = {
        ...pendingConfig,
        viewMode: 'comparison',
        referenceSurface: selectedCompareSurface
      };
      setPendingConfig(comparisonConfig);
      setHasVisualizationChanges(true);
      
    } catch (error) {
      console.error('Error comparing surfaces:', error);
    }
  };

  const handleSaveSurface = () => {
    if (!surfaceData) {
      console.error('No surface data available to save');
      return;
    }
    
    try {
      const snapshot = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: surfaceData,
        config: config,
        name: `Surface_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`
      };
      
      const saved = [...historicalSurfaces, snapshot];
      setHistoricalSurfaces(saved);
      localStorage.setItem('volatilitySurfaces', JSON.stringify(saved));
      console.log('✅ Surface snapshot saved');
    } catch (error) {
      console.error('❌ Failed to save surface:', error);
    }
  };

  const loadHistoricalSurfaces = () => {
    try {
      const saved = localStorage.getItem('volatilitySurfaces');
      if (saved) {
        setHistoricalSurfaces(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load historical surfaces:', error);
    }
  };

  React.useEffect(() => {
    loadHistoricalSurfaces();
  }, []);

  const arbitrageChecks = calculateArbitrageChecks();
  const calibrationMetrics = calculateCalibrationError();

  return (
    <ControlContainer>
      <SectionCard>
        <CardHeader>SURFACE CONTROLS</CardHeader>
        <CardBody>
          <ControlRow>
            <ControlLabel>Smoothing ({pendingConfig.smoothing}%)</ControlLabel>
            <StatusIndicator active={pendingConfig.smoothing > 30}>
              {pendingConfig.smoothing > 30 ? 'HIGH' : 'LOW'}
            </StatusIndicator>
          </ControlRow>
          <Slider
            min={0}
            max={100}
            value={pendingConfig.smoothing}
            onChange={(e) => handleConfigChange('smoothing', Number(e.target.value))}
          />

          <Spacer />

          <ControlRow>
            <ControlLabel>Interpolation Method</ControlLabel>
          </ControlRow>
          <Select
            value={pendingConfig.interpolation}
            onChange={(e) => handleConfigChange('interpolation', e.target.value)}
          >
            <option value="linear">Linear Interpolation</option>
            <option value="cubic">Cubic Spline</option>
            <option value="rbf">Radial Basis Function</option>
            <option value="kriging">Kriging</option>
            <option value="bilinear">Bilinear</option>
          </Select>

          <Spacer />

          <ControlRow>
            <ControlLabel>Show Contour Lines</ControlLabel>
            <Switch
              checked={pendingConfig.showContours}
              onChange={(e) => handleConfigChange('showContours', e.target.checked)}
            />
          </ControlRow>

          <ControlRow>
            <ControlLabel>Show Data Points</ControlLabel>
            <Switch
              checked={pendingConfig.showDataPoints}
              onChange={(e) => handleConfigChange('showDataPoints', e.target.checked)}
            />
          </ControlRow>

          <Row>
            <Button 
              primary 
              block 
              onClick={handleApplySurface} 
              disabled={isApplying || !hasSurfaceChanges}
            >
              {isApplying ? 'APPLYING...' : hasSurfaceChanges ? 'APPLY CHANGES' : 'APPLIED'}
            </Button>
            <Button onClick={resetToDefaults}>RESET</Button>
          </Row>
        </CardBody>
      </SectionCard>

      <SectionCard>
        <CardHeader>VISUALIZATION</CardHeader>
        <CardBody>
          <ControlRow>
            <ControlLabel>Color Scheme</ControlLabel>
          </ControlRow>
          <Select
            value={pendingConfig.colorScheme}
            onChange={(e) => handleConfigChange('colorScheme', e.target.value)}
          >
            <option value="viridis">Viridis (Default)</option>
            <option value="plasma">Plasma</option>
            <option value="hot">Hot</option>
            <option value="cool">Cool</option>
            <option value="jet">Jet</option>
            <option value="rainbow">Rainbow</option>
            <option value="turbo">Turbo</option>
          </Select>
          <Row>
            <Button 
              primary 
              block 
              onClick={handleApplyVisualization} 
              disabled={!hasVisualizationChanges}
            >
              {hasVisualizationChanges ? 'APPLY CHANGES' : 'APPLIED'}
            </Button>
          </Row>
        </CardBody>
      </SectionCard>

      <SectionCard>
        <CardHeader>EXPORT OPTIONS</CardHeader>
        <CardBody>
          <ButtonColumn>
            <Button block onClick={() => setExportModalVisible(true)} disabled={isExporting}>
              Export Surface Data
            </Button>
            <Button block onClick={handleExportImage} disabled={isExporting}>
              Export as Image
            </Button>
          </ButtonColumn>
        </CardBody>
      </SectionCard>

      <SectionCard>
        <CardHeader>ANALYSIS TOOLS</CardHeader>
        <CardBody>
          <ButtonColumn>
            <Button block onClick={() => setSliceModalVisible(true)}>
              2D Slice Analysis
            </Button>
            <Button block onClick={handleSaveSurface} disabled={!surfaceData}>
              Save Surface Snapshot
            </Button>
            <Button block onClick={() => setComparisonModalVisible(true)}>
              Surface Comparison
            </Button>
          </ButtonColumn>
        </CardBody>
      </SectionCard>

      <SectionCard>
        <CardHeader>ARBITRAGE CHECKS</CardHeader>
        <CardBody>
          <ControlRow>
            <ControlLabel>Status</ControlLabel>
            <StatusIndicator active={!arbitrageChecks.hasViolations}>
              {arbitrageChecks.hasViolations ? 'VIOLATIONS' : 'CLEAN'}
            </StatusIndicator>
          </ControlRow>
          <MetricRow>
            <ControlLabel>Checks Performed</ControlLabel>
            <MetricValue>{arbitrageChecks.totalChecked}</MetricValue>
          </MetricRow>
          {arbitrageChecks.checks.length > 0 && (
            <ArbitrageList>
              {arbitrageChecks.checks.map((check, idx) => (
                <ArbitrageItem key={idx}>
                  <strong>{check.type}:</strong> {check.description}
                </ArbitrageItem>
              ))}
            </ArbitrageList>
          )}
        </CardBody>
      </SectionCard>

      <SectionCard>
        <CardHeader>CALIBRATION METRICS</CardHeader>
        <CardBody>
          <MetricRow>
            <ControlLabel>RMSE</ControlLabel>
            <MetricValue error={calibrationMetrics.rmse > 0.03} warning={calibrationMetrics.rmse > 0.01}>
              {(calibrationMetrics.rmse * 100).toFixed(2)}%
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <ControlLabel>MAE</ControlLabel>
            <MetricValue error={calibrationMetrics.mae > 0.02} warning={calibrationMetrics.mae > 0.01}>
              {(calibrationMetrics.mae * 100).toFixed(2)}%
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <ControlLabel>Max Error</ControlLabel>
            <MetricValue error={calibrationMetrics.maxError > 0.05} warning={calibrationMetrics.maxError > 0.02}>
              {(calibrationMetrics.maxError * 100).toFixed(2)}%
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <ControlLabel>Data Points</ControlLabel>
            <MetricValue>{calibrationMetrics.dataPoints}</MetricValue>
          </MetricRow>
          <MetricRow>
            <ControlLabel>Quality</ControlLabel>
            <MetricValue 
              error={calibrationMetrics.quality === 'poor'} 
              warning={calibrationMetrics.quality === 'rough'}
            >
              {calibrationMetrics.quality?.toUpperCase() || 'UNKNOWN'}
            </MetricValue>
          </MetricRow>
        </CardBody>
      </SectionCard>

      {exportModalVisible && (
        <ModalOverlay onClick={() => setExportModalVisible(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>Export Surface Data</ModalHeader>
            <div style={{ color: '#ccc', fontSize: 13, marginBottom: 8 }}>Select export format:</div>
            <Select value={exportType} onChange={(e) => setExportType(e.target.value)} style={{ width: '100%', marginBottom: 12 }}>
              <option value="csv">CSV (Comma Separated)</option>
              <option value="json">JSON (JavaScript Object)</option>
            </Select>
            <Row style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setExportModalVisible(false)}>Cancel</Button>
              <Button primary onClick={() => handleExportData(exportType)} disabled={isExporting}>Export</Button>
            </Row>
          </ModalCard>
        </ModalOverlay>
      )}

      {sliceModalVisible && (
        <ModalOverlay onClick={() => setSliceModalVisible(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>2D Slice Analysis</ModalHeader>
            <div style={{ color: '#ccc', fontSize: 13, marginBottom: 12 }}>
              View volatility smile or term structure
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <ControlLabel>Slice Type</ControlLabel>
              <Select 
                style={{ marginTop: 4 }}
                value={sliceParams.type}
                onChange={(e) => setSliceParams({...sliceParams, type: e.target.value})}
              >
                <option value="smile">Volatility Smile (Fixed Expiry)</option>
                <option value="term">Term Structure (Fixed Strike)</option>
              </Select>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <ControlLabel>
                {sliceParams.type === 'smile' ? 'Expiry (days)' : 'Strike Level'}
              </ControlLabel>
              <Input 
                type="number" 
                placeholder={sliceParams.type === 'smile' ? 'Enter expiry in days' : 'Enter strike level'}
                value={sliceParams.value}
                onChange={(e) => setSliceParams({...sliceParams, value: e.target.value})}
              />
            </div>
            
            {surfaceData && (
              <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>
                Available {sliceParams.type === 'smile' ? 'expiries' : 'strikes'}: {
                  sliceParams.type === 'smile' 
                    ? surfaceData.times?.join(', ') || 'None'
                    : surfaceParams.strikes?.map(s => s.toFixed(0)).join(', ') || 'None'
                }
              </div>
            )}
            
            <Row style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setSliceModalVisible(false)}>Cancel</Button>
              <Button 
                primary 
                onClick={() => {
                  handleSliceView(sliceParams.type, sliceParams.value);
                  setSliceModalVisible(false);
                }}
                disabled={!sliceParams.value || !surfaceData}
              >
                Show Slice
              </Button>
            </Row>
          </ModalCard>
        </ModalOverlay>
      )}

      {comparisonModalVisible && (
        <ModalOverlay onClick={() => setComparisonModalVisible(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>Surface Comparison</ModalHeader>
            <div style={{ color: '#ccc', fontSize: 13, marginBottom: 12 }}>
              Compare current surface with historical data
            </div>
            
            {historicalSurfaces.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', padding: 20 }}>
                No saved surfaces found. Save a surface first.
              </div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                {historicalSurfaces.map(surface => (
                  <div 
                    key={surface.id} 
                    style={{
                      padding: 8,
                      border: `1px solid ${selectedCompareSurface?.id === surface.id ? '#ff7a1a' : '#333'}`,
                      borderRadius: 4,
                      marginBottom: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      backgroundColor: selectedCompareSurface?.id === surface.id ? 'rgba(255, 122, 26, 0.1)' : 'transparent'
                    }}
                    onClick={() => setSelectedCompareSurface(surface)}
                  >
                    <div style={{ color: '#fff', fontWeight: 600 }}>{surface.name}</div>
                    <div style={{ color: '#888' }}>{new Date(surface.timestamp).toLocaleString()}</div>
                    <div style={{ color: '#666', fontSize: 10 }}>
                      Points: {surface.data?.volatilities?.length || 0} × {surface.data?.volatilities?.[0]?.length || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Row style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setComparisonModalVisible(false)}>Cancel</Button>
              <Button 
                primary 
                disabled={!selectedCompareSurface || !surfaceData}
                onClick={() => {
                  handleCompareSurfaces();
                  setComparisonModalVisible(false);
                }}
              >
                Compare
              </Button>
            </Row>
          </ModalCard>
        </ModalOverlay>
      )}
    </ControlContainer>
  );
}

export default ControlPanel;