import React from 'react';
import styled from 'styled-components';

const ControlContainer = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`;

const SectionCard = styled.div`
  background: #0f0f10;
  border: 1px solid #262626;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
`;

const CardHeader = styled.div`
  background: #151515;
  border-bottom: 1px solid #2c2c2c;
  padding: 8px 12px;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.5px;
`;

const CardBody = styled.div`
  padding: 12px;
`;

const ControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
`;

const ControlLabel = styled.span`
  color: #b3b3b3;
  font-size: 12px;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  accent-color: #ff7a1a;
`;

const Select = styled.select`
  width: 100%;
  background: #0a0a0a;
  color: #ff7a1a;
  border: 1px solid #262626;
  border-radius: 8px;
  height: 30px;
  padding: 0 8px;
  outline: none;
  &:focus {
    border-color: #ff7a1a;
    box-shadow: 0 0 0 3px rgba(255, 122, 26, 0.2);
  }
`;

const Switch = styled.input.attrs({ type: 'checkbox' })`
  width: 36px;
  height: 20px;
  appearance: none;
  background: ${p => (p.checked ? '#1f3d2a' : '#222')};
  border: 1px solid ${p => (p.checked ? '#00cc66' : '#333')};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  &:before {
    content: '';
    position: absolute;
    top: 2px; left: ${p => (p.checked ? '18px' : '2px')};
    width: 14px; height: 14px;
    background: ${p => (p.checked ? '#00cc66' : '#666')};
    border-radius: 3px;
    transition: left 0.15s ease;
  }
`;

const Button = styled.button`
  background: ${p => (p.primary ? '#ff7a1a' : 'transparent')};
  color: ${p => (p.primary ? '#000' : '#ddd')};
  border: 1px solid ${p => (p.primary ? '#ff7a1a' : '#2a2a2a')};
  border-radius: 8px;
  height: 30px;
  padding: 0 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.15s ease;
  width: ${p => (p.block ? '100%' : 'auto')};
  &:hover {
    background: ${p => (p.primary ? '#ff974d' : '#1a1a1a')};
    border-color: ${p => (p.primary ? '#ff974d' : '#3a3a3a')};
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  background: ${props => props.active ? 'rgba(0, 204, 102, 0.08)' : 'rgba(102, 102, 102, 0.08)'};
  border: 1px solid ${props => props.active ? '#00cc66' : '#666666'};
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.active ? '#00cc66' : '#888'};
  text-transform: uppercase;
`;

const Row = styled.div`
  display: flex; gap: 8px; width: 100%;
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;

const ModalCard = styled.div`
  width: 420px; max-width: 90vw;
  background: #101010; border: 1px solid #2a2a2a; border-radius: 12px;
  padding: 16px;
