import { useForm, FormProvider as RHFProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InferType, ISchema } from 'yup';
import { ReactNode } from 'react';

interface IFormProviderProps<T extends ISchema<any>> {
  children: ReactNode;
  defaultValues: InferType<T>;
  schema: T;
}

export const FormProvider = ({ defaultValues, children, schema }: IFormProviderProps<any>) => {
  const sourceControlMethods = useForm<InferType<typeof schema>>({
    defaultValues,
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  return <RHFProvider {...sourceControlMethods}>{children}</RHFProvider>;
};
