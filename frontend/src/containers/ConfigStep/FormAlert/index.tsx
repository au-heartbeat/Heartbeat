import { StyledAlert } from '@src/containers/ConfigStep/FormAlert/style';
import EllipsisText from '@src/components/Common/EllipsisText';
import { FORM_ALERT_TYPES } from '@src/constants/commons';
import BoldText from '@src/components/Common/BoldText';
import CancelIcon from '@mui/icons-material/Cancel';
import React from 'react';

interface PropsInterface {
  showAlert: boolean;
  onClose: () => void;
  moduleType?: string;
  formAlertType: FORM_ALERT_TYPES;
}

const FormAlertDataTestIdMap = (formAlertType: FORM_ALERT_TYPES): string => {
  const formAlertDataTestIdMap = {
    [FORM_ALERT_TYPES.TIMEOUT]: 'timeoutAlert',
    [FORM_ALERT_TYPES.BOARD_VERIFY]: 'boardVerifyAlert',
  };

  return formAlertDataTestIdMap[formAlertType];
};

export const FormAlert = ({ showAlert, onClose, moduleType, formAlertType }: PropsInterface) => {
  const renderMessage = () => {
    if (formAlertType === FORM_ALERT_TYPES.TIMEOUT) {
      return (
        <EllipsisText fitContent>
          Submission timeout on <BoldText>{moduleType}</BoldText>, please reverify!
        </EllipsisText>
      );
    } else if (formAlertType === FORM_ALERT_TYPES.BOARD_VERIFY) {
      return (
        <EllipsisText fitContent>
          <BoldText>Email</BoldText> and <BoldText>Token</BoldText> are bound for verification. Please modify at least
          one of the Email or Token before reverify!
        </EllipsisText>
      );
    }
  };

  return (
    <>
      {showAlert && (
        <StyledAlert
          data-testid={FormAlertDataTestIdMap(formAlertType)}
          icon={<CancelIcon fontSize='inherit' />}
          severity='error'
          onClose={onClose}
        >
          {renderMessage()}
        </StyledAlert>
      )}
    </>
  );
};
