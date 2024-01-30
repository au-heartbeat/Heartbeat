import { StyledErrorMessage, StyledErrorSection, StyledImgSection } from '@src/components/ErrorMessagePrompt/style';
import EmptyBox from '@src/assets/EmptyBox.svg';
import React from 'react';

export const ErrorMessagePrompt = (props: { errorMessage: string }) => {
  const { errorMessage } = props;
  return (
    <StyledErrorSection>
      <StyledImgSection src={EmptyBox} alt='empty image' />
      <StyledErrorMessage>{errorMessage}</StyledErrorMessage>
    </StyledErrorSection>
  );
};
