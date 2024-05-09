import { EXPORT_BOARD_DATA, EXPORT_METRIC_DATA, EXPORT_PIPELINE_DATA } from '../fixtures';
import { ReportButtonGroup } from '@src/containers/ReportButtonGroup';
import { DateRangeRequestResult } from '@src/containers/ReportStep';
import { render, renderHook, screen } from '@testing-library/react';
import { useExportCsvEffect } from '@src/hooks/useExportCsvEffect';
import { setupStore } from '@test/utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

jest.mock('@src/hooks/useExportCsvEffect', () => ({
  useExportCsvEffect: jest.fn().mockReturnValue({
    fetchExportData: jest.fn(),
    isExpired: false,
  }),
}));

describe('ReportButtonGroup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockHandler = jest.fn();
  const firstBasicMockDateRangeRequestResult = {
    startDate: '2024-01-01T00:00:00.000+08:00',
    endDate: '2024-01-14T23:59:59.000+08:00',
    overallMetricsCompleted: true,
    boardMetricsCompleted: true,
    doraMetricsCompleted: true,
    reportMetricsError: {
      boardMetricsError: null,
      pipelineMetricsError: null,
      sourceControlMetricsError: null,
    },
  };
  const secondBasicMockDateRangeRequestResult = {
    startDate: '2024-01-15T00:00:00.000+08:00',
    endDate: '2024-01-31T23:59:59.000+08:00',
    overallMetricsCompleted: true,
    boardMetricsCompleted: true,
    doraMetricsCompleted: true,
    reportMetricsError: {
      boardMetricsError: null,
      pipelineMetricsError: null,
      sourceControlMetricsError: null,
    },
  };

  const successMockData: DateRangeRequestResult[] = [
    firstBasicMockDateRangeRequestResult,
    secondBasicMockDateRangeRequestResult,
  ];
  const pendingMockData: DateRangeRequestResult[] = [
    firstBasicMockDateRangeRequestResult,
    {
      ...secondBasicMockDateRangeRequestResult,
      overallMetricsCompleted: false,
      boardMetricsCompleted: false,
      doraMetricsCompleted: false,
    },
  ];
  const partialFailedMockData: DateRangeRequestResult[] = [
    firstBasicMockDateRangeRequestResult,
    {
      ...secondBasicMockDateRangeRequestResult,
      reportMetricsError: {
        boardMetricsError: {
          status: 500,
          message: 'mockError',
        },
        pipelineMetricsError: {
          status: 500,
          message: 'mockError',
        },
        sourceControlMetricsError: {
          status: 500,
          message: 'mockError',
        },
      },
    },
  ];
  const allFailedMockData: DateRangeRequestResult[] = [
    {
      ...firstBasicMockDateRangeRequestResult,
      reportMetricsError: {
        boardMetricsError: {
          status: 500,
          message: 'mockError',
        },
        pipelineMetricsError: {
          status: 500,
          message: 'mockError',
        },
        sourceControlMetricsError: {
          status: 500,
          message: 'mockError',
        },
      },
    },
    {
      ...secondBasicMockDateRangeRequestResult,
      reportMetricsError: {
        boardMetricsError: {
          status: 500,
          message: 'mockError',
        },
        pipelineMetricsError: {
          status: 500,
          message: 'mockError',
        },
        sourceControlMetricsError: {
          status: 500,
          message: 'mockError',
        },
      },
    },
  ];

  const setup = (dateRangeRequestResults: DateRangeRequestResult[]) => {
    const store = setupStore();
    render(
      <Provider store={store}>
        <ReportButtonGroup
          isShowSave={true}
          isShowExportMetrics={true}
          isShowExportBoardButton={true}
          isShowExportPipelineButton={true}
          handleBack={mockHandler}
          handleSave={mockHandler}
          csvTimeStamp={1715250961572}
          dateRangeRequestResults={dateRangeRequestResults}
        />
      </Provider>,
    );
  };

  it('should all buttons be clickable when the request successfully finishes', () => {
    setup(successMockData);

    expect(screen.getByRole('button', { name: EXPORT_METRIC_DATA })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: EXPORT_BOARD_DATA })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: EXPORT_PIPELINE_DATA })).not.toBeDisabled();
  });

  it('should be able to export all the overall metrics CSV files when the request successfully finishes', async () => {
    setup(successMockData);
    const exportMetricDataButton = screen.getByRole('button', { name: EXPORT_METRIC_DATA });
    expect(exportMetricDataButton).not.toBeDisabled();

    await userEvent.click(exportMetricDataButton);

    expect(screen.getByText('2024/01/01 - 2024/01/14')).toBeInTheDocument();
    expect(screen.getByText('2024/01/15 - 2024/01/31')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')[0]).not.toBeDisabled();
    expect(screen.getAllByRole('checkbox')[1]).not.toBeDisabled();
  });

  it('should be able to export all the board metrics CSV files when the request successfully finishes', async () => {
    setup(successMockData);
    const exportBoardDataButton = screen.getByRole('button', { name: EXPORT_BOARD_DATA });
    expect(exportBoardDataButton).not.toBeDisabled();

    await userEvent.click(exportBoardDataButton);

    expect(screen.getByText('2024/01/01 - 2024/01/14')).toBeInTheDocument();
    expect(screen.getByText('2024/01/15 - 2024/01/31')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')[0]).not.toBeDisabled();
    expect(screen.getAllByRole('checkbox')[1]).not.toBeDisabled();
  });

  it('should be able to export all the pipeline metrics CSV files when the request successfully finishes', async () => {
    setup(successMockData);
    const exportPipelineDataButton = screen.getByRole('button', { name: EXPORT_PIPELINE_DATA });
    expect(exportPipelineDataButton).not.toBeDisabled();

    await userEvent.click(exportPipelineDataButton);

    expect(screen.getByText('2024/01/01 - 2024/01/14')).toBeInTheDocument();
    expect(screen.getByText('2024/01/15 - 2024/01/31')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')[0]).not.toBeDisabled();
    expect(screen.getAllByRole('checkbox')[1]).not.toBeDisabled();
  });

  it('should export data buttons be not clickable when the CSV file for any dataRange has not been generated', () => {
    setup(pendingMockData);

    expect(screen.getByRole('button', { name: EXPORT_METRIC_DATA })).toBeDisabled();
    expect(screen.getByRole('button', { name: EXPORT_BOARD_DATA })).toBeDisabled();
    expect(screen.getByRole('button', { name: EXPORT_PIPELINE_DATA })).toBeDisabled();
  });

  it.each([EXPORT_METRIC_DATA, EXPORT_BOARD_DATA, EXPORT_PIPELINE_DATA])(
    `should not be able to export the %s CSV file when an error occurs for a dataRange`,
    async (buttonName) => {
      setup(partialFailedMockData);
      const exportButton = screen.getByRole('button', { name: buttonName });
      expect(exportButton).not.toBeDisabled();

      await userEvent.click(exportButton);

      expect(screen.getByText('2024/01/15 - 2024/01/31')).toBeInTheDocument();
      const checkbox = screen.getAllByRole('checkbox')[1];
      expect(checkbox).toBeDisabled();
    },
  );

  it('should not open download dialog when click export metric data button given only setting one dataRange', async () => {
    setup([firstBasicMockDateRangeRequestResult]);
    const exportMetricDataButton = screen.getByRole('button', { name: EXPORT_METRIC_DATA });
    expect(exportMetricDataButton).not.toBeDisabled();

    await userEvent.click(exportMetricDataButton);

    expect(screen.queryByText('Select the time period for the exporting data')).not.toBeInTheDocument();
  });

  it('should close download dialog when click the close button', async () => {
    setup(successMockData);
    const exportMetricDataButton = screen.getByRole('button', { name: EXPORT_METRIC_DATA });
    expect(exportMetricDataButton).not.toBeDisabled();
    await userEvent.click(exportMetricDataButton);
    expect(screen.getByText('Select the time period for the exporting data')).toBeInTheDocument();

    const closeButton = screen.getByTestId('CloseIcon');
    await userEvent.click(closeButton);

    expect(screen.queryByText('Select the time period for the exporting data')).not.toBeInTheDocument();
  });

  it('should close download dialog and download csv file when click the confirm button', async () => {
    const { result } = renderHook(() => useExportCsvEffect());
    setup(successMockData);
    const exportMetricDataButton = screen.getByRole('button', { name: EXPORT_METRIC_DATA });
    expect(exportMetricDataButton).not.toBeDisabled();
    await userEvent.click(exportMetricDataButton);
    expect(screen.getByText('Select the time period for the exporting data')).toBeInTheDocument();
    const checkbox = screen.getAllByRole('checkbox')[0];
    expect(checkbox).not.toBeDisabled();
    await userEvent.click(checkbox);

    await userEvent.click(screen.getByText('Confirm'));

    expect(screen.queryByText('Select the time period for the exporting data')).not.toBeInTheDocument();
    expect(result.current.fetchExportData).toBeCalledTimes(1);
  });

  it(`should should not be able to click the button when an error occurs for all dataRanges`, async () => {
    setup(allFailedMockData);

    expect(screen.getByRole('button', { name: EXPORT_METRIC_DATA })).toBeDisabled();
    expect(screen.getByRole('button', { name: EXPORT_BOARD_DATA })).toBeDisabled();
    expect(screen.getByRole('button', { name: EXPORT_PIPELINE_DATA })).toBeDisabled();
  });
});
