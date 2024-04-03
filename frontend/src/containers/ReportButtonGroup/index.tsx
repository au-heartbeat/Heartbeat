import { StyledButtonGroup, StyledExportButton, StyledRightButtonGroup } from '@src/containers/ReportButtonGroup/style';
import { BackButton, SaveButton } from '@src/containers/MetricsStepper/style';
import { ExpiredDialog } from '@src/containers/ReportStep/ExpiredDialog';
import { CSVReportRequestDTO } from '@src/clients/report/dto/request';
import { COMMON_BUTTONS, REPORT_TYPES } from '@src/constants/commons';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { useExportCsvEffect } from '@src/hooks/useExportCsvEffect';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import {MESSAGE, TIPS} from '@src/constants/resources';
import { Tooltip } from '@mui/material';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useAppDispatch} from "@src/hooks/useAppDispatch";
import {addNotification} from "@src/context/notification/NotificationSlice";

interface ReportButtonGroupProps {
  handleSave?: () => void;
  handleBack: () => void;
  csvTimeStamp: number;
  startDate: string;
  endDate: string;
  reportData: ReportResponseDTO | undefined;
  isShowSave: boolean;
  isShowExportBoardButton: boolean;
  isShowExportPipelineButton: boolean;
  isShowExportMetrics: boolean;
}

export const ReportButtonGroup = ({
  handleSave,
  handleBack,
  csvTimeStamp,
  startDate,
  endDate,
  reportData,
  isShowSave,
  isShowExportMetrics,
  isShowExportBoardButton,
  isShowExportPipelineButton,
}: ReportButtonGroupProps) => {
  const dispatch = useAppDispatch();
  const { fetchExportData, isExpired } = useExportCsvEffect();
  const [exportValidityTimeMin, setExportValidityTimeMin] = useState<number | undefined | null>(undefined);
  const [allMetricsCompleted, setAllMetricsCompleted] = useState<boolean>(false);

  const exportCSV = (dataType: REPORT_TYPES, startDate: string, endDate: string): CSVReportRequestDTO => ({
    dataType: dataType,
    csvTimeStamp: csvTimeStamp,
    startDate: startDate,
    endDate: endDate,
  });

  const handleDownload = (dataType: REPORT_TYPES, startDate: string, endDate: string) => {
    fetchExportData(exportCSV(dataType, startDate, endDate));
  };

  const pipelineButtonDisabled =
    !reportData ||
    reportData.doraMetricsCompleted === false ||
    reportData?.reportMetricsError?.pipelineMetricsError ||
    reportData?.reportMetricsError?.sourceControlMetricsError;

  const isReportHasError =
    !!reportData?.reportMetricsError.boardMetricsError ||
    !!reportData?.reportMetricsError.pipelineMetricsError ||
    !!reportData?.reportMetricsError.sourceControlMetricsError;

  const enableExportMetricData = !!(reportData?.overallMetricsCompleted && !isReportHasError);
  const enableExportBoardData = !!(
    reportData?.boardMetricsCompleted && !reportData?.reportMetricsError?.boardMetricsError
  );
  const enableExportPipelineData = !pipelineButtonDisabled;

  useEffect(() => {
    setExportValidityTimeMin(reportData?.exportValidityTime);
    reportData?.allMetricsCompleted &&
    setAllMetricsCompleted(enableExportMetricData || enableExportBoardData || enableExportPipelineData);
  }, [dispatch, reportData]);

  useLayoutEffect(() => {
    if (exportValidityTimeMin && allMetricsCompleted) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        const remainingExpireTime = 5 * 60 * 1000;
        const remainingTime = exportValidityTimeMin * 60 * 1000 - elapsedTime;
        if (remainingTime <= remainingExpireTime) {
          dispatch(
            addNotification({
              message: MESSAGE.EXPIRE_INFORMATION(5),
            }),
          );
          clearInterval(timer);
        }
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [dispatch, exportValidityTimeMin, allMetricsCompleted]);


  useLayoutEffect(() => {
    exportValidityTimeMin &&
    allMetricsCompleted &&
    dispatch(
      addNotification({
        message: MESSAGE.EXPIRE_INFORMATION(exportValidityTimeMin),
      }),
    );
  }, [dispatch, exportValidityTimeMin, allMetricsCompleted]);

  return (
    <>
      <StyledButtonGroup isShowSave={isShowSave}>
        {isShowSave && (
          <Tooltip title={TIPS.SAVE_CONFIG} placement={'right'}>
            <SaveButton variant='text' onClick={handleSave} startIcon={<SaveAltIcon />}>
              {COMMON_BUTTONS.SAVE}
            </SaveButton>
          </Tooltip>
        )}
        <StyledRightButtonGroup>
          <BackButton onClick={handleBack} variant='outlined'>
            {COMMON_BUTTONS.BACK}
          </BackButton>
          {isShowExportMetrics && (
            <StyledExportButton
              disabled={!enableExportMetricData}
              onClick={() => handleDownload(REPORT_TYPES.METRICS, startDate, endDate)}
            >
              {COMMON_BUTTONS.EXPORT_METRIC_DATA}
            </StyledExportButton>
          )}
          {isShowExportBoardButton && (
            <StyledExportButton
              disabled={!enableExportBoardData}
              onClick={() => handleDownload(REPORT_TYPES.BOARD, startDate, endDate)}
            >
              {COMMON_BUTTONS.EXPORT_BOARD_DATA}
            </StyledExportButton>
          )}
          {isShowExportPipelineButton && (
            <StyledExportButton
              disabled={!enableExportPipelineData}
              onClick={() => handleDownload(REPORT_TYPES.PIPELINE, startDate, endDate)}
            >
              {COMMON_BUTTONS.EXPORT_PIPELINE_DATA}
            </StyledExportButton>
          )}
        </StyledRightButtonGroup>
      </StyledButtonGroup>
      {<ExpiredDialog isExpired={isExpired} handleOk={handleBack} />}
    </>
  );
};
