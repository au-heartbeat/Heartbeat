import { object, string, InferType } from 'yup';
import { REGEX } from '@src/constants/regex';

export const boardConfigSchema = object().shape({
  type: string().required(),
  boardId: string().required(),
  email: string().required().email(),
  site: string().required(),
  token: string()
    .test('token valid', 'Invalid token', (value) => !value || REGEX.BOARD_TOKEN.test(value))
    .required(),
});

export type IBoardConfigData = InferType<typeof boardConfigSchema>;
