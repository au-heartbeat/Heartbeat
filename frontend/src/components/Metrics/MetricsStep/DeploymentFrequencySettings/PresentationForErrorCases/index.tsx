import {
  StyledContainer,
  StyledImageContainer,
  StyledImage,
  StyledRetryMessage,
  StyledRetryButton,
} from '@src/components/Metrics/MetricsStep/DeploymentFrequencySettings/PresentationForErrorCases/style';
import { StyledErrorMessage, StyledErrorSection, StyledErrorTitle } from '@src/components/Common/EmptyContent/styles';
import { PIPELINE_TOOL_RETRY_MESSAGE, PIPELINE_TOOL_RETRY_TRIGGER_MESSAGE } from '@src/constants/resources';
import { AxiosRequestErrorCode } from '@src/constants/resources';
import errorSvg from '@src/assets/PipelineInfoError.svg';
import React, { useCallback } from 'react';

export interface IPresentationForErrorCasesProps {
  retry: () => void;
  isLoading: boolean;
  code: number | string | undefined | null;
  errorTitle: string;
  errorMessage: string;
}

const PresentationForErrorCases = (props: IPresentationForErrorCasesProps) => {
  const handleRetry = useCallback(() => !props.isLoading && props.retry(), [props]);
  const isShowRetryUI = AxiosRequestErrorCode.Timeout === props.code;
  return (
    <StyledContainer aria-label='Error UI for pipeline settings'>
      <StyledImageContainer>
        <StyledImage src={errorSvg} alt={'pipeline info error'} loading='lazy' />
      </StyledImageContainer>
      {isShowRetryUI ? (
        <StyledRetryMessage>
          <span>{PIPELINE_TOOL_RETRY_MESSAGE}</span>
          <StyledRetryButton aria-label={'retry button'} onClick={handleRetry} isLoading={props.isLoading}>
            {PIPELINE_TOOL_RETRY_TRIGGER_MESSAGE}
          </StyledRetryButton>
        </StyledRetryMessage>
      ) : (
        <StyledErrorSection>
          <StyledErrorTitle>{props.errorTitle}</StyledErrorTitle>
          <StyledErrorMessage>{props.errorMessage}</StyledErrorMessage>
        </StyledErrorSection>
      )}
    </StyledContainer>
  );
};

export default PresentationForErrorCases;
