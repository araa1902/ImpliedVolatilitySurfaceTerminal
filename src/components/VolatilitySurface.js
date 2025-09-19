import React from 'react';
import styled from 'styled-components';
import Plot from 'react-plotly.js';
import SliceAnalysis from './SliceAnalysis';

const SurfaceContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
`;

const SurfaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
`;

const SurfaceTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const MetricsRow = styled.div`
  display: flex;
  gap: 12px;
`;

const MetricCard = styled.div`
  background: #0f0f10;
  border: 1px solid #262626;
  border-radius: 8px;
  min-width: 110px;
  padding: 8px 12px;
`;

const MetricValue = styled.span`
  color: #ff7a1a;
  font-weight: 700;
  font-size: 14px;
  display: block;
`;

const MetricLabel = styled.span`
  color: #b3b3b3;
  font-size: 11px;
  display: block;
`;

const PlotContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a0a0a;
  border: 1px solid #262626;
  border-radius: 12px;
  position: relative;
  min-height: 0;
  overflow: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #ffffff;
`;

const LoadingIcon = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #ff7a1a;
  letter-spacing: 2px;
  
  &::before {
    content: 'comet';
    animation: fluidWave 2s ease-in-out infinite;
    background: linear-gradient(
      90deg,
      #333 0%,
      #ff7a1a 25%,
      #ffaa4a 50%,
      #ff7a1a 75%,
      #333 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  @keyframes fluidWave {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ff4d4f;
  padding: 24px;
`;

const ErrorIcon = styled.div`
  font-size: 40px;
  margin-bottom: 8px;
`;

const ErrorText = styled.span`
  color: #ff4d4f;
  font-size: 16px;
  text-align: center;
  font-weight: 500;
`;

const ErrorSubText = styled.span`
  color: #bbbbbb;
  font-size: 13px;
  text-align: center;
`;

const PlaceholderText = styled.span`
  color: #cccccc;
  font-size: 15px;
  text-align: center;
  font-weight: 500;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #0f0f10;
  border: 1px solid #262626;
  border-radius: 6px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  background: ${props => props.active ? '#ff7a1a' : 'transparent'};
  color: ${props => props.active ? '#000' : '#fff'};
  border: none;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
`;

