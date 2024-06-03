import { ConfigSectionContainer, StyledForm } from '@src/components/Common/ConfigForms';
import { BOARD_CONFIG_ERROR_MESSAGE } from '@src/containers/ConfigStep/Form/literal';
import { FormTextField } from '@src/containers/ConfigStep/Board/FormTextField';
import { FormSingleSelect } from '@src/containers/ConfigStep/Form/FormSelect';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { useVerifyBoardEffect } from '@src/hooks/useVerifyBoardEffect';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { ConfigTitle, BOARD_TYPES } from '@src/constants/resources';
import { FormAlert } from '@src/containers/ConfigStep/FormAlert';
import { formAlertTypes } from '@src/constants/commons';
import { Loading } from '@src/components/Loading';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';

export const Board = () => {
  const { verifyJira, isLoading, fields, resetFields } = useVerifyBoardEffect();
  const {
    formState: { isValid, isSubmitSuccessful, errors },
    handleSubmit,
  } = useFormContext();
  const [alertVisible, setAlertVisible] = useState(false);
  const isVerifyTimeOut = errors.token?.message === BOARD_CONFIG_ERROR_MESSAGE.token.timeout;
  const isBoardVerifyFailed =
    errors.email?.message === BOARD_CONFIG_ERROR_MESSAGE.email.verifyFailed ||
    errors.token?.message === BOARD_CONFIG_ERROR_MESSAGE.token.verifyFailed;
  const isVerified = isValid && isSubmitSuccessful;
  const showAlert = alertVisible && (isVerifyTimeOut || isBoardVerifyFailed);
  const formAlertType = isVerifyTimeOut ? formAlertTypes.Timeout : formAlertTypes.BoardVerify;
  const onSubmit = async () => await verifyJira();
  const closeAlert = () => setAlertVisible(false);

  useEffect(() => {
    if (isVerifyTimeOut || isBoardVerifyFailed) {
      setAlertVisible(true);
    }
  }, [isVerifyTimeOut, isBoardVerifyFailed]);

  return (
    <ConfigSectionContainer aria-label='Board Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{ConfigTitle.Board}</ConfigSelectionTitle>
      <StyledAlterWrapper>
        {showAlert && (
          <FormAlert showAlert={showAlert} onClose={closeAlert} moduleType={'Board'} formAlertType={formAlertType} />
        )}
      </StyledAlterWrapper>
      <StyledForm onSubmit={handleSubmit(onSubmit)} onReset={resetFields}>
        {fields.map(({ key, col, label }) =>
          key === 'type' ? (
            <FormSingleSelect
              key={key}
              name={key}
              options={Object.values(BOARD_TYPES)}
              labelText='Board'
              labelId='board-type-checkbox-label'
              selectLabelId='board-type-checkbox-label'
            />
          ) : (
            <FormTextField name={key} key={key} col={col} label={label} />
          ),
        )}
        <ConfigButtonGrop
          isVerifyTimeOut={isVerifyTimeOut}
          isVerified={isVerified}
          isDisableVerifyButton={!isValid}
          isLoading={isLoading}
        />
      </StyledForm>
    </ConfigSectionContainer>
  );
};
