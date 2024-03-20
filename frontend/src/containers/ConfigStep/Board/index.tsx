import {
  selectIsBoardVerified,
  selectBoard,
  updateBoardVerifyState,
  updateBoard,
} from '@src/context/config/configSlice';
import { BOARD_TYPES, CONFIG_TITLE, UNKNOWN_ERROR_TITLE, MESSAGE, BOARD_ERROR_INFO } from '@src/constants/resources';
import { ConfigSectionContainer, StyledButtonGroup, StyledForm } from '@src/components/Common/ConfigForms';
import { updateShouldGetBoardConfig } from '@src/context/Metrics/metricsSlice';
import { KEYS, useVerifyBoardEffect } from '@src/hooks/useVerifyBoardEffect';
import { ResetButton, VerifyButton } from '@src/components/Common/Buttons';
import { useAppSelector, useAppDispatch } from '@src/hooks/useAppDispatch';
import { ConfigSelectionTitle } from '@src/containers/MetricsStep/style';
import { IHeartBeatException } from '@src/exceptions/ExceptionType';
import FormTextField from '@src/components/Common/FormTextField';
import FormSelector from '@src/components/Common/FormSelector';
import { boardConfigSchema, IBoardConfigData } from './schema';
import { boardConfigDefaultValues } from './defaultValues';
import { useForm, FormProvider } from 'react-hook-form';
import { isHeartBeatException } from '@src/exceptions';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loading } from '@src/components/Loading';
import { HttpStatusCode } from 'axios';
import { useState } from 'react';
import get from 'lodash/get';

const boardType = [
  {
    label: 'Jira',
    value: BOARD_TYPES.JIRA,
  },
];

export const Board = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const defaultValues = useAppSelector(selectBoard);
  const isVerified = useAppSelector(selectIsBoardVerified);
  const { verifyJira, fields } = useVerifyBoardEffect();

  const methods = useForm<IBoardConfigData>({
    defaultValues,
    resolver: yupResolver(boardConfigSchema),
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { isValid },
    reset,
    setError,
  } = methods;

  const onSubmit = async (data: IBoardConfigData) => {
    setIsLoading(true);
    try {
      const res = await verifyJira(data);
      dispatch(updateBoardVerifyState(true));
      dispatch(updateBoard({ ...data, projectKey: get(res, 'response.projectKey', '') }));
    } catch (e) {
      if (isHeartBeatException(e)) {
        const { description, code } = e as IHeartBeatException;
        if (code === HttpStatusCode.Unauthorized) {
          setError('email', {
            type: 'error',
            message: MESSAGE.VERIFY_MAIL_FAILED_ERROR,
          });
          setError('token', {
            type: 'error',
            message: MESSAGE.VERIFY_TOKEN_FAILED_ERROR,
          });
        } else if (code === HttpStatusCode.NotFound && description === BOARD_ERROR_INFO.SITE_NOT_FOUND) {
          setError('site', {
            type: 'error',
            message: MESSAGE.VERIFY_SITE_FAILED_ERROR,
          });
        } else if (code === HttpStatusCode.NotFound && description === BOARD_ERROR_INFO.BOARD_NOT_FOUND) {
          setError('boardId', {
            type: 'error',
            message: MESSAGE.VERIFY_BOARD_FAILED_ERROR,
          });
        } else {
          setError('token', {
            type: 'error',
            message: UNKNOWN_ERROR_TITLE,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }

    dispatch(updateShouldGetBoardConfig(true));
  };

  const onReset = () => {
    reset(boardConfigDefaultValues);
    dispatch(updateBoardVerifyState(false));
  };

  return (
    <ConfigSectionContainer aria-label='Board Config'>
      {isLoading && <Loading />}
      <ConfigSelectionTitle>{CONFIG_TITLE.BOARD}</ConfigSelectionTitle>
      <FormProvider {...methods}>
        <StyledForm onSubmit={handleSubmit(onSubmit)} onReset={onReset}>
          {fields.map(({ key, col, name }, index) =>
            !index ? (
              <FormSelector key={index} name={name} label={key} options={boardType} />
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
            <VerifyButton type='submit' disabled={!isValid || isLoading || isVerified}>
              {isVerified ? 'Verified' : 'Verify'}
            </VerifyButton>
            {isVerified && (
              <ResetButton type='reset' disabled={isLoading}>
                Reset
              </ResetButton>
            )}
          </StyledButtonGroup>
        </StyledForm>
      </FormProvider>
    </ConfigSectionContainer>
  );
};
