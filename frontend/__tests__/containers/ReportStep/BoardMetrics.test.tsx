import { CLASSIFICATION, LEAD_TIME_FOR_CHANGES, MOCK_REPORT_RESPONSE } from '../../fixtures';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import BoardMetrics from '@src/containers/ReportStep/BoardMetrics';
import { setupStore } from '../../utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RETRY } from '@src/constants/resources';
import { Provider } from 'react-redux';
import React from 'react';
import clearAllMocks = jest.clearAllMocks;

describe('Report Card', () => {
  afterEach(() => {
    clearAllMocks();
  });

  const store = setupStore();
  const mockHandleRetry = jest.fn();
  const onShowDetail = jest.fn();

  const setup = (boardReport: ReportResponseDTO, errorMessage?: string) => {
    return render(
      <Provider store={store}>
        <BoardMetrics
          metrics={[CLASSIFICATION, LEAD_TIME_FOR_CHANGES]}
          startToRequestBoardData={mockHandleRetry}
          onShowDetail={onShowDetail}
          boardReport={boardReport}
          errorMessage={errorMessage || ''}
        />
      </Provider>,
    );
  };

  it('should show retry button when have errorMessage and click retry will trigger api call', async () => {
    const mockData = {
      ...MOCK_REPORT_RESPONSE,
      reportMetricsError: {
        pipelineMetricsError: null,
        sourceControlMetricsError: null,
        boardMetricsError: {
          status: 404,
          message: 'Not Found',
        },
      },
    };
    setup(mockData, 'error message');

    expect(screen.getByText(RETRY)).toBeInTheDocument();

    await userEvent.click(screen.getByText(RETRY));

    expect(mockHandleRetry).toHaveBeenCalled();
  });

  it('should show loading button when board metrics select classification and dora metrics has value too ', async () => {
    const mockData = {
      ...MOCK_REPORT_RESPONSE,
      boardMetricsCompleted: false,
    };

    setup(mockData);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
