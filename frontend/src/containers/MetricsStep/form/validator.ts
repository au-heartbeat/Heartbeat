import { object, array, string } from 'yup';

export const metricsSchema = object().shape({
  board: object().shape({
    crews: array().of(string()).min(1).typeError('There should be at least 1 item'),
  }),
});
