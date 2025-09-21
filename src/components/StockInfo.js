import React from 'react';
import styled from 'styled-components';

const StockInfoContainer = styled.div`
  background: #0f0f10;
  border: 1px solid #262626;
  border-radius: 10px;
  overflow: hidden;
`;

const StockHeader = styled.div`
  background: linear-gradient(135deg, #151515 0%, #1a1a1a 100%);
  border-bottom: 1px solid #2c2c2c;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StockTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CompanyName = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const StockSymbol = styled.span`
  color: #ff7a1a;
  font-size: 12px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
`;

const LastUpdated = styled.div`
  color: #666;
  font-size: 10px;
  text-align: right;
`;

const StockBody = styled.div`
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h4`
  color: #bbb;
  margin: 0 0 6px 0;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #2a2a2a;
  padding-bottom: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
`;

const InfoLabel = styled.span`
  color: #888;
  font-size: 11px;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: ${props => props.color || '#fff'};
  font-size: 12px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  text-align: right;
`;

const PriceDisplay = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  grid-column: 1 / -1;
`;

const CurrentPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
`;

const Price = styled.span`
  color: #ff7a1a;
  font-size: 20px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
`;

const PriceChange = styled.span`
  color: ${props => props.isPositive ? '#00ff9d' : '#ff4d4f'};
  font-size: 12px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
`;

const PriceRanges = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 10px;
`;

const RangeItem = styled.div`
  color: #888;
  
  span {
    color: #ccc;
    font-weight: 600;
  }
`;

const MetricCard = styled.div`
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
`;

const MetricValue = styled.div`
  color: #ff7a1a;
  font-size: 14px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 2px;
`;

const MetricLabel = styled.div`
  color: #888;
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PerformanceBar = styled.div`
  background: #1a1a1a;
  border-radius: 4px;
  height: 20px;
  position: relative;
  overflow: hidden;
  margin: 8px 0;
`;

const PerformanceFill = styled.div`
  background: ${props => props.isPositive ? 
    'linear-gradient(90deg, #00ff9d40, #00ff9d)' : 
    'linear-gradient(90deg, #ff4d4f40, #ff4d4f)'};
  height: 100%;
  width: ${props => Math.min(Math.abs(props.percentage), 100)}%;
  transition: width 0.3s ease;
`;

const PerformanceLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  color: #888;
  font-size: 12px;
`;

const ErrorState = styled.div`
  padding: 16px;
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
`;

const DataSourceIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.6rem;
  background: ${props => props.isLive ? 'rgba(0, 204, 102, 0.1)' : 'rgba(255, 122, 26, 0.1)'};
  border: 1px solid ${props => props.isLive ? '#00cc66' : '#ff7a1a'};
  border-radius: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.isLive ? '#00cc66' : '#ff7a1a'};
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.05em;
`;

