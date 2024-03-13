import { ResetButton, ReverifyButton, VerifyButton } from '@src/components/Common/Buttons';
import { StyledButtonGroup } from '@src/components/Common/ConfigForms';

interface PropsInterface {
  isVerified: boolean;
  isLoading: boolean;
  isHBTimeOut: boolean;
  isDisableVerifyButton: boolean;
}
export const ConfigButtonGrop = ({ isVerified, isLoading, isHBTimeOut, isDisableVerifyButton }: PropsInterface) => {
  const renderVerifyButton = (
    isVerified: boolean,
    isLoading: boolean,
    isHBTimeOut: boolean,
    isDisableVerifyButton: boolean,
  ) => {
    if (isVerified && !isLoading) {
      return <VerifyButton disabled>Verified</VerifyButton>;
    } else if (isHBTimeOut) {
      return <ReverifyButton type='submit'>Reverify</ReverifyButton>;
    } else {
      return (
        <VerifyButton type='submit' disabled={isDisableVerifyButton}>
          Verify
        </VerifyButton>
      );
    }
  };
  return (
    <StyledButtonGroup>
      {renderVerifyButton(isVerified, isLoading, isHBTimeOut, isDisableVerifyButton)}
      {(isVerified || isHBTimeOut) && !isLoading && <ResetButton type='reset'>Reset</ResetButton>}
    </StyledButtonGroup>
  );
};
