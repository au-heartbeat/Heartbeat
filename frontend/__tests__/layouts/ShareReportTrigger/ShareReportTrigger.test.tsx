import { nextStep, updateReportId, updateReportPageLoadingStatus } from '@src/context/stepper/StepperSlice';
import ShareReportTrigger from '@src/layouts/ShareReportTrigger';
import { formatDateToTimestampString } from '@src/utils/util';
import { setupStore } from '../../utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

const SHARE_ICON_LABEL = 'Share Report';
const loadingSuccessStatus = { isLoading: false, isLoaded: true, isLoadedWithError: false };
const loadingFailedStatus = { isLoading: false, isLoaded: true, isLoadedWithError: true };
const dateRangeLoadingSuccess = {
  gainPollingUrl: loadingSuccessStatus,
  polling: loadingSuccessStatus,
  boardMetrics: loadingSuccessStatus,
  pipelineMetrics: loadingSuccessStatus,
  sourceControlMetrics: loadingSuccessStatus,
};
const dateRangeLoadingFailed = {
  gainPollingUrl: loadingSuccessStatus,
  polling: loadingFailedStatus,
  boardMetrics: loadingFailedStatus,
  pipelineMetrics: loadingFailedStatus,
  sourceControlMetrics: loadingFailedStatus,
};

describe('Header', () => {
  let store = setupStore();
  beforeEach(() => {
    store = setupStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setup = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <div>
            <div aria-label='Outside'></div>
            <ShareReportTrigger />
          </div>
        </BrowserRouter>
      </Provider>,
    );

  const prepareSuccessStore = () => {
    store.dispatch(nextStep());
    store.dispatch(nextStep());
    store.dispatch(updateReportId('mockReportId'));
    store.dispatch(
      updateReportPageLoadingStatus([
        {
          startDate: formatDateToTimestampString('2024-04-01T00:00:00.000+08:00'),
          loadingStatus: dateRangeLoadingSuccess,
        },
        {
          startDate: formatDateToTimestampString('2023-02-01T00:00:00.000+08:00'),
          loadingStatus: dateRangeLoadingSuccess,
        },
      ]),
    );
  };

  it('should not show share report Icon in other page', () => {
    store.dispatch(nextStep());
    const { queryByLabelText } = setup();

    expect(queryByLabelText(SHARE_ICON_LABEL)).not.toBeInTheDocument();
  });

  it('should show share report icon in report page', () => {
    store.dispatch(nextStep());
    store.dispatch(nextStep());
    const { getByLabelText } = setup();

    expect(getByLabelText(SHARE_ICON_LABEL)).toBeInTheDocument();
  });

  it('should disable share report icon given report is not ready', () => {
    store.dispatch(nextStep());
    store.dispatch(nextStep());
    const { getByLabelText } = setup();

    expect(getByLabelText(SHARE_ICON_LABEL)).toHaveAttribute('disabled');
  });

  it('should disable share report icon given report is loaded failed', () => {
    store.dispatch(nextStep());
    store.dispatch(nextStep());
    store.dispatch(updateReportId('mockReportId'));
    store.dispatch(
      updateReportPageLoadingStatus([
        {
          startDate: formatDateToTimestampString('2024-04-01T00:00:00.000+08:00'),
          loadingStatus: dateRangeLoadingSuccess,
        },
        {
          startDate: formatDateToTimestampString('2023-02-01T00:00:00.000+08:00'),
          loadingStatus: dateRangeLoadingFailed,
        },
      ]),
    );
    const { getByLabelText } = setup();

    expect(getByLabelText(SHARE_ICON_LABEL)).toHaveAttribute('disabled');
  });

  it('should enable share report icon given report is ready', () => {
    prepareSuccessStore();
    const { getByLabelText } = setup();

    expect(getByLabelText(SHARE_ICON_LABEL)).not.toHaveAttribute('disabled');
  });

  it('should not open share report popper when click share icon given report is not ready', async () => {
    store.dispatch(nextStep());
    store.dispatch(nextStep());
    const { getByLabelText } = setup();

    await userEvent.click(getByLabelText(SHARE_ICON_LABEL));

    expect(screen.queryByText('Share Report')).not.toBeInTheDocument();
  });

  it('should open or close share report popper when click share icon', async () => {
    prepareSuccessStore();
    const { getByLabelText } = setup();

    await userEvent.click(getByLabelText(SHARE_ICON_LABEL));

    expect(screen.getByText('Share Report')).toBeInTheDocument();

    await userEvent.click(getByLabelText(SHARE_ICON_LABEL));

    expect(screen.queryByText('Share Report')).not.toBeInTheDocument();
  });

  it('should copy share report url when click Copy Link', async () => {
    prepareSuccessStore();
    const { getByLabelText } = setup();

    await userEvent.click(getByLabelText(SHARE_ICON_LABEL));

    const copyButton = screen.getByLabelText('Copy Link');
    await userEvent.click(copyButton);

    expect(screen.queryByText('Link copied to clipboard')).toBeInTheDocument();
  });

  it('should close share report popper when click outside the popper', async () => {
    prepareSuccessStore();
    const { getByLabelText } = setup();

    await userEvent.click(getByLabelText(SHARE_ICON_LABEL));

    await userEvent.click(screen.getByLabelText('Outside'));

    expect(screen.queryByText('Share Report')).not.toBeInTheDocument();
  });
});
