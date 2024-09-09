import {
  StyledItemSection,
  StyledReportCard,
  StyledReportCardTitle,
} from '@src/components/Common/ReportGrid/ReportCard/style';
import { ReportCardItem, ReportCardItemProps } from '@src/components/Common/ReportGrid/ReportCardItem';
import { DoraMetricsDialog } from '@src/components/Common/ReportGrid/ReportCard/DoraMetricsDialog';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { ErrorMessagePrompt } from '@src/components/ErrorMessagePrompt';
import { StyledLink } from '@src/containers/MetricsStep/style';
import { DORA_METRICS } from '@src/constants/resources';
import React, { HTMLAttributes, useState } from 'react';
import { GRID_CONFIG } from '@src/constants/commons';
import { Loading } from '@src/components/Loading';
import { getDeviceSize } from '@src/utils/util';

interface ReportCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  items?: ReportCardItemProps[] | null;
  xs: number;
  errorMessage: string | undefined;
  isExistSourceControl?: boolean;
}

export const ReportCard = ({ title, items, xs, errorMessage, isExistSourceControl = false }: ReportCardProps) => {
  const [isShowDialog, setIsShowDialog] = useState<boolean>(false);
  const defaultFlex = 1;
  const getReportItems = () => {
    let style = GRID_CONFIG.FULL;
    switch (xs) {
      case GRID_CONFIG.HALF.XS:
        style = GRID_CONFIG.HALF;
        break;
      case GRID_CONFIG.FULL.XS:
        style = GRID_CONFIG.FULL;
        break;
    }

    const getFlex = (length: number) => {
      if (getDeviceSize() === 'md') {
        return 0;
      }
      if (length <= 1) {
        return defaultFlex;
      } else {
        switch (xs) {
          case GRID_CONFIG.FULL.XS:
            return GRID_CONFIG.FULL.FLEX;
          case GRID_CONFIG.HALF.XS:
            return GRID_CONFIG.HALF.FLEX;
        }
      }
    };

    const isShowDividingLine = (index: number): boolean => {
      if (getDeviceSize() === 'lg') {
        return items!.length > 1 && index > 0;
      }
      return index % 2 !== 0;
    };

    return (
      <StyledItemSection data-test-id={'report-section'}>
        {items?.map((item, index) =>
          index < style.MAX_INDEX ? (
            <ReportCardItem
              key={index}
              isGray={index === 1 && isExistSourceControl}
              value={item.value}
              isToFixed={item.isToFixed}
              extraValue={item.extraValue}
              subtitle={item.subtitle}
              showDividingLine={isShowDividingLine(index)}
              style={{ flexGrow: getFlex(items.length) }}
            />
          ) : (
            <></>
          ),
        )}
      </StyledItemSection>
    );
  };

  const handleOpenDialog = () => {
    setIsShowDialog(true);
  };

  const handleCloseDialog = () => {
    setIsShowDialog(false);
  };

  return (
    <StyledReportCard data-test-id={title}>
      {!errorMessage && !items && <Loading size='1.5rem' backgroundColor='transparent' />}
      {isShowDialog && <DoraMetricsDialog isShowDialog={isShowDialog} hiddenDialog={handleCloseDialog} title={title} />}
      <StyledReportCardTitle>
        {title}
        {DORA_METRICS.some((it) => it.toLowerCase() === title.toLowerCase()) && (
          <StyledLink onClick={handleOpenDialog} aria-label={`${title.toLowerCase()} explanation`}>
            <HelpOutlineOutlinedIcon fontSize='small' />
          </StyledLink>
        )}
      </StyledReportCardTitle>
      {errorMessage && <ErrorMessagePrompt errorMessage={errorMessage} />}
      {!errorMessage && items && getReportItems()}
    </StyledReportCard>
  );
};