const StatusDot = styled.div`
  width: 0.6rem;
  height: 0.6rem;
  background: ${props => props.isLive ? '#00cc66' : '#ff7a1a'};
  border-radius: 0;
  animation: ${props => props.isLive ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const formatNumber = (value, decimals = 2) => {
  if (value === 0 || value === null || value === undefined) return 'N/A';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e12) {
    return `${(value / 1e12).toFixed(1)}T`;
  } else if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  } else {
    return value.toFixed(decimals);
  }
};

const formatPercentage = (value) => {
  if (value === 0 || value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const getChangeColor = (value) => {
  if (value > 0) return '#00ff9d';
  if (value < 0) return '#ff4d4f';
  return '#888';
};

function StockInfo({ stockInfo, loading, error }) {
  if (loading) {
    return (
      <StockInfoContainer>
        <StockHeader>
          <StockTitle>
            <CompanyName>Loading Stock Data...</CompanyName>
          </StockTitle>
        </StockHeader>
        <LoadingState>
          <div style={{animation: 'pulse 1.5s infinite'}}>●</div>
          &nbsp;Fetching stock information...
        </LoadingState>
      </StockInfoContainer>
    );
  }

  if (error) {
    return (
      <StockInfoContainer>
        <ErrorState>
          <strong>Error loading stock data:</strong> {error}
        </ErrorState>
      </StockInfoContainer>
    );
  }

  if (!stockInfo) {
    return null;
  }

  const { 
    company_name, 
    symbol, 
    price_data, 
    performance, 
    volatility, 
    volume, 
    fundamentals, 
    analyst_data,
    sector,
    industry,
    market_cap,
    last_updated,
    data_source,
    is_live_data
  } = stockInfo;

  const dayChangeColor = getChangeColor(performance?.day_change_percent || 0);
  const isDayPositive = (performance?.day_change_percent || 0) >= 0;

  return (
    <StockInfoContainer>
      <StockHeader>
        <StockTitle>
          <CompanyName>{company_name || symbol}</CompanyName>
          <StockSymbol>{symbol} • {sector} • {industry}</StockSymbol>
        </StockTitle>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <DataSourceIndicator isLive={is_live_data}>
            <StatusDot isLive={is_live_data} />
            {is_live_data ? 'LIVE' : 'DEMO'}
          </DataSourceIndicator>
          <LastUpdated>
            {data_source === 'twelve_data' ? 'Twelve Data' : 
             data_source === 'synthetic_fallback' ? 'Synthetic' : 
             data_source || 'Unknown'} • {new Date(last_updated).toLocaleTimeString()}
          </LastUpdated>
        </div>
      </StockHeader>

      <StockBody>
        <PriceDisplay>
          <CurrentPrice>
            <Price>${formatNumber(price_data?.current_price, 2)}</Price>
            <PriceChange isPositive={isDayPositive}>
              {formatPercentage(performance?.day_change_percent)} 
              ({isDayPositive ? '+' : ''}${formatNumber(performance?.day_change, 2)})
            </PriceChange>
          </CurrentPrice>
          
          <PriceRanges>
            <RangeItem>
              Day: <span>${formatNumber(price_data?.day_low, 2)} - ${formatNumber(price_data?.day_high, 2)}</span>
            </RangeItem>
            <RangeItem>
              52W: <span>${formatNumber(price_data?.week_52_low, 2)} - ${formatNumber(price_data?.week_52_high, 2)}</span>
            </RangeItem>
          </PriceRanges>
        </PriceDisplay>

        <InfoSection>
          <SectionTitle>Performance</SectionTitle>
          
          <InfoRow>
            <InfoLabel>1 Week</InfoLabel>
            <InfoValue color={getChangeColor(performance?.week_change)}>
              {formatPercentage(performance?.week_change)}
            </InfoValue>
          </InfoRow>
          
          <PerformanceBar>
            <PerformanceFill 
              percentage={Math.abs(performance?.week_change || 0) * 2}
              isPositive={(performance?.week_change || 0) >= 0}
            />
            <PerformanceLabel>Week</PerformanceLabel>
          </PerformanceBar>

          <InfoRow>
            <InfoLabel>1 Month</InfoLabel>
            <InfoValue color={getChangeColor(performance?.month_change)}>
              {formatPercentage(performance?.month_change)}
            </InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>YTD</InfoLabel>
            <InfoValue color={getChangeColor(performance?.ytd_change)}>
              {formatPercentage(performance?.ytd_change)}
            </InfoValue>
          </InfoRow>
        </InfoSection>

        <InfoSection>
          <SectionTitle>Risk Metrics</SectionTitle>
          
          <InfoRow>
            <InfoLabel>Beta</InfoLabel>
            <InfoValue>{formatNumber(volatility?.beta, 2)}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Daily Vol</InfoLabel>
            <InfoValue>{formatNumber(volatility?.daily_volatility, 1)}%</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Annual Vol</InfoLabel>
            <InfoValue>{formatNumber(volatility?.annual_volatility, 1)}%</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Volume Ratio</InfoLabel>
            <InfoValue color={volume?.volume_ratio > 1.5 ? '#00ff9d' : '#888'}>
              {formatNumber(volume?.volume_ratio, 1)}x
            </InfoValue>
          </InfoRow>
        </InfoSection>

        <InfoSection>
          <SectionTitle>Fundamentals</SectionTitle>
          
          <InfoRow>
            <InfoLabel>Market Cap</InfoLabel>
            <InfoValue>${formatNumber(market_cap)}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>P/E Ratio</InfoLabel>
            <InfoValue>{formatNumber(fundamentals?.pe_ratio, 1)}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Forward P/E</InfoLabel>
            <InfoValue>{formatNumber(fundamentals?.forward_pe, 1)}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>P/B Ratio</InfoLabel>
            <InfoValue>{formatNumber(fundamentals?.price_to_book, 1)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Div Yield</InfoLabel>
            <InfoValue>{formatNumber(fundamentals?.dividend_yield, 2)}%</InfoValue>
          </InfoRow>
        </InfoSection>

        <InfoSection>
          <SectionTitle>Analyst Targets</SectionTitle>
          
          <InfoRow>
            <InfoLabel>Mean Target</InfoLabel>
            <InfoValue color="#00ff9d">
              ${formatNumber(analyst_data?.target_mean, 2)}
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Range</InfoLabel>
            <InfoValue>
              ${formatNumber(analyst_data?.target_low, 2)} - ${formatNumber(analyst_data?.target_high, 2)}
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Recommendation</InfoLabel>
            <InfoValue style={{textTransform: 'capitalize'}}>
              {analyst_data?.recommendation || 'N/A'}
            </InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Analysts</InfoLabel>
            <InfoValue>{analyst_data?.number_of_analysts || 0}</InfoValue>
          </InfoRow>
        </InfoSection>
      </StockBody>
    </StockInfoContainer>
  );
}

export default StockInfo;