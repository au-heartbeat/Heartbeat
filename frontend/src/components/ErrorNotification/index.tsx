<<<<<<< HEAD
import { ErrorBar, StyledAlert } from './style';

export const ErrorNotification = (props: { message: string }) => {
  const { message } = props;
=======
import { ErrorBar, StyledAlert } from './style'

export const ErrorNotification = (props: { message: string }) => {
  const { message } = props
>>>>>>> 46c478e0 ([kai.zhou][adm-718]: feat: add addtional key for form field)
  return (
    <ErrorBar aria-label='Error notification bar' open={true}>
      <StyledAlert severity='error'>{message}</StyledAlert>
    </ErrorBar>
  );
};
