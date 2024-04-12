import {
  CALENDAR_TYPE_LITERAL,
  METRICS_LITERAL,
  BOARD_TYPE_LITERAL,
  PIPELINE_TOOL_TYPE_LITERAL,
  SOURCE_CONTROL_TYPE_LITERAL,
  BASIC_INFO_ERROR_MESSAGE,
  BOARD_CONFIG_ERROR_MESSAGE,
} from '@src/containers/ConfigStep/Form/literal';
import { object, string, mixed, InferType, array } from 'yup';
import { REGEX } from '@src/constants/regex';

export const basicInfoSchema = object().shape({
  projectName: string().required(BASIC_INFO_ERROR_MESSAGE.projectName),
  dateRange: array().of(string()).required(),
  calendarType: mixed().oneOf(CALENDAR_TYPE_LITERAL),
  metrics: mixed().oneOf(METRICS_LITERAL),
});

export const boardConfigSchema = object().shape({
  type: mixed().oneOf(BOARD_TYPE_LITERAL),
  boardId: string()
    .required(BOARD_CONFIG_ERROR_MESSAGE.boardId.required)
    .matches(REGEX.BOARD_ID, { message: BOARD_CONFIG_ERROR_MESSAGE.boardId.invalid }),
  email: string()
    .required(BOARD_CONFIG_ERROR_MESSAGE.email.required)
    .matches(REGEX.EMAIL, { message: BOARD_CONFIG_ERROR_MESSAGE.email.invalid }),
  site: string().required(BOARD_CONFIG_ERROR_MESSAGE.site.required),
  token: string()
    .required(BOARD_CONFIG_ERROR_MESSAGE.token.invalid)
    .matches(REGEX.BOARD_TOKEN, { message: BOARD_CONFIG_ERROR_MESSAGE.token.invalid }),
});

export const pipelineToolSchema = object().shape({
  type: mixed().oneOf(PIPELINE_TOOL_TYPE_LITERAL),
  token: string().when(PIPELINE_TOOL_TYPE_LITERAL, {
    is: true,
    then: () => string().matches(REGEX.BUILDKITE_TOKEN),
  }),
});

export const sourceControlSchema = object().shape({
  type: mixed().oneOf(SOURCE_CONTROL_TYPE_LITERAL),
  token: string().when(SOURCE_CONTROL_TYPE_LITERAL, {
    is: true,
    then: () => string().matches(REGEX.GITHUB_TOKEN),
  }),
});

export type IBasicInfoData = InferType<typeof basicInfoSchema>;
export type IBoardConfigData = InferType<typeof boardConfigSchema>;
export type IPipelineToolData = InferType<typeof pipelineToolSchema>;
export type ISourceControlData = InferType<typeof sourceControlSchema>;
