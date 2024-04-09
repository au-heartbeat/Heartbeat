import { boardConfigSchema, IBoardConfigData } from '@src/containers/ConfigStep/Form/schema';
import { defaultValues } from '@src/containers/ConfigStep/Form/defaultValues';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReactNode } from 'react';

export const FormContainer = ({ children }: { children: ReactNode }) => {
  const methods = useForm<IBoardConfigData>({
    defaultValues,
    resolver: yupResolver(boardConfigSchema),
    mode: 'onChange',
  });

  // const {
  //   handleSubmit,
  //   formState: { isValid },
  //   reset,
  //   setError,
  // } = methods;

  return <FormProvider {...methods}>{children}</FormProvider>;
};
