import { object, string, InferType } from 'yup';

export const boardConfigSchema = object().shape({
  type: string().required(),
  boardId: string().max(1).required(),
  email: string().required(),
  site: string().required(),
  token: string().required(),
});

export type IBoardConfigData = InferType<typeof boardConfigSchema>;