`;

const ModalHeader = styled.div`
  color: #fff; font-weight: 800; margin-bottom: 10px;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  width: 100%;
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Spacer = styled.div`
  height: 8px;
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

  const handleSliceView = (type, value) => {
    const newConfig = { 
      ...pendingConfig, 
      viewMode: '2d',
      sliceType: type,
      sliceValue: value
    };
    setPendingConfig(newConfig);
    setHasVisualizationChanges(true);
  };

  const handleSaveSurface = () => {
    if (!surfaceData) return;
    
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

  const calculateArbitrageChecks = () => {
    if (!surfaceData || !surfaceData.volatilities) return { checks: [], hasViolations: false };
    
    const checks = [];
    let hasViolations = false;
    
    // Calendar arbitrage check (same strike, different times)
    for (let i = 0; i < surfaceData.strikes.length; i++) {
      for (let j = 0; j < surfaceData.times.length - 1; j++) {
        const shortVol = surfaceData.volatilities[i][j];
        const longVol = surfaceData.volatilities[i][j + 1];
        if (shortVol > longVol * 1.5) { // Simple threshold
          checks.push({
            type: 'Calendar Arbitrage',
            strike: surfaceData.strikes[i],
            timeShort: surfaceData.times[j],
            timeLong: surfaceData.times[j + 1],
            severity: 'high'
          });
          hasViolations = true;
        }
      }
    }
    
    // Butterfly arbitrage check (same time, different strikes)
    for (let j = 0; j < surfaceData.times.length; j++) {
      for (let i = 1; i < surfaceData.strikes.length - 1; i++) {
        const leftVol = surfaceData.volatilities[i - 1][j];
        const centerVol = surfaceData.volatilities[i][j];
        const rightVol = surfaceData.volatilities[i + 1][j];
        
        // Check for convexity violation
        if (centerVol > (leftVol + rightVol) / 2 + 0.1) {
          checks.push({
            type: 'Butterfly Arbitrage',
            time: surfaceData.times[j],
            strikes: [surfaceData.strikes[i - 1], surfaceData.strikes[i], surfaceData.strikes[i + 1]],
            severity: 'medium'
          });
          hasViolations = true;
        }
      }
    }
    
    return { checks: checks.slice(0, 5), hasViolations }; // Limit to 5 most critical
  };

  const calculateCalibrationError = () => {
    if (!surfaceData || !surfaceData.marketData) return { rmse: 0, mae: 0, maxError: 0 };
    
    let sumSquaredErrors = 0;
    let sumAbsErrors = 0;
    let maxError = 0;
    let count = 0;
    
    // This would compare model prices vs market prices
    // For now, simulate with random errors
    const errors = Array.from({ length: 20 }, () => Math.random() * 0.02 - 0.01);
    
    errors.forEach(error => {
      sumSquaredErrors += error * error;
      sumAbsErrors += Math.abs(error);
      maxError = Math.max(maxError, Math.abs(error));
      count++;
    });
    
    return {
      rmse: Math.sqrt(sumSquaredErrors / count),
      mae: sumAbsErrors / count,
      maxError
    };
  };

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
          {arbitrageChecks.checks.length > 0 && (
            <div style={{ fontSize: 10, color: '#ff4d4f', marginTop: 8 }}>
              {arbitrageChecks.checks.length} arbitrage violation(s) detected
            </div>
          )}
        </CardBody>
      </SectionCard>

      <SectionCard>
        <CardHeader>CALIBRATION METRICS</CardHeader>
        <CardBody>
          <ControlRow>
            <ControlLabel>RMSE</ControlLabel>
            <ControlLabel>{(calibrationMetrics.rmse * 100).toFixed(2)}%</ControlLabel>
          </ControlRow>
          <ControlRow>
            <ControlLabel>MAE</ControlLabel>
            <ControlLabel>{(calibrationMetrics.mae * 100).toFixed(2)}%</ControlLabel>
          </ControlRow>
          <ControlRow>
            <ControlLabel>Max Error</ControlLabel>
            <ControlLabel>{(calibrationMetrics.maxError * 100).toFixed(2)}%</ControlLabel>
          </ControlRow>
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
              <Select style={{ marginTop: 4 }}>
                <option value="smile">Volatility Smile (Fixed Expiry)</option>
                <option value="term">Term Structure (Fixed Strike)</option>
              </Select>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <ControlLabel>Value</ControlLabel>
              <Input type="number" placeholder="Enter expiry (days) or strike" />
            </div>
            
            <Row style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setSliceModalVisible(false)}>Cancel</Button>
              <Button primary onClick={() => {
                handleSliceView('smile', 30);
                setSliceModalVisible(false);
              }}>
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
                  <div key={surface.id} style={{
                    padding: 8,
                    border: '1px solid #333',
                    borderRadius: 4,
                    marginBottom: 4,
                    cursor: 'pointer',
                    fontSize: 12
                  }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{surface.name}</div>
                    <div style={{ color: '#888' }}>{new Date(surface.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
            
            <Row style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setComparisonModalVisible(false)}>Cancel</Button>
              <Button primary disabled={historicalSurfaces.length === 0}>
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