import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import StockInfo from './StockInfo';

const PanelContainer = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
`;

const SectionCard = styled.div`
  background: #0f0f10;
  border: 1px solid #262626;
  border-radius: 10px;
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
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  color: #b3b3b3;
  font-size: 12px;
`;

const Input = styled.input`
  width: 100%;
  background: #0a0a0a;
  color: #ff7a1a;
  border: 1px solid #262626;
  border-radius: 8px;
  height: 30px;
  padding: 0 10px;
  outline: none;
  &:focus {
    border-color: #ff7a1a;
    box-shadow: 0 0 0 3px rgba(255, 122, 26, 0.2);
  }
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

const ControlButton = styled.button`
  background: #ff7a1a;
  border: 1px solid #ff7a1a;
  color: #000;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-radius: 8px;
  height: 32px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #ff974d; border-color: #ff974d; }
  &:disabled { background: #3a3a3a; border-color: #3a3a3a; color: #888; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 77, 79, 0.08);
  border: 1px solid rgba(255, 77, 79, 0.35);
  color: #ffb3b3;
  font-size: 12px;
`;

const ValidationText = styled.div`
  color: ${props => (props.error ? '#ff4d4f' : '#00ff9d')};
  font-size: 11px;
  margin-top: 4px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ErrorAlert = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: "⚠️";
    font-size: 14px;
  }
`;

const ValidationError = styled.div`
  color: #fca5a5;
  font-size: 11px;
  margin-top: 4px;
  font-weight: 500;
`;

function DataPanel({ marketData, onCalculateSurface, isCalculating, error, selectedSymbol }) {
  const [selectedModel, setSelectedModel] = useState('blackscholes');
  const [riskFreeRate, setRiskFreeRate] = useState(0.05);
  const [spotPrice, setSpotPrice] = useState(400);
  const [validationErrors, setValidationErrors] = useState({});
  const [stockInfo, setStockInfo] = useState(null);
  const [stockInfoLoading, setStockInfoLoading] = useState(false);
  const [stockInfoError, setStockInfoError] = useState(null);

  // Fetch stock info when selectedSymbol changes
  useEffect(() => {
    if (!selectedSymbol) return;
    
    setStockInfoLoading(true);
    setStockInfoError(null);
    
    fetch(`http://localhost:8000/api/stock_info?ticker=${selectedSymbol}`)
      .then(response => response.json())
      .then(data => {
        if (data.stock_info) {
          setStockInfo(data.stock_info);
          // Update spot price from fetched data
          if (data.stock_info.price_data?.current_price) {
            setSpotPrice(data.stock_info.price_data.current_price);
          }
        } else {
          setStockInfoError('No stock data available');
        }
      })
      .catch(err => {
        console.error('Error fetching stock info:', err);
        setStockInfoError(err.message);
      })
      .finally(() => {
        setStockInfoLoading(false);
      });
  }, [selectedSymbol]);

  // Validate parameters
  useEffect(() => {
    const errors = {};
    
    if (riskFreeRate < 0 || riskFreeRate > 1) {
      errors.riskFreeRate = 'Rate must be between 0 and 1';
    }
    
    if (spotPrice <= 0) {
      errors.spotPrice = 'Spot price must be positive';
    }
    
    if (marketData.length === 0) {
      errors.data = 'No market data available';
    }
    
    setValidationErrors(errors);
  }, [riskFreeRate, spotPrice, marketData.length]);

  const handleCalculate = () => {
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    onCalculateSurface({
      model: selectedModel,
      riskFreeRate,
      spotPrice
    });
  };

  const isCalculateDisabled = isCalculating || Object.keys(validationErrors).length > 0;

  return (
    <PanelContainer>
      {error && (
        <ErrorAlert>
          <strong>Data Error:</strong> {error}
        </ErrorAlert>
      )}

      <SectionCard>
        <CardHeader>Market Parameters</CardHeader>
        <CardBody>
          <FormField>
            <Label>Spot Price ($)</Label>
            <Input
              type="number"
              value={spotPrice || ''}
              onChange={(e) => setSpotPrice(e.target.value ? Number(e.target.value) : '')}
              min={0.01}
              step={0.01}
              placeholder="e.g., 400.00"
              onBlur={(e) => {
                if (e.target.value && Number(e.target.value) > 0) {
                  setSpotPrice(Number(Number(e.target.value).toFixed(2)));
                }
              }}
            />
            {validationErrors.spotPrice && (
              <ValidationError>{validationErrors.spotPrice}</ValidationError>
            )}
          </FormField>

          <FormField>
            <Label>Risk-Free Rate (%)</Label>
            <Input
              type="number"
              value={riskFreeRate ? (riskFreeRate * 100).toFixed(2) : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setRiskFreeRate(0);
                } else {
                  const rate = Number(value) / 100;
                  if (rate >= 0 && rate <= 1) {
                    setRiskFreeRate(rate);
                  }
                }
              }}
              min={0}
              max={100}
              step={0.01}
              placeholder="e.g., 5.00"
              onBlur={(e) => {
                if (e.target.value === '') {
                  setRiskFreeRate(0.05);
                }
              }}
            />
            {validationErrors.riskFreeRate && (
              <ValidationError>{validationErrors.riskFreeRate}</ValidationError>
            )}
          </FormField>

          <FormField>
            <Label>Pricing Model</Label>
            <Select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ fontFamily: 'Monaco, "Courier New", monospace' }}
            >
              <option value="blackscholes">Black-Scholes</option>
              <option value="heston" disabled>Heston Stochastic (Coming Soon)</option>
              <option value="sabr" disabled>SABR Model (Coming Soon)</option>
              <option value="svi" disabled>SVI Parameterization (Coming Soon)</option>
            </Select>
          </FormField>

          <ControlButton
            onClick={handleCalculate}
            disabled={isCalculateDisabled}
            title={
              Object.keys(validationErrors).length > 0 
                ? `Fix errors: ${Object.values(validationErrors).join(', ')}` 
                : isCalculating 
                  ? 'Calculation in progress...' 
                  : 'Calculate volatility surface (Ctrl+Enter)'
            }
          >
            {isCalculating ? (
              <>
                <span style={{animation: 'pulse 1.5s infinite'}}>●</span>
                &nbsp;Calculating...
              </>
            ) : (
              'Build Surface'
            )}
          </ControlButton>
        </CardBody>
      </SectionCard>

      {/* {selectedSymbol && (
        // <StockInfo
        //   stockInfo={stockInfo}
        //   loading={stockInfoLoading}
        //   error={stockInfoError}
        // />
      )} */} {/* Stock Info Panel Needs fixing */}
    </PanelContainer>
  );
}

export default DataPanel;