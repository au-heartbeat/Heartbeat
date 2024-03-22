import { StyledAlert, StyledBoldText, StyledText } from '@src/containers/MetricsStep/TokenAccessAlert/style';
import EllipsisText from '@src/components/Common/EllipsisText';
import { README_LINK } from '@src/constants/resources';
import CancelIcon from '@mui/icons-material/Cancel';

interface PropsInterface {
  isPermissionDeny: boolean;
}
export const TokenAccessAlert = ({ isPermissionDeny }: PropsInterface) => {
  return (
    <>
      {isPermissionDeny && (
        <StyledAlert data-testid='tokenAccessAlert' icon={<CancelIcon fontSize='inherit' />} severity='error'>
          <EllipsisText fitContent>
            <StyledText>
              <StyledBoldText>Limited access token:</StyledBoldText> please change your{' '}
              <StyledBoldText>Github</StyledBoldText> token with{' '}
              <a href={README_LINK} target='_blank' rel='noreferrer'>
                correct access permission
              </a>
            </StyledText>
          </EllipsisText>
        </StyledAlert>
      )}
    </>
  );
};
