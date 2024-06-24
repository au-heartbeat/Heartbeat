import {
  IMPORTED_NEW_CONFIG_FIXTURE,
  BASIC_IMPORTED_OLD_CONFIG_FIXTURE,
  DEFAULT_REWORK_SETTINGS,
  CHINA_CALENDAR,
  OLD_REGULAR_CALENDAR_LABEL,
} from '../../fixtures';
import { SortType } from '@src/containers/ConfigStep/DateRangePicker/types';
import { convertToNewFileConfig } from '@src/constants/fileConfig';
import { Calendar } from '@src/constants/resources';

describe('#fileConfig', () => {
  const BASIC_NEW_CONFIG = {
    projectName: 'ConfigFileForImporting',
    sortType: SortType.DEFAULT,
    dateRange: [
      {
        startDate: '2023-03-16T00:00:00.000+08:00',
        endDate: '2023-03-30T23:59:59.999+08:00',
      },
    ],
    metrics: ['Velocity', 'Cycle time', 'Classification', 'Lead time for changes'],
    board: {
      type: 'Classic Jira',
      boardId: '1963',
      token: 'mockToken',
      site: 'mockSite',
      email: 'test@test.com',
      projectKey: 'PLL',
    },
    pipelineTool: {
      type: 'BuildKite',
      token: 'mockToken',
    },
    sourceControl: {
      type: 'GitHub',
      token: '',
    },
    crews: ['lucy', 'hi hi', 'Yu Zhang'],
    classification: ['type', 'Parent'],
    cycleTime: {},
    doneStatus: ['DONE'],
    deployment: [
      {
        branches: undefined,
        id: 0,
        pipelineName: 'Heartbeat',
        step: ':rocket: Deploy prod',
        organization: 'Thoughtworks-Heartbeat',
      },
    ],
    reworkTimesSettings: DEFAULT_REWORK_SETTINGS,
  };

  it('should return original config when it is not old config', () => {
    expect(convertToNewFileConfig(IMPORTED_NEW_CONFIG_FIXTURE)).toEqual(IMPORTED_NEW_CONFIG_FIXTURE);
  });

  it('should convert to new config when it is old config and considerHoliday is false', () => {
    const expected = {
      ...BASIC_NEW_CONFIG,
      calendarType: Calendar.Regular,
    };
    expect(
      convertToNewFileConfig({
        ...BASIC_IMPORTED_OLD_CONFIG_FIXTURE,
        considerHoliday: false,
      }),
    ).toEqual(expected);
  });

  it('should convert to new config when it is old config and considerHoliday is true', () => {
    const expected = {
      ...BASIC_NEW_CONFIG,
      calendarType: Calendar.China,
    };
    expect(
      convertToNewFileConfig({
        ...BASIC_IMPORTED_OLD_CONFIG_FIXTURE,
        considerHoliday: true,
      }),
    ).toEqual(expected);
  });

  it('should convert calendarType Regular Calendar(Weekend Considered) to REGULAR', () => {
    expect(
      convertToNewFileConfig({
        ...BASIC_IMPORTED_OLD_CONFIG_FIXTURE,
        calendarType: OLD_REGULAR_CALENDAR_LABEL,
      }).calendarType,
    ).toEqual(Calendar.Regular);
  });

  it('should convert calendarType Calendar with Chinese holiday to CHINA', () => {
    expect(
      convertToNewFileConfig({
        ...BASIC_IMPORTED_OLD_CONFIG_FIXTURE,
        calendarType: CHINA_CALENDAR,
      }).calendarType,
    ).toEqual(Calendar.China);
  });

  it('should get default rework value when reworkState and excludeStates are all invalid', () => {
    const expected = {
      ...BASIC_NEW_CONFIG,
      calendarType: Calendar.China,
      reworkTimesSettings: { reworkState: null, excludeStates: [] },
    };
    expect(
      convertToNewFileConfig({
        ...BASIC_IMPORTED_OLD_CONFIG_FIXTURE,
        considerHoliday: true,
        reworkTimesSettings: { reworkState: 'test', excludeStates: ['In Dev'] },
      }),
    ).toEqual(expected);
  });

  it('should filter invalid rework value when excludeStates field is invalid', () => {
    const expected = {
      ...BASIC_NEW_CONFIG,
      calendarType: Calendar.China,
      reworkTimesSettings: { reworkState: 'In Dev', excludeStates: ['Review'] },
    };
    expect(
      convertToNewFileConfig({
        ...BASIC_IMPORTED_OLD_CONFIG_FIXTURE,
        considerHoliday: true,
        reworkTimesSettings: { reworkState: 'In Dev', excludeStates: ['Review', 'test'] },
      }),
    ).toEqual(expected);
  });
});
