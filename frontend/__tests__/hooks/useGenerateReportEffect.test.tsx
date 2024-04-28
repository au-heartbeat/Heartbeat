import { MOCK_GENERATE_REPORT_REQUEST_PARAMS, MOCK_REPORT_RESPONSE, MOCK_RETRIEVE_REPORT_RESPONSE } from '../fixtures';
import { useGenerateReportEffect } from '@src/hooks/useGenerateReportEffect';
import { act, renderHook, waitFor } from '@testing-library/react';
import { reportClient } from '@src/clients/report/ReportClient';
import { TimeoutError } from '@src/errors/TimeoutError';
import { UnknownError } from '@src/errors/UnknownError';
import { HttpStatusCode } from 'axios';
import clearAllMocks = jest.clearAllMocks;
import resetAllMocks = jest.resetAllMocks;
import { AXIOS_REQUEST_ERROR_CODE } from '@src/constants/resources';
import { updateDateRange } from '@src/context/config/configSlice';
import { setupStore } from '@test/utils/setupStoreUtil';
import { METRIC_TYPES } from '@src/constants/commons';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';

const MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_BOARD_METRIC_TYPE = {
  ...MOCK_GENERATE_REPORT_REQUEST_PARAMS,
  metricTypes: [METRIC_TYPES.BOARD],
};
const MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_DORA_METRIC_TYPE = {
  ...MOCK_GENERATE_REPORT_REQUEST_PARAMS,
  metricTypes: [METRIC_TYPES.DORA],
};

let store = setupStore();

