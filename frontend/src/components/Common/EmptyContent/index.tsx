// todo: fix to test coverage @ Kai Zhou
/* istanbul ignore file */
import { StyledErrorMessage, StyledErrorSection, StyledImgSection, StyledErrorTitle } from './styles';
import EmptyBox from '@src/assets/EmptyBox.svg';
import { ReactNode } from 'react';

export interface Props {
  title: string;
  message: ReactNode;
}

const EmptyContent = ({ title, message }: Props) => {
  return (
    <StyledErrorSection>
      <StyledImgSection src={EmptyBox} alt='empty image' />
      <StyledErrorTitle>{title}</StyledErrorTitle>
      <StyledErrorMessage>{message}</StyledErrorMessage>
    </StyledErrorSection>
  );
};

export default EmptyContent;
