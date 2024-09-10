import {
  StyledContent,
  StyledDividingLine,
  StyledExtraValue,
  StyledItem,
  StyledSubtitle,
  StyledValue,
  StyledValueSection,
  StyledWrapper,
} from '@src/components/Common/ReportGrid/ReportCardItem/style';
import DividingLine from '@src/assets/DividingLine.svg';
import React, { HTMLAttributes } from 'react';
import { Tooltip } from '@mui/material';
import { theme } from '@src/theme';

export interface ReportCardItemProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  isToFixed?: boolean;
  extraValue?: string;
  isGray?: boolean;
  subtitle: string;
  showDividingLine?: boolean;
}

export const ReportCardItem = ({
  style,
  value,
  isToFixed = true,
  isGray,
  extraValue,
  subtitle,
  showDividingLine,
}: ReportCardItemProps) => {
  return (
    <StyledItem
      aria-label={'report card item'}
      style={{
        ...style,
        color: isGray ? 'gray' : theme.main.secondColor,
      }}
    >
      {showDividingLine && <StyledDividingLine src={DividingLine} alt='Dividing Line' />}
      <StyledWrapper>
        <StyledContent>
          <StyledValueSection>
            <StyledValue>{isToFixed ? value.toFixed(2) : value}</StyledValue>
            {extraValue && <StyledExtraValue>{extraValue}</StyledExtraValue>}
          </StyledValueSection>
        </StyledContent>
        <Tooltip arrow title={subtitle} placement={'bottom'}>
          <StyledSubtitle
            style={{
              color: isGray ? 'gray' : theme.main.secondColor,
            }}
          >
            {subtitle}
          </StyledSubtitle>
        </Tooltip>
      </StyledWrapper>
    </StyledItem>
  );
};
