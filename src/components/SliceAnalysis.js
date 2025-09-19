import React from 'react';
import styled from 'styled-components';
import Plot from 'react-plotly.js';

const SliceContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
`;

const SliceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
`;

const SliceTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const SliceControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SliceSelect = styled.select`
  background: #0a0a0a;
  color: #ff7a1a;
  border: 1px solid #262626;
  border-radius: 6px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
`;

const SliceInput = styled.input`
  background: #0a0a0a;
  color: #ff7a1a;
  border: 1px solid #262626;
  border-radius: 6px;
  height: 28px;
  padding: 0 8px;
  width: 80px;
  font-size: 12px;
`;

const PlotContainer = styled.div`
  flex: 1;
  background: #0a0a0a;
  border: 1px solid #262626;
  border-radius: 12px;
  overflow: hidden;
`;

function SliceAnalysis({ surfaceData, sliceType = 'smile', sliceValue = 30 }) {
  const [currentSliceType, setCurrentSliceType] = React.useState(sliceType);
  const [currentSliceValue, setCurrentSliceValue] = React.useState(sliceValue);

  const generateSliceData = () => {
    if (!surfaceData || !surfaceData.volatilities) return null;

    const { strikes, times, volatilities } = surfaceData;

    if (currentSliceType === 'smile') {
      // Find closest time to target
      const targetTime = currentSliceValue / 365.25; // Convert days to years
      const timeIndex = times.reduce((closest, time, index) => 
        Math.abs(time - targetTime) < Math.abs(times[closest] - targetTime) ? index : closest, 0
      );

      const smileData = strikes.map((strike, i) => ({
        x: strike,
        y: volatilities[i][timeIndex]
      }));

      return {
        data: [{
          x: smileData.map(d => d.x),
          y: smileData.map(d => d.y),
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#ff7a1a', size: 6 },
          line: { color: '#ff7a1a', width: 2 },
          name: `${currentSliceValue}D Smile`
        }],
        layout: {
          title: `Volatility Smile - ${currentSliceValue} Days to Expiry`,
          xaxis: { title: 'Strike Price', color: '#fff' },
          yaxis: { title: 'Implied Volatility', color: '#fff', tickformat: '.1%' }
        }
      };
    } else {
      // Term structure - find closest strike
      const strikeIndex = strikes.reduce((closest, strike, index) => 
        Math.abs(strike - currentSliceValue) < Math.abs(strikes[closest] - currentSliceValue) ? index : closest, 0
      );

      const termData = times.map((time, j) => ({
        x: time * 365.25, // Convert to days
        y: volatilities[strikeIndex][j]
      }));

      return {
        data: [{
          x: termData.map(d => d.x),
          y: termData.map(d => d.y),
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#00ff9d', size: 6 },
          line: { color: '#00ff9d', width: 2 },
          name: `$${currentSliceValue} Term Structure`
        }],
        layout: {
          title: `Term Structure - $${currentSliceValue} Strike`,
          xaxis: { title: 'Days to Expiry', color: '#fff' },
          yaxis: { title: 'Implied Volatility', color: '#fff', tickformat: '.1%' }
        }
      };
    }
  };

  const sliceData = generateSliceData();

  return (
    <SliceContainer>
      <SliceHeader>
        <SliceTitle>2D Slice Analysis</SliceTitle>
        <SliceControls>
          <SliceSelect 
            value={currentSliceType} 
            onChange={(e) => setCurrentSliceType(e.target.value)}
          >
            <option value="smile">Volatility Smile</option>
            <option value="term">Term Structure</option>
          </SliceSelect>
          <SliceInput
            type="number"
            value={currentSliceValue}
            onChange={(e) => setCurrentSliceValue(Number(e.target.value))}
            placeholder={currentSliceType === 'smile' ? 'Days' : 'Strike'}
          />
        </SliceControls>
      </SliceHeader>

      <PlotContainer>
        {sliceData && (
          <Plot
            data={sliceData.data}
            layout={{
              ...sliceData.layout,
              paper_bgcolor: '#0a0a0a',
              plot_bgcolor: '#0a0a0a',
              font: { color: '#ffffff', size: 12 },
              margin: { l: 60, r: 20, t: 50, b: 50 },
              showlegend: false,
              grid: { rows: 1, columns: 1, pattern: 'independent' }
            }}
            style={{ width: '100%', height: '100%' }}
            config={{
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: `volatility_${currentSliceType}_${currentSliceValue}`,
                height: 600,
                width: 800,
                scale: 2
              }
            }}
          />
        )}
      </PlotContainer>
    </SliceContainer>
  );
}

export default SliceAnalysis;
