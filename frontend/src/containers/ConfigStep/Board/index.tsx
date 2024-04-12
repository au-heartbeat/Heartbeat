import { ConfigSectionContainer, StyledForm } from '@src/components/Common/ConfigForms';
import { FormTextField } from '@src/containers/ConfigStep/Board/FormTextField';
import { updateShouldGetBoardConfig } from '@src/context/Metrics/metricsSlice';
import { ConfigButtonGrop } from '@src/containers/ConfigStep/ConfigButton';
import { useAppSelector, useAppDispatch } from '@src/hooks/useAppDispatch';
import { FormSelect } from '@src/containers/ConfigStep/Board/FormSelect';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { selectIsBoardVerified } from '@src/context/config/configSlice';
import { TimeoutAlert } from '@src/containers/ConfigStep/TimeoutAlert';
import { useVerifyBoardEffect } from '@src/hooks/useVerifyBoardEffect';
import { StyledAlterWrapper } from '@src/containers/ConfigStep/style';
import { CONFIG_TITLE } from '@src/constants/resources';
import { Loading } from '@src/components/Loading';
import { useFormState } from 'react-hook-form';
import { FormEvent } from 'react';

export const Board = () => {
  const dispatch = useAppDispatch();
  const isVerified = useAppSelector(selectIsBoardVerified);
  const { verifyJira, isLoading, fields, isShowAlert, setIsShowAlert, resetFields, isVerifyTimeOut } =
    useVerifyBoardEffect();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verifyJira();
    dispatch(updateShouldGetBoardConfig(true));
  };

  const { isValid, isSubmitted } = useFormState();
  console.log('isValid', isValid);
  console.log('isSubmitted', isSubmitted);

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
        {fields.map(({ key, col }) =>
          key === 'type' ? <FormSelect name={key} key={key} /> : <FormTextField name={key} key={key} col={col} />,
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
