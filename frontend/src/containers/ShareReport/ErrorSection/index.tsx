import { ErrorContainer, ErrorMessage, ErrorTitle, ErrorImg } from './style';
import ErrorIcon from '@src/assets/Error.svg';
import React from 'react';

interface ErrorSectionProps {
  message: string;
}

const ErrorSection = (props: ErrorSectionProps) => {
  const { message } = props;
  return (
    <ErrorContainer>
      <ErrorImg src={ErrorIcon} alt='error logo' />
      <ErrorTitle>Oops!</ErrorTitle>
      <ErrorMessage>{message}</ErrorMessage>
    </ErrorContainer>
  );
};

export default ErrorSection;
