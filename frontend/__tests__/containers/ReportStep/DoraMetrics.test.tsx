import { MOCK_REPORT_RESPONSE, REQUIRED_DATA_LIST } from '@test/fixtures';
import DoraMetrics from '@src/containers/ReportStep/DoraMetrics';
import { setupStore } from '@test/utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RETRY } from '@src/constants/resources';
import { Provider } from 'react-redux';
import React from 'react';
import clearAllMocks = jest.clearAllMocks;

jest.mock('@src/utils/util', () => ({
  ...jest.requireActual('@src/utils/util'),
  getDeviceSize: jest.fn().mockReturnValue('lg'),
}));

describe('Report Card', () => {
  afterEach(() => {
    clearAllMocks();
  });

  let store = setupStore();

  const mockData = {
    ...MOCK_REPORT_RESPONSE,
    reportMetricsError: {
      boardMetricsError: null,
      sourceControlMetricsError: {
        status: 404,
        message: 'Not Found',
      },
      pipelineMetricsError: {
        status: 404,
        message: 'Not Found',
      },
    },
  };

  const mockHandleRetry = jest.fn();
  const onShowDetail = jest.fn();

  const setup = () => {
    store = setupStore();
    return render(
      <Provider store={store}>
        <DoraMetrics
          metrics={REQUIRED_DATA_LIST}
          startToRequestDoraData={mockHandleRetry}
          onShowDetail={onShowDetail}
          doraReport={mockData}
          errorMessage={''}
        />
      </Provider>,
    );
  };

  it('should show retry button when have reportMetricsError and click retry will triger api call', async () => {
    setup();
    jest.mock('@src/utils/util', () => ({
      ...jest.requireActual('@src/utils/util'),
      getDeviceSize: jest.fn().mockReturnValue('lg'),
    }));

    expect(screen.getByText(RETRY)).toBeInTheDocument();
    expect(screen.getByText('Failed to get GitHub info, status: 404')).toBeInTheDocument();

    await userEvent.click(screen.getByText(RETRY));

    expect(mockHandleRetry).toHaveBeenCalled();
  });

  it('should show explanation button and show the dialog when click explanation icon', async () => {
    setup();
    jest.mock('@src/utils/util', () => ({
      ...jest.requireActual('@src/utils/util'),
      getDeviceSize: jest.fn().mockReturnValue('lg'),
    }));

    const leadTimeForChangesExplanationIcon = screen.queryByLabelText('lead time for changes explanation');
    expect(leadTimeForChangesExplanationIcon).toBeInTheDocument();
    expect(screen.queryByLabelText('deployment frequency explanation')).toBeInTheDocument();
    expect(screen.queryByLabelText('pipeline change failure rate explanation')).toBeInTheDocument();
    expect(screen.queryByLabelText('pipeline mean time to recovery explanation')).toBeInTheDocument();

    await userEvent.click(leadTimeForChangesExplanationIcon!);

    const closeButton = screen.queryByLabelText('close');

    expect(screen.queryByLabelText('dora metrics dialog')).toBeInTheDocument();
    expect(screen.queryByLabelText('dora metrics dialog container')).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    screen.queryAllByText('DORA Metrics').forEach((it) => {
      expect(it).toBeInTheDocument();
    });
    expect(screen.queryByLabelText('definition')).toBeInTheDocument();
    expect(screen.queryByLabelText('influenced factors')).toBeInTheDocument();
    expect(screen.queryByLabelText('formula')).toBeInTheDocument();

    await userEvent.click(closeButton!);

    expect(screen.queryByLabelText('dora metrics dialog')).not.toBeInTheDocument();
  });
});
