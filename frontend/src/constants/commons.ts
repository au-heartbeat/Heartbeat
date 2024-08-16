export const PROJECT_NAME = 'Heartbeat';

export const DEFAULT_HELPER_TEXT = '';

export const FIVE_HUNDRED = 500;

export const STEP_NUMBER = {
  CONFIG_PAGE: 0,
  METRICS_PAGE: 1,
  REPORT_PAGE: 2,
};

export const CHART_INDEX = {
  BOARD: 0,
  DORA: 1,
};

export const DISPLAY_TYPE = {
  LIST: 1,
  CHART: 0,
};

export const EMPTY_STRING = '';

export const STEPS = ['Config', 'Metrics', 'Report'];

export const SELECTED_VALUE_SEPARATOR = ', ';

export const DURATION = {
  ERROR_MESSAGE_TIME: 4000,
  NOTIFICATION_TIME: 10000,
};

export const Z_INDEX = {
  DEFAULT: 0,
  BUTTONS: 1,
  INPUTS: 2,
  INPUT_GROUPS: 3,
  DROPDOWN: 1025,
  SNACKBARS: 1010,
  MODAL_BACKDROP: 1020,
  MODAL: 1030,
  POPOVER: 1040,
  TOOLTIP: 1050,
  STICKY: 1060,
  FIXED: 1070,
};

export enum ReportTypes {
  Metrics = 'metric',
  Board = 'board',
  Pipeline = 'pipeline',
}

export enum formAlertTypes {
  Timeout,
  BoardVerify,
}

export enum MetricTypes {
  All = 'ALL',
  Board = 'BOARD',
  DORA = 'DORA',
}

export const METRICS_STEPS = {
  CONFIG: 0,
  METRICS: 1,
  REPORT: 2,
};

export const COMMON_BUTTONS = {
  SAVE: 'Save',
  BACK: 'Previous',
  NEXT: 'Next',
  CONFIRM: 'Confirm',
  EXPORT_PIPELINE_DATA: 'Export pipeline data',
  EXPORT_BOARD_DATA: 'Export board data',
  EXPORT_METRIC_DATA: 'Export metric data',
  EXPORT_BOARD_CHART: 'Export board data',
  EXPORT_DORA_CHART: 'Export pipeline data',
};

export const GRID_CONFIG = {
  HALF: { XS: 6, MAX_INDEX: 2, FLEX: 1 },
  FULL: { XS: 12, MAX_INDEX: 4, FLEX: 0.25 },
};

export enum MetricsDataFailStatus {
  NotFailed,
  PartialFailed4xx,
  PartialFailedTimeout,
  PartialFailedNoCards,
  AllFailed4xx,
  AllFailedTimeout,
  AllFailedNoCards,
}

export const DOWNLOAD_DIALOG_TITLE = {
  [ReportTypes.Metrics]: 'Metrics',
  [ReportTypes.Board]: 'Board',
  [ReportTypes.Pipeline]: 'Pipeline',
};

export const ANIMATION_SECONDS = 0.5;

export const EVERY_FRAME_MILLISECOND = 17;

export const MILLISECONDS_PER_SECOND = 1000;

export enum NewLabelType {
  General = 'general',
  CustomizeMarginAndHeight = 'customize margin and height',
}
