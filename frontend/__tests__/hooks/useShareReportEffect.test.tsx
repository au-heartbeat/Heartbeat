import { MOCK_REPORT_RESPONSE, MOCK_SHARE_REPORT_RESPONSE } from '../fixtures';
import { reportClient } from '@src/clients/report/ReportClient';
import { act, renderHook } from '@testing-library/react';
import { setupStore } from '@test/utils/setupStoreUtil';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import clearAllMocks = jest.clearAllMocks;
import resetAllMocks = jest.resetAllMocks;
import { useShareReportEffect } from '../../src/hooks/useShareReportEffect';

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

  it('should set dataRanges and reportInfos when call getData', async () => {
    reportClient.getReportUrl = jest.fn().mockResolvedValue({ data: MOCK_SHARE_REPORT_RESPONSE });
    reportClient.getReportDetail = jest.fn().mockResolvedValue({ data: MOCK_REPORT_RESPONSE });

    const { result } = setup();

    await act(async () => {
      await result.current.getData();
    });

    expect(reportClient.getReportUrl).toHaveBeenCalledTimes(1);
    expect(reportClient.getReportDetail).toHaveBeenCalledTimes(2);
    expect(result.current.reportInfos.length).toEqual(2);
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
    expect(result.current.reportInfos).toHaveLength(2);
    expect(result.current.reportInfos[0].id).toEqual('2024-05-13T00:00:00.000+08:00');
    expect(result.current.reportInfos[1].id).toEqual('2024-05-27T00:00:00.000+08:00');
  });
});
