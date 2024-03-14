import { StyledAlert, StyledTypography } from '@src/containers/ConfigStep/TimeoutAlert/style';
import EllipsisText from '@src/components/Common/EllipsisText';
import CancelIcon from '@mui/icons-material/Cancel';

interface PropsInterface {
  isVerifyTimeOut: boolean;
  isShowAlert: boolean;
  setIsShowAlert: (value: boolean) => void;
  moduleType: string;
}
export const TimeoutAlert = ({ isVerifyTimeOut, isShowAlert, setIsShowAlert, moduleType }: PropsInterface) => {
  return (
    <>
      {isVerifyTimeOut && isShowAlert && (
        <StyledAlert
          icon={<CancelIcon fontSize='inherit' />}
          severity='error'
          onClose={() => {
            setIsShowAlert(false);
          }}
        >
          <StyledTypography>
            <EllipsisText fitContent>
              Submission timeout on <span>{moduleType}</span> , please reverify!
            </EllipsisText>
          </StyledTypography>
        </StyledAlert>
      )}
    </>
  );
};
