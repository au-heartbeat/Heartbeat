import { StyledAlert } from '@src/containers/ConfigStep/BoardVerifyAlert/style';
import EllipsisText from '@src/components/Common/EllipsisText';
import BoldText from '@src/components/Common/BoldText';
import CancelIcon from '@mui/icons-material/Cancel';

interface PropsInterface {
  showAlert: boolean;
  onClose: () => void;
}
export const BoardVerifyAlert = ({ showAlert, onClose }: PropsInterface) => {
  return (
    <>
      {showAlert && (
        <StyledAlert
          data-testid='boardVerifyAlert'
          icon={<CancelIcon fontSize='inherit' />}
          severity='error'
          onClose={onClose}
        >
          <EllipsisText fitContent>
            <BoldText>Email</BoldText> and <BoldText>Token</BoldText> are bound for verification. Please modify at least
            one of the Email or Token before reverify!
          </EllipsisText>
        </StyledAlert>
      )}
    </>
  );
};
