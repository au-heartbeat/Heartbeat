import { MOCK_REPORT_RESPONSE, MOCK_SHARE_REPORT_URLS_RESPONSE } from '../fixtures';
import { reportClient } from '@src/clients/report/ReportClient';
import { act, renderHook } from '@testing-library/react';
import { setupStore } from '@test/utils/setupStoreUtil';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import clearAllMocks = jest.clearAllMocks;
import resetAllMocks = jest.resetAllMocks;
import { useShareReportEffect } from '../../src/hooks/useShareReportEffect';
import { AxiosRequestErrorCode } from '../../src/constants/resources';
import { NotFoundError } from '../../src/errors/NotFoundError';
import { TimeoutError } from '../../src/errors/TimeoutError';
import { HttpStatusCode } from 'axios';

let store = setupStore();

const Wrapper = ({ children }: { children: ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

const setup = () =>
  renderHook(() => useShareReportEffect(), {
    wrapper: Wrapper,
  });

describe('use generate report effect', () => {
  afterAll(() => {
    clearAllMocks();
  });
  beforeEach(() => {
    store = setupStore();
    jest.useFakeTimers();
  });
  afterEach(() => {
    resetAllMocks();
    jest.useRealTimers();
  });

  const successSetup = async () => {
    reportClient.getReportUrlAndMetrics = jest.fn().mockResolvedValue({ data: MOCK_SHARE_REPORT_URLS_RESPONSE });
    reportClient.getReportDetail = jest.fn().mockResolvedValue({ data: MOCK_REPORT_RESPONSE });
    const { result } = setup();

    await act(async () => {
      await result.current.getData();
    });

    return result;
  };

  it('should call getReportUrlAndMetrics and getReportDetail API when getData ', async () => {
    await successSetup();
    expect(reportClient.getReportUrlAndMetrics).toHaveBeenCalledTimes(1);
    expect(reportClient.getReportDetail).toHaveBeenCalledTimes(2);
  });

  it('should set dataRanges and metrics correctly when getData successfully', async () => {
    const result = await successSetup();
    expect(result.current.dateRanges).toEqual([
      {
        startDate: '2024-05-13T00:00:00.000+08:00',

        endDate: '2024-05-26T23:59:59.999+08:00',
      },
      {
        startDate: '2024-05-27T00:00:00.000+08:00',

        endDate: '2024-06-09T23:59:59.999+08:00',
      },
    ]);
    expect(result.current.metrics).toEqual(MOCK_SHARE_REPORT_URLS_RESPONSE.metrics);
  });

  it('should set reportInfos correctly when getData successfully', async () => {
    const result = await successSetup();

    expect(result.current.reportInfos).toHaveLength(2);
    expect(result.current.reportInfos[0].id).toEqual('2024-05-13T00:00:00.000+08:00');
    expect(result.current.reportInfos[1].id).toEqual('2024-05-27T00:00:00.000+08:00');
  });

  it('should set "Data loading failed" for all board metrics when board data retrieval times out', async () => {
    reportClient.getReportUrlAndMetrics = jest.fn().mockResolvedValue({ data: MOCK_SHARE_REPORT_URLS_RESPONSE });
    reportClient.getReportDetail = jest
      .fn()
      .mockRejectedValue(new TimeoutError('timeout error', AxiosRequestErrorCode.Timeout));
    const { result } = setup();

    await act(async () => {
      await result.current.getData();
    });

    expect(result.current.reportInfos).toHaveLength(2);
    expect(result.current.reportInfos[0].timeout4Report.message).toEqual('Data loading failed');
    expect(result.current.reportInfos[0].timeout4Report.shouldShow).toBeTruthy();
    expect(result.current.reportInfos[0].reportData).toBeUndefined();
    expect(result.current.reportInfos[1].timeout4Report.message).toEqual('Data loading failed');
    expect(result.current.reportInfos[1].timeout4Report.shouldShow).toBeTruthy();
    expect(result.current.reportInfos[1].reportData).toBeUndefined();
  });

  it('should set isExpired given report is expired', async () => {
    reportClient.getReportUrlAndMetrics = jest
      .fn()
      .mockRejectedValue(new NotFoundError('not found', HttpStatusCode.NotFound, 'report is expired'));
    reportClient.getReportDetail = jest.fn().mockResolvedValue({ data: MOCK_REPORT_RESPONSE });
    const { result } = setup();

    await act(async () => {
      await result.current.getData();
    });

    expect(result.current.isExpired).toBeTruthy();
  });
});