const Wrapper = ({ children }: { children: ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

const setup = () =>
  renderHook(() => useGenerateReportEffect(), {
    wrapper: Wrapper,
  });

// jest.useFakeTimers();

describe('use generate report effect', () => {
  afterAll(() => {
    clearAllMocks();
  });
  beforeEach(() => {
    store = setupStore();
    store.dispatch(
      updateDateRange([
        {
          startDate: '2024-02-04T00:00:00.000+08:00',
          endDate: '2024-02-17T23:59:59.999+08:00',
        },
        {
          startDate: '2024-02-18T00:00:00.000+08:00',
          endDate: '2024-02-28T23:59:59.999+08:00',
        },
      ]),
    );
    jest.useFakeTimers();
  });
  afterEach(() => {
    resetAllMocks();
    jest.useRealTimers();
  });

  it('should set "Data loading failed" for all board metrics when board data retrieval times out', async () => {
    reportClient.retrieveByUrl = jest
      .fn()
      .mockRejectedValue(new TimeoutError('timeout error', AXIOS_REQUEST_ERROR_CODE.TIMEOUT));
    reportClient.polling = jest.fn();

    const { result } = setup();

    await act(async () => {
      await result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_BOARD_METRIC_TYPE);
    });

    expect(result.current.reportInfos.length).toEqual(2);
    expect(result.current.reportInfos[0].timeout4Board.message).toEqual('Data loading failed');
    expect(result.current.reportInfos[0].timeout4Board.shouldShow).toEqual(true);
    expect(result.current.reportInfos[0].reportData).toEqual(undefined);
    expect(result.current.reportInfos[1].timeout4Board.message).toEqual('Data loading failed');
    expect(result.current.reportInfos[1].timeout4Board.shouldShow).toEqual(true);
    expect(result.current.reportInfos[1].reportData).toEqual(undefined);
    expect(reportClient.polling).toHaveBeenCalledTimes(0);
  });

  it('should set "Data loading failed" for dora metrics when dora data retrieval times out', async () => {
    reportClient.retrieveByUrl = jest
      .fn()
      .mockRejectedValueOnce(new TimeoutError('timeout error', AXIOS_REQUEST_ERROR_CODE.TIMEOUT))
      .mockResolvedValueOnce(async () => MOCK_RETRIEVE_REPORT_RESPONSE);

    reportClient.polling = jest
      .fn()
      .mockImplementation(async () => ({ status: HttpStatusCode.Ok, response: MOCK_REPORT_RESPONSE }));
    const { result } = setup();

    await act(async () => {
      await result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_DORA_METRIC_TYPE);
    });

    expect(result.current.reportInfos[0].timeout4Dora.message).toEqual('Data loading failed');
    expect(result.current.reportInfos[0].timeout4Dora.shouldShow).toEqual(true);
    expect(result.current.reportInfos[0].reportData).toEqual(undefined);
    expect(result.current.reportInfos[1].timeout4Dora.message).toEqual('');
    expect(result.current.reportInfos[1].reportData).toBeTruthy();
  });

  it('should call polling report and setTimeout when request board data given pollingReport response return 200', async () => {
    reportClient.polling = jest
      .fn()
      .mockImplementation(async () => ({ status: HttpStatusCode.Ok, response: MOCK_REPORT_RESPONSE }));
    reportClient.retrieveByUrl = jest.fn().mockImplementation(async () => MOCK_RETRIEVE_REPORT_RESPONSE);

    const { result } = setup();

    await waitFor(() => {
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_BOARD_METRIC_TYPE);
    });

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(reportClient.polling).toHaveBeenCalledTimes(2);
    });
  });

  it('should call polling report more than one time when metrics is loading', async () => {
    reportClient.polling = jest.fn().mockImplementation(async () => ({
      status: HttpStatusCode.Ok,
      response: { ...MOCK_REPORT_RESPONSE, allMetricsCompleted: false },
    }));
    reportClient.polling = jest
      .fn()
      .mockReturnValueOnce({
        status: HttpStatusCode.Ok,
        response: { ...MOCK_REPORT_RESPONSE, allMetricsCompleted: false },
      })
      .mockReturnValueOnce({
        status: HttpStatusCode.Ok,
        response: { ...MOCK_REPORT_RESPONSE, allMetricsCompleted: true },
      })
      .mockReturnValueOnce({
        status: HttpStatusCode.Ok,
        response: { ...MOCK_REPORT_RESPONSE, allMetricsCompleted: true },
      });
    reportClient.retrieveByUrl = jest
      .fn()
      .mockReturnValueOnce(MOCK_RETRIEVE_REPORT_RESPONSE)
      .mockReturnValueOnce({ ...MOCK_RETRIEVE_REPORT_RESPONSE, callbackUrl: '/url/1234' });

    const { result } = setup();

    await act(async () => {
      await result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS);
      jest.advanceTimersByTime(10000);
    });

    expect(reportClient.polling).toHaveBeenCalledTimes(3);
  });

  it('should call polling report only once when request board data given dora data retrieval is called before', async () => {
    reportClient.polling = jest
      .fn()
      .mockImplementation(async () => ({ status: HttpStatusCode.Ok, response: MOCK_REPORT_RESPONSE }));
    reportClient.retrieveByUrl = jest.fn().mockImplementation(async () => MOCK_RETRIEVE_REPORT_RESPONSE);

    const { result } = setup();

    await waitFor(async () => {
      await result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_BOARD_METRIC_TYPE);
      await result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_DORA_METRIC_TYPE);
    });

    jest.runOnlyPendingTimers();

    expect(reportClient.polling).toHaveBeenCalledTimes(2);
  });

  it('should call polling report and setTimeout when request dora data given pollingReport response return 204', async () => {
    reportClient.polling = jest
      .fn()
      .mockImplementation(async () => ({ status: HttpStatusCode.NoContent, response: MOCK_REPORT_RESPONSE }));

    reportClient.retrieveByUrl = jest
      .fn()
      .mockImplementation(async () => ({ response: MOCK_RETRIEVE_REPORT_RESPONSE }));

    const { result } = renderHook(() => useGenerateReportEffect());

    await waitFor(() => {
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_DORA_METRIC_TYPE);
    });

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(reportClient.polling).toHaveBeenCalledTimes(1);
    });
  });

  it('should call polling report only once when request dora data given board data retrieval is called before', async () => {
    reportClient.polling = jest
      .fn()
      .mockImplementation(async () => ({ status: HttpStatusCode.NoContent, response: MOCK_REPORT_RESPONSE }));

    reportClient.retrieveByUrl = jest
      .fn()
      .mockImplementation(async () => ({ response: MOCK_RETRIEVE_REPORT_RESPONSE }));

    const { result } = renderHook(() => useGenerateReportEffect());

    await waitFor(() => {
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_DORA_METRIC_TYPE);
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_BOARD_METRIC_TYPE);
    });

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(reportClient.polling).toHaveBeenCalledTimes(1);
    });
  });

  it('should set "Data loading failed" for board metric when request board data given UnknownException', async () => {
    reportClient.retrieveByUrl = jest.fn().mockRejectedValue(new UnknownError());

    const { result } = renderHook(() => useGenerateReportEffect());

    await waitFor(() => {
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_BOARD_METRIC_TYPE);
      expect(result.current.reportInfos[0].generalError4Board).toEqual('Data loading failed');
    });
  });

  it('should set "Data loading failed" for dora metric when request dora data given UnknownException', async () => {
    reportClient.retrieveByUrl = jest.fn().mockRejectedValue(new UnknownError());

    const { result } = renderHook(() => useGenerateReportEffect());

    await waitFor(() => {
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS_WITH_DORA_METRIC_TYPE);
      expect(result.current.reportInfos[0].generalError4Dora).toEqual('Data loading failed');
    });
  });

  it('should set "Data loading failed" for report when polling given UnknownException', async () => {
    reportClient.polling = jest.fn().mockRejectedValue(new UnknownError());
    reportClient.retrieveByUrl = jest
      .fn()
      .mockImplementation(async () => ({ response: MOCK_RETRIEVE_REPORT_RESPONSE }));

    const { result } = renderHook(() => useGenerateReportEffect());

    await waitFor(() => {
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS);
      expect(result.current.reportInfos[0].generalError4Report).toEqual('Data loading failed');
    });
  });

  it('should set "Data loading failed" for report when all data retrieval times out', async () => {
    reportClient.retrieveByUrl = jest.fn().mockRejectedValue(new TimeoutError('5xx error', 503));

    const { result } = renderHook(() => useGenerateReportEffect());

    await waitFor(() => {
      result.current.startToRequestData(MOCK_GENERATE_REPORT_REQUEST_PARAMS);
      expect(result.current.reportInfos[0].timeout4Report).toEqual('Data loading failed');
    });
  });
});