function VolatilitySurface({ data, isCalculating, symbol, config, error }) {
  const [viewMode, setViewMode] = React.useState(config?.viewMode || '3d');
  const [comparisonData, setComparisonData] = React.useState(null);

  React.useEffect(() => {
    if (config?.viewMode && config.viewMode !== viewMode) {
      setViewMode(config.viewMode);
    }
  }, [config?.viewMode]);

  const getCameraPosition = () => {
    const cameras = {
      front: { eye: { x: 0, y: -2, z: 0.5 } },
      side: { eye: { x: 2, y: 0, z: 0.5 } },
      top: { eye: { x: 0, y: 0, z: 2 } },
      perspective: { eye: { x: 1.5, y: 1.5, z: 1.5 } }
    };
    return cameras[config?.cameraAngle] || cameras.perspective;
  };

  const renderPlot = () => {
    if (!data) return null;

    const { strikes, times, volatilities } = data;
    
    const colorscales = {
      viridis: 'Viridis',
      plasma: 'Plasma', 
      hot: 'Hot',
      cool: 'Cool',
      jet: 'Jet',
      rainbow: 'Rainbow',
      turbo: 'Turbo'
    };

    const traces = [{
      type: 'surface',
      x: times,
      y: strikes,
      z: volatilities,
      colorscale: colorscales[config?.colorScheme] || 'Viridis',
      contours: config?.showContours ? {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: "#42f462",
          project: { z: true }
        }
      } : {},
      lighting: {
        ambient: 0.4,
        diffuse: 0.8,
        fresnel: 0.2,
        specular: 1,
        roughness: 0.1
      },
      name: 'Current Surface',
      hovertemplate: 
        '<b>Strike:</b> %{y:.0f}<br>' +
        '<b>Time:</b> %{x:.2f}Y<br>' +
        '<b>IV:</b> %{z:.1%}<br>' +
        '<extra></extra>',
      opacity: comparisonData ? 0.7 : 1.0
    }];

    // Add comparison surface if available
    if (comparisonData) {
      traces.push({
        type: 'surface',
        x: comparisonData.times,
        y: comparisonData.strikes,
        z: comparisonData.volatilities,
        colorscale: 'Greys',
        opacity: 0.5,
        name: 'Historical Surface',
        showscale: false,
        hovertemplate: 
          '<b>Historical</b><br>' +
          '<b>Strike:</b> %{y:.0f}<br>' +
          '<b>Time:</b> %{x:.2f}Y<br>' +
          '<b>IV:</b> %{z:.1%}<br>' +
          '<extra></extra>'
      });
    }

    return (
      <Plot
        data={traces}
        layout={{
          title: {
            text: `${symbol} Implied Volatility Surface${comparisonData ? ' (vs Historical)' : ''}`,
            font: { color: '#ffffff', size: 16 }
          },
          scene: {
            xaxis: {
              title: 'Time to Expiry (Years)',
              titlefont: { color: '#fff', size: 12 },
              tickfont: { color: '#fff', size: 10 },
              gridcolor: '#333',
              backgroundcolor: '#0a0a0a'
            },
            yaxis: {
              title: 'Strike Price ($)',
              titlefont: { color: '#fff', size: 12 },
              tickfont: { color: '#fff', size: 10 },
              gridcolor: '#333',
              backgroundcolor: '#0a0a0a'
            },
            zaxis: {
              title: 'Implied Volatility',
              titlefont: { color: '#fff', size: 12 },
              tickfont: { color: '#fff', size: 10 },
              gridcolor: '#333',
              backgroundcolor: '#0a0a0a',
              tickformat: '.1%'
            },
            bgcolor: '#0a0a0a',
            camera: getCameraPosition()
          },
          paper_bgcolor: '#0a0a0a',
          plot_bgcolor: '#0a0a0a',
          font: { color: '#ffffff' },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          showlegend: comparisonData
        }}
        style={{ width: '100%', height: '100%' }}
        config={{
          displayModeBar: true,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'autoScale2d'],
          displaylogo: false,
          toImageButtonOptions: {
            format: 'png',
            filename: `${symbol}_volatility_surface_${new Date().toISOString().split('T')[0]}`,
            height: 800,
            width: 1200,
            scale: 2
          }
        }}
      />
    );
  };

  const calculateMetrics = () => {
    if (!data) return { avgVol: 0, maxVol: 0, minVol: 0, skew: 0 };
    
    const allVols = data.volatilities.flat();
    const avgVol = allVols.reduce((a, b) => a + b, 0) / allVols.length;
    const maxVol = Math.max(...allVols);
    const minVol = Math.min(...allVols);
    
    // Calculate vol skew (25-delta put vs call)
    const atmIndex = Math.floor(data.strikes.length / 2);
    const otmPutIndex = Math.floor(data.strikes.length * 0.25);
    const otmCallIndex = Math.floor(data.strikes.length * 0.75);
    
    const skew = data.volatilities[otmPutIndex]?.[0] - data.volatilities[otmCallIndex]?.[0] || 0;
    
    return { avgVol, maxVol, minVol, skew };
  };

  const metrics = calculateMetrics();

  if (error) {
    return (
      <SurfaceContainer>
        <SurfaceHeader>
          <SurfaceTitle>Volatility Surface Analysis</SurfaceTitle>
        </SurfaceHeader>
        <PlotContainer>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorText>{error}</ErrorText>
            <ErrorSubText>Please check your data and try again</ErrorSubText>
          </ErrorContainer>
        </PlotContainer>
      </SurfaceContainer>
    );
  }

  return (
    <SurfaceContainer>
      <SurfaceHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ViewToggle>
            <ViewButton active={viewMode === '3d'} onClick={() => setViewMode('3d')}>
              3D Surface
            </ViewButton>
            <ViewButton active={viewMode === '2d'} onClick={() => setViewMode('2d')}>
              2D Slices
            </ViewButton>
          </ViewToggle>
        </div>
        
        <MetricsRow>
          <MetricCard>
            <MetricLabel>Avg Vol</MetricLabel>
            <MetricValue>{(metrics.avgVol * 100).toFixed(1)}%</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>Vol Range</MetricLabel>
            <MetricValue>{((metrics.maxVol - metrics.minVol) * 100).toFixed(1)}%</MetricValue>
          </MetricCard>
          <MetricCard>
            <MetricLabel>25Δ Skew</MetricLabel>
            <MetricValue>{(metrics.skew * 100).toFixed(1)}%</MetricValue>
          </MetricCard>
          {data && (
            <MetricCard>
              <MetricLabel>Data Points</MetricLabel>
              <MetricValue>{data.dataPoints || 0}</MetricValue>
            </MetricCard>
          )}
        </MetricsRow>
      </SurfaceHeader>

      <PlotContainer>
        {isCalculating ? (
          <LoadingContainer>
            <LoadingIcon />
          </LoadingContainer>
        ) : data ? (
          viewMode === '3d' ? renderPlot() : 
          <SliceAnalysis 
            surfaceData={data} 
            sliceType={config?.sliceType || 'smile'} 
            sliceValue={config?.sliceValue || 30} 
          />
        ) : (
          <PlaceholderText>
            Click "Build Surface" to generate volatility surface
          </PlaceholderText>
        )}
      </PlotContainer>
    </SurfaceContainer>
  );
}

export default VolatilitySurface;