import { StyledAlert, StyledTypography } from '@src/containers/ConfigStep/TimeoutAlert/style';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
interface PropsInterface {
  isHBTimeOut: boolean;
  isShowAlert: boolean;
  setIsShowAlert: (value: boolean) => void;
  moduleType: string;
}
export const TimeoutAlert = ({ isHBTimeOut, isShowAlert, setIsShowAlert, moduleType }: PropsInterface) => {
  return (
    <>
      {isHBTimeOut && isShowAlert && (
        <StyledAlert
          icon={<HighlightOffIcon fontSize='inherit' />}
          severity='error'
          onClose={() => {
            setIsShowAlert(false);
          }}
        >
          Submission timeout on <StyledTypography>{moduleType}</StyledTypography> , please reverify!
        </StyledAlert>
      )}
    </>
  );
};
