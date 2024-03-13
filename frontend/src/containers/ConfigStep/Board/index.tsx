import { ConfigSectionContainer, StyledButtonGroup, StyledForm } from '@src/components/Common/ConfigForms';
import { selectIsBoardVerified, selectBoard } from '@src/context/config/configSlice';
import { updateShouldGetBoardConfig } from '@src/context/Metrics/metricsSlice';
import { KEYS, useVerifyBoardEffect } from '@src/hooks/useVerifyBoardEffect';
import { ResetButton, VerifyButton } from '@src/components/Common/Buttons';
import { useAppSelector, useAppDispatch } from '@src/hooks/useAppDispatch';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { BOARD_TYPES, CONFIG_TITLE } from '@src/constants/resources';
import FormTextField from '@src/components/Common/FormTextField';
import FormSelector from '@src/components/Common/FormSelector';
import { boardConfigSchema, IBoardConfigData } from './schema';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loading } from '@src/components/Loading';
import { useMemo } from 'react';

export const Board = () => {
  const dispatch = useAppDispatch();
  const defaultValues = useAppSelector(selectBoard);
  const isVerified = useAppSelector(selectIsBoardVerified);
  const { verifyJira, isLoading, fields, resetFields } = useVerifyBoardEffect();

  const methods = useForm<IBoardConfigData>({
    defaultValues,
    resolver: yupResolver(boardConfigSchema),
    mode: 'onBlur',
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: IBoardConfigData) => {
    await verifyJira(data);
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
      <FormProvider {...methods}>
        <StyledForm onSubmit={handleSubmit(onSubmit)} onReset={resetFields}>
          {fields.map(({ key, col, name }, index) =>
            !index ? (
              <FormSelector
                key={index}
                name={name}
                label={key}
                options={Object.values(BOARD_TYPES).map((item) => ({ label: item, value: item }))}
              />
            ) : (
              <FormTextField
                required
                label={key}
                key={index}
                name={name}
                type={key === KEYS.TOKEN ? 'password' : 'text'}
                sx={{ gridColumn: `span ${col}` }}
              />
            ),
          )}
          <StyledButtonGroup>
            {isVerified && !isLoading ? (
              <VerifyButton disabled>Verified</VerifyButton>
            ) : (
              <VerifyButton type='submit' disabled={isDisableVerifyButton}>
                Verify
              </VerifyButton>
            )}
            {isVerified && !isLoading && <ResetButton type='reset'>Reset</ResetButton>}
          </StyledButtonGroup>
        </StyledForm>
      </FormProvider>
    </ConfigSectionContainer>
  );
};
