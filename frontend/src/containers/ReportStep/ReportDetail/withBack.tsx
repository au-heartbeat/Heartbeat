import { BACK } from '@src/constants/resources';
import { ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { theme } from '@src/theme';
import React from 'react';
interface Property {
  onBack: () => void;
  isShowBack: boolean;
}

const StyledDiv = styled('div')`
  display: flex;
  align-items: center;
  width: max-content;
  z-index: 2;
  margin: 2.25rem 0 0 0;
  color: ${theme.main.secondColor};
  opacity: 0.65;
  cursor: pointer;
  font-size: 1rem;
`;

const StyledArrowBack = styled(ArrowBack)`
  width: 1.5rem;
  margin-right: 0.5rem;
`;

export const withGoBack =
  <P extends Property>(Child: React.ComponentType<P>) =>
  (prop: P) => (
    <>
      <StyledDiv onClick={prop.onBack} style={{ display: prop.isShowBack ? 'inherit' : 'none' }}>
        <StyledArrowBack />
        {BACK}
      </StyledDiv>
      <Child {...prop} />
    </>
  );
