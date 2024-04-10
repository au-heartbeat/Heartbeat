import { object, string, mixed, InferType, array } from 'yup';
import { REGEX } from '@src/constants/regex';

const CALENDAR_TYPE_LITERAL = ['Regular Calendar(Weekend Considered)', 'Calendar with Chinese Holiday'];
const METRICS_LITERAL = [
  'Velocity',
  'Cycle time',
  'Classification',
  'Rework times',
  'Lead time for changes',
  'Deployment frequency',
  'Dev change failure rate',
  'Dev mean time to recovery',
];
const BOARD_TYPE_LITERAL = ['Jira'];
const PIPELINE_TOOL_TYPE_LITERAL = ['BuildKite'];
const SOURCE_CONTROL_TYPE_LITERAL = ['GitHub'];

export const basicInfoSchema = object().shape({
  projectName: string().required(),
  dateRange: array().of(string()).required(),
  calendarType: mixed().oneOf(CALENDAR_TYPE_LITERAL),
  metrics: mixed().oneOf(METRICS_LITERAL),
});

export const boardConfigSchema = object().shape({
  type: mixed().oneOf(BOARD_TYPE_LITERAL),
  boardId: string().required(),
  email: string().required().email(),
  site: string().required(),
  token: string()
    .test('token valid', 'Invalid token', (value) => !value || REGEX.BOARD_TOKEN.test(value))
    .required(),
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
