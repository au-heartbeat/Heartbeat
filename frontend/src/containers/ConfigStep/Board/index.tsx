import {
  ConfigSectionContainer,
  StyledForm,
  StyledTextField,
  StyledTypeSelections,
} from '@src/components/Common/ConfigForms';
import { FormTextField } from '@src/containers/ConfigStep/Board/FormTextField';
import { updateShouldGetBoardConfig } from '@src/context/Metrics/metricsSlice';
import { KEYS, useVerifyBoardEffect } from '@src/hooks/useVerifyBoardEffect';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { useAppSelector, useAppDispatch } from '@src/hooks/useAppDispatch';
import { InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import { FormSelect } from '@src/containers/ConfigStep/Board/FormSelect';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { selectIsBoardVerified } from '@src/context/config/configSlice';
import { TimeoutAlert } from '@src/containers/ConfigStep/TimeoutAlert';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { BOARD_TYPES, CONFIG_TITLE } from '@src/constants/resources';
import { Loading } from '@src/components/Loading';
import { FormEvent, useMemo } from 'react';

export const Board = () => {
  const dispatch = useAppDispatch();
  const isVerified = useAppSelector(selectIsBoardVerified);
  const {
    verifyJira,
    isLoading,
    fields,
    updateField,
    isShowAlert,
    setIsShowAlert,
    validateField,
    resetFields,
    isVerifyTimeOut,
  } = useVerifyBoardEffect();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verifyJira();
    dispatch(updateShouldGetBoardConfig(true));
  };

  const isDisableVerifyButton = useMemo(
    () => isLoading || fields.some((field) => !field.value || field.validatedError || field.verifiedError),
    [fields, isLoading],
  );

  return (
    <ConfigSectionContainer aria-label='Board Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{CONFIG_TITLE.BOARD}</ConfigSelectionTitle>
      <StyledAlterWrapper>
        <TimeoutAlert
          isShowAlert={isShowAlert}
          isVerifyTimeOut={isVerifyTimeOut}
          setIsShowAlert={setIsShowAlert}
          moduleType={'Board'}
        />
      </StyledAlterWrapper>
      <StyledForm onSubmit={onSubmit} onReset={resetFields}>
        {fields.map(({ key, value, validatedError, verifiedError, col }, index) =>
          key === 'type' ? <FormSelect name={key} key={key} /> : <FormTextField name={key} key={key} col={col} />,
        )}
        <ConfigButtonGrop
          isVerifyTimeOut={isVerifyTimeOut}
          isVerified={isVerified}
          isDisableVerifyButton={isDisableVerifyButton}
          isLoading={isLoading}
        />
      </StyledForm>
    </ConfigSectionContainer>
  );
};
