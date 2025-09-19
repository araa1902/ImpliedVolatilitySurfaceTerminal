import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  background: var(--bg-header);
  border-bottom: 2px solid var(--bloomberg-orange);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 0 rgba(255, 122, 26, 0.3);
  font-family: 'JetBrains Mono', monospace;
  min-height: 60px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--bloomberg-orange);
  font-weight: 900;
  letter-spacing: 1px;
  font-size: 24px;
`;

const AppTitle = styled.h4`
  color: var(--text-accent);
  margin: 0;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const CommandContainer = styled.div`
  position: relative;
  width: 200px;
`;

const CommandInput = styled.input`
  width: 100%;
  height: 36px;
  background: transparent;
  border: 2px solid var(--bloomberg-orange);
  color: var(--text-accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  caret-color: var(--bloomberg-orange);
  padding: 0 12px;
  border-radius: 8px;
  outline: none;
  font-family: 'JetBrains Mono', monospace;

  &:hover {
    border-color: #ff9a4a;
    box-shadow: 0 0 0 2px rgba(255, 154, 74, 0.15);
  }

  &:focus {
    border-color: #ff9a4a;
    box-shadow: 0 0 0 3px rgba(255, 154, 74, 0.25);
  }

  &::placeholder {
    color: rgba(255, 170, 0, 0.5);
    text-transform: none;
    letter-spacing: normal;
  }
`;

const CommandList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
  background: #0a0a0a;
  border: 1px solid var(--bloomberg-orange);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.show ? 'block' : 'none'};
`;

const CommandItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  color: var(--text-accent);
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 122, 26, 0.15);
    color: var(--bloomberg-orange);
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const CommandEmpty = styled.div`
  padding: 12px;
  text-align: center;
  color: #666;
  font-size: 12px;
`;

function Header({ selectedSymbol, setSelectedSymbol }) {
  const symbols = [
    ...new Set([
      // Major Indices & ETFs
      'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VEA', 'VWO', 'EFA', 'EEM', 'AGG', 'ARKK', 'SQQQ', 'TQQQ',
      
      // Mega Cap Tech
      'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'CRM',
      'ORCL', 'ADBE', 'AVGO', 'CSCO', 'INTC', 'IBM', 'NOW', 'SNOW', 'PLTR', 'UBER',
      
      // Blue Chip Stocks
      'BRK.B', 'JPM', 'JNJ', 'V', 'MA', 'HD', 'PG', 'BAC', 'KO', 'PFE',
      'WMT', 'DIS', 'VZ', 'T', 'MRK', 'CVX', 'XOM', 'LLY', 'ABBV',
      
      // Chinese ADRs
      'NIO', 'XPEV', 'LI', 'BABA', 'JD', 'PDD', 'DIDI',
      
      // Financial Services
      'GS', 'MS', 'C', 'WFC', 'USB', 'PNC', 'COF', 'AXP', 'SCHW', 'BLK',
      
      // Healthcare & Biotech
      'UNH', 'GILD', 'BIIB', 'REGN', 'VRTX', 'ILMN', 'MRNA', 'BNTX', 'ZTS', 'TMO',
      
      // Energy Sector
      'SLB', 'EOG', 'COP', 'KMI', 'OXY', 'HAL', 'DVN', 'FANG', 'MPC', 'VLO',
      
      // Consumer & Retail
      'COST', 'NKE', 'SBUX', 'MCD', 'TGT', 'LOW', 'F', 'GM', 'ABNB',
      
      // Communications
      'CMCSA', 'CHTR', 'TMUS', 'DISH',
      
      // Semiconductors
      'QCOM', 'AMAT', 'LRCX', 'KLAC', 'MRVL', 'MU',
      
      // REITs
      'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'EXR', 'O', 'WELL', 'DLR', 'SPG',
      
      // Utilities
      'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'PEG', 'XEL', 'ED',
      
      // Crypto/Blockchain
      'MSTR', 'RIOT', 'MARA', 'BITF', 'CAN', 'EBON', 'BTBT', 'SOS', 'EQOS'
    ])
  ]
  const [query, setQuery] = React.useState(selectedSymbol || '');
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  React.useEffect(() => {
    setQuery(selectedSymbol || '');
  }, [selectedSymbol]);

  const upper = (s) => (s || '').toUpperCase();

  const commitSymbol = (val) => {
    const sym = upper(val).replace(/[^A-Z.]/g, '').slice(0, 10);
    setQuery(sym);
    if (sym) setSelectedSymbol(sym);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const filteredSymbols = React.useMemo(() => {
    if (!query) return symbols.slice(0, 10);
    
    const queryUpper = query.toUpperCase();
    const exact = symbols.filter(symbol => symbol === queryUpper);
    const startsWith = symbols.filter(symbol => 
      symbol.startsWith(queryUpper) && !exact.includes(symbol)
    );
    const contains = symbols.filter(symbol => 
      symbol.includes(queryUpper) && !exact.includes(symbol) && !startsWith.includes(symbol)
    );
    
    return [...exact, ...startsWith, ...contains].slice(0, 8);
  }, [query]);

  const handleInputChange = (e) => {
    const value = upper(e.target.value);
    setQuery(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && filteredSymbols[highlightedIndex]) {
        commitSymbol(filteredSymbols[highlightedIndex]);
      } else {
        commitSymbol(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSymbols.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSymbols.length - 1
      );
    }
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo>◆</Logo>
        <AppTitle>comet</AppTitle>
        <CommandContainer>
          <CommandInput
            placeholder="Search ticker..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(query.length > 0)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          />
          <CommandList show={isOpen}>
            {filteredSymbols.length > 0 ? (
              filteredSymbols.map(symbol => (
                <CommandItem
                  key={symbol}
                  onMouseDown={() => commitSymbol(symbol)}
                >
                  {symbol}
                </CommandItem>
              ))
            ) : (
              <CommandEmpty>No ticker found.</CommandEmpty>
            )}
          </CommandList>
        </CommandContainer>
      </LeftSection>
    </HeaderContainer>
  );
}

export default Header;