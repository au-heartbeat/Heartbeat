import { StyledButtonGroup, StyledExportButton, StyledRightButtonGroup } from '@src/containers/ReportButtonGroup/style';
import { COMMON_BUTTONS, DOWNLOAD_DIALOG_TITLE, ReportTypes } from '@src/constants/commons';
import { DateRangeItem, DownloadDialog } from '@src/containers/ReportStep/DownloadDialog';
import { BackButton, SaveButton } from '@src/containers/MetricsStepper/style';
import { ExpiredDialog } from '@src/containers/ReportStep/ExpiredDialog';
import { CSVReportRequestDTO } from '@src/clients/report/dto/request';
import { AllErrorResponse } from '@src/clients/report/dto/response';
import { DateRangeRequestResult } from '@src/containers/ReportStep';
import { useExportCsvEffect } from '@src/hooks/useExportCsvEffect';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { TIPS } from '@src/constants/resources';
import { Tooltip } from '@mui/material';
import React, { useState } from 'react';

interface ReportButtonGroupProps {
  handleSave?: () => void;
  handleBack: () => void;
  csvTimeStamp: number;
  isShowSave: boolean;
  isShowExportBoardButton: boolean;
  isShowExportPipelineButton: boolean;
  isShowExportMetrics: boolean;
  dateRangeRequestResults: DateRangeRequestResult[];
  isShowExportDoraChartButton: boolean;
  isShowExportBoardChartButton: boolean;
}

const SINGLE_DATE_RANGE_DOWNLOAD_KEY = {
  ENABLE_EXPORT_METRIC_DATA: 'enableExportMetricData',
  ENABLE_EXPORT_BOARD_DATA: 'enableExportBoardData',
  ENABLE_EXPORT_PIPELINE_DATA: 'enableExportPipelineData',
};

export const ReportButtonGroup = ({
  handleSave,
  handleBack,
  csvTimeStamp,
  isShowSave,
  isShowExportMetrics,
  isShowExportBoardButton,
  isShowExportPipelineButton,
  isShowExportDoraChartButton,
  isShowExportBoardChartButton,
  dateRangeRequestResults,
}: ReportButtonGroupProps) => {
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [downloadReportList, setDownloadReportList] = useState<DateRangeItem[]>([]);
  const [dataType, setDataType] = useState<ReportTypes | null>(null);
  const { fetchExportData, isExpired } = useExportCsvEffect();

  const isReportHasError = (reportMetricsError: AllErrorResponse) => {
    return (
      !!reportMetricsError.boardMetricsError ||
      !!reportMetricsError.pipelineMetricsError ||
      !!reportMetricsError.sourceControlMetricsError
    );
  };

  const isReportHasDoraError = (reportMetricsError: AllErrorResponse) => {
    return !!reportMetricsError.pipelineMetricsError || !!reportMetricsError.sourceControlMetricsError;
  };

  const dateRangeListWithStatus = dateRangeRequestResults.map((item) => {
    let enableExportMetricData: boolean = false;
    let enableExportBoardData: boolean = false;
    let enableExportPipelineData: boolean = false;
    const reportData = item.reportData;
    if (reportData) {
      enableExportMetricData = reportData.overallMetricsCompleted && !isReportHasError(reportData.reportMetricsError);
      enableExportBoardData = !!reportData.boardMetricsCompleted && !reportData.reportMetricsError.boardMetricsError;
      enableExportPipelineData =
        !!reportData.doraMetricsCompleted && !isReportHasDoraError(reportData.reportMetricsError);
    }
    return {
      startDate: item.startDate,
      endDate: item.endDate,
      [SINGLE_DATE_RANGE_DOWNLOAD_KEY.ENABLE_EXPORT_METRIC_DATA]: enableExportMetricData,
      [SINGLE_DATE_RANGE_DOWNLOAD_KEY.ENABLE_EXPORT_BOARD_DATA]: enableExportBoardData,
      [SINGLE_DATE_RANGE_DOWNLOAD_KEY.ENABLE_EXPORT_PIPELINE_DATA]: enableExportPipelineData,
    };
  });

  const successRequestResults = dateRangeRequestResults.filter((result) => result.reportData);
  const exportButtonsClickable = {
    exportMetricData:
      successRequestResults.every(({ reportData }) => reportData!.overallMetricsCompleted) &&
      dateRangeListWithStatus.some(({ enableExportMetricData }) => enableExportMetricData),
    exportBoardData:
      successRequestResults.every(({ reportData }) => reportData!.boardMetricsCompleted) &&
      dateRangeListWithStatus.some(({ enableExportBoardData }) => enableExportBoardData),
    exportPipelineData:
      successRequestResults.every(({ reportData }) => reportData!.doraMetricsCompleted) &&
      dateRangeListWithStatus.some(({ enableExportPipelineData }) => enableExportPipelineData),
  };

  const exportCSV = (dataType: ReportTypes, startDate: string, endDate: string): CSVReportRequestDTO => ({
    dataType: dataType,
    csvTimeStamp: csvTimeStamp,
    startDate: startDate,
    endDate: endDate,
  });

  const handleDownload = (dateRange: DateRangeItem[], dataType: ReportTypes) => {
    if (dateRange.length > 1) {
      setDownloadReportList(dateRange);
      setDataType(dataType);
      setIsShowDialog(true);
    } else {
      fetchExportData(exportCSV(dataType, dateRange[0].startDate, dateRange[0].endDate));
    }
  };

  const handleCloseDialog = () => {
    setIsShowDialog(false);
    setDataType(null);
  };

  const getDownloadInfos = (dataType: ReportTypes): DateRangeItem[] => {
    const REPORT_TYPE_MAPPING = {
      [ReportTypes.Board]: SINGLE_DATE_RANGE_DOWNLOAD_KEY.ENABLE_EXPORT_BOARD_DATA,
      [ReportTypes.Pipeline]: SINGLE_DATE_RANGE_DOWNLOAD_KEY.ENABLE_EXPORT_PIPELINE_DATA,
      [ReportTypes.Metrics]: SINGLE_DATE_RANGE_DOWNLOAD_KEY.ENABLE_EXPORT_METRIC_DATA,
    };
    return dateRangeListWithStatus.map((dateRangeWithStatus) => ({
      startDate: dateRangeWithStatus.startDate,
      endDate: dateRangeWithStatus.endDate,
      disabled: !dateRangeWithStatus[REPORT_TYPE_MAPPING[dataType]] as boolean,
    }));
  };

  return (
    <>
      {dataType && (
        <DownloadDialog
          isShowDialog={isShowDialog}
          handleClose={handleCloseDialog}
          dateRangeList={downloadReportList}
          downloadCSVFile={(startDate, endDate) => fetchExportData(exportCSV(dataType, startDate, endDate))}
          title={DOWNLOAD_DIALOG_TITLE[dataType]}
        />
      )}
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
              disabled={!exportButtonsClickable.exportMetricData}
              onClick={() => handleDownload(getDownloadInfos(ReportTypes.Metrics), ReportTypes.Metrics)}
            >
              {COMMON_BUTTONS.EXPORT_METRIC_DATA}
            </StyledExportButton>
          )}
          {isShowExportBoardButton && (
            <StyledExportButton
              disabled={!exportButtonsClickable.exportBoardData}
              onClick={() => handleDownload(getDownloadInfos(ReportTypes.Board), ReportTypes.Board)}
            >
              {COMMON_BUTTONS.EXPORT_BOARD_DATA}
            </StyledExportButton>
          )}
          {isShowExportPipelineButton && (
            <StyledExportButton
              disabled={!exportButtonsClickable.exportPipelineData}
              onClick={() => handleDownload(getDownloadInfos(ReportTypes.Pipeline), ReportTypes.Pipeline)}
            >
              {COMMON_BUTTONS.EXPORT_PIPELINE_DATA}
            </StyledExportButton>
          )}
          {isShowExportBoardChartButton && (
            <StyledExportButton
              disabled={!exportButtonsClickable.exportBoardData}
              onClick={() => handleDownload(getDownloadInfos(ReportTypes.Board), ReportTypes.Board)}
            >
              {COMMON_BUTTONS.EXPORT_BOARD_CHART}
            </StyledExportButton>
          )}
          {isShowExportDoraChartButton && (
            <StyledExportButton
              disabled={!exportButtonsClickable.exportPipelineData}
              onClick={() => handleDownload(getDownloadInfos(ReportTypes.Pipeline), ReportTypes.Pipeline)}
            >
              {COMMON_BUTTONS.EXPORT_DORA_CHART}
            </StyledExportButton>
          )}
        </StyledRightButtonGroup>
      </StyledButtonGroup>
      {<ExpiredDialog isExpired={isExpired} handleOk={handleBack} />}
    </>
  );
};
