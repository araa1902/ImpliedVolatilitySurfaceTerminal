import React from 'react';
import styled from 'styled-components';

const MarketContainer = styled.div`
  padding: 16px;
  flex-shrink: 0;
`;

const SectionCard = styled.div`
  background: #0f0f10;
  border: 1px solid #262626;
  border-radius: 10px;
  overflow: hidden;
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
  padding: 10px 12px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
`;

const MetricLabel = styled.span`
  color: #b3b3b3;
  font-size: 11px;
`;

const MetricValue = styled.span`
  color: ${props => props.positive ? '#00ff9d' : props.negative ? '#ff4d4f' : '#ffffff'};
  font-weight: 700;
  font-size: 12px;
`;

const VolumeBar = styled.div`
  width: 100%;
  height: 4px;
  background: #1f1f1f;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.percentage}%;
    background: linear-gradient(90deg, #ff7a1a, #ff9a4a);
    transition: width 0.3s ease;
  }
`;

function MarketData({ data }) {
  const calculateActualMetrics = () => {
    if (!data || data.length === 0) {
      return {
        avgIV: 0, dataPoints: 0, minStrike: 0, maxStrike: 0, expirationCount: 0
      };
    }
    const avgIV = data.reduce((sum, item) => sum + (item.impliedVol || 0), 0) / data.length;
    const strikes = data.map(item => item.strike);
    const minStrike = Math.min(...strikes);
    const maxStrike = Math.max(...strikes);
    const expirations = [...new Set(data.map(item => item.expiry))];
    return { avgIV, dataPoints: data.length, minStrike, maxStrike, expirationCount: expirations.length };
  };

  const metrics = calculateActualMetrics();

  return (
    <MarketContainer>
      <SectionCard>
        <CardHeader>DATA SUMMARY</CardHeader>
        <CardBody>
          <MetricRow>
            <MetricLabel>Data Points</MetricLabel>
            <MetricValue>{metrics.dataPoints}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Avg Implied Vol</MetricLabel>
            <MetricValue>{(metrics.avgIV * 100).toFixed(1)}%</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Strike Range</MetricLabel>
            <MetricValue>${metrics.minStrike.toFixed(0)} - ${metrics.maxStrike.toFixed(0)}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Expirations</MetricLabel>
            <MetricValue>{metrics.expirationCount}</MetricValue>
          </MetricRow>
        </CardBody>
      </SectionCard>
    </MarketContainer>
  );
}

export default MarketData;