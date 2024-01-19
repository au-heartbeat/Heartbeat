import { MOCK_EXPORT_CSV_REQUEST_PARAMS } from '../fixtures';
import { act, renderHook } from '@testing-library/react';
import { csvClient } from '@src/clients/report/CSVClient';
import { useExportCsvEffect } from '@src/hooks/useExportCsvEffect';
import { InternalServerException } from '@src/exceptions/InternalServerException';
import { NotFoundException } from '@src/exceptions/NotFoundException';
import { HttpStatusCode } from 'axios';
import { useNotificationLayoutEffect } from '@src/hooks/useNotificationLayoutEffect';

describe('use export csv effect', () => {
  const { result: notificationHook } = renderHook(() => useNotificationLayoutEffect());

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call addNotification when export csv response status 500', async () => {
    csvClient.exportCSVData = jest.fn().mockImplementation(() => {
      throw new InternalServerException('error message', HttpStatusCode.InternalServerError);
    });
    notificationHook.current.addNotification = jest.fn();
    const { result } = renderHook(() => useExportCsvEffect(notificationHook.current));

    act(() => {
      result.current.fetchExportData(MOCK_EXPORT_CSV_REQUEST_PARAMS);
    });

    expect(notificationHook.current.addNotification).toBeCalledWith({
      message: 'Failed to export csv.',
      type: 'error',
    });
  });

  it('should set isExpired true when export csv response status 404', async () => {
    csvClient.exportCSVData = jest.fn().mockImplementation(() => {
      throw new NotFoundException('error message', HttpStatusCode.NotFound);
    });
    const { result } = renderHook(() => useExportCsvEffect(notificationHook.current));

    act(() => {
      result.current.fetchExportData(MOCK_EXPORT_CSV_REQUEST_PARAMS);
    });

    expect(result.current.isExpired).toEqual(true);
  });
});
