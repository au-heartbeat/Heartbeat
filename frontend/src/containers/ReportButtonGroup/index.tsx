import { StyledButtonGroup, StyledExportButton, StyledRightButtonGroup } from '@src/containers/ReportButtonGroup/style';
import { DateRangeItem, DownloadDialog } from '@src/containers/ReportStep/DownloadDialog';
import { BackButton, SaveButton } from '@src/containers/MetricsStepper/style';
import { ExpiredDialog } from '@src/containers/ReportStep/ExpiredDialog';
import { CSVReportRequestDTO } from '@src/clients/report/dto/request';
import { COMMON_BUTTONS, REPORT_TYPES } from '@src/constants/commons';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
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
  startDate: string;
  endDate: string;
  reportData: ReportResponseDTO | undefined;
  isShowSave: boolean;
  isShowExportBoardButton: boolean;
  isShowExportPipelineButton: boolean;
  isShowExportMetrics: boolean;
  dateRangeRequestResults: DateRangeRequestResult[];
}

export const ReportButtonGroup = ({
  handleSave,
  handleBack,
  csvTimeStamp,
  startDate,
  endDate,
  isShowSave,
  isShowExportMetrics,
  isShowExportBoardButton,
  isShowExportPipelineButton,
  dateRangeRequestResults,
}: ReportButtonGroupProps) => {
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [downloadReportList, setDownloadReportList] = useState([]);
  const { fetchExportData, isExpired } = useExportCsvEffect();

  const isReportHasError = (reportMetricsError) => {
    return (
      !!reportMetricsError.boardMetricsError ||
      !!reportMetricsError.pipelineMetricsError ||
      !!reportMetricsError.sourceControlMetricsError
    );
  };

  const isReportHasDoraError = (reportMetricsError) => {
    return !!reportMetricsError.pipelineMetricsError || !!reportMetricsError.sourceControlMetricsError;
  };

  const overallMetricsResults = dateRangeRequestResults.map(item => ({
    startDate: item.startDate,
    endDate: item.endDate,
    disabled: !(item.overallMetricsCompleted && !isReportHasError(item.reportMetricsError))
  }));
  const boardMetricsResults = dateRangeRequestResults.map(item => ({
    startDate: item.startDate,
    endDate: item.endDate,
    disabled: !(item.boardMetricsCompleted && !item.reportMetricsError.boardMetricsError)
  }));
  const pipelineMetricsResults = dateRangeRequestResults.map(item => ({
    startDate: item.startDate,
    endDate: item.endDate,
    disabled: !(item.doraMetricsCompleted && !isReportHasDoraError(item.reportMetricsError))
  }));

  const isAllOverallMetricsCompleted = dateRangeRequestResults.every(
    ({ overallMetricsCompleted }) => overallMetricsCompleted,
  );
  const hasReportWithoutError = dateRangeRequestResults.some(
    ({ reportMetricsError }) => !isReportHasError(reportMetricsError),
  );
  const exportMetricsButtonDisabled = !isAllOverallMetricsCompleted || !hasReportWithoutError;

  const isAllBoardMetricsCompleted = dateRangeRequestResults.every(
    ({ boardMetricsCompleted }) => boardMetricsCompleted,
  );
  const hasReportWithoutBoardError = dateRangeRequestResults.some(
    ({ reportMetricsError }) => !reportMetricsError.boardMetricsError,
  );
  const exportBoardButtonDisabled = !isAllBoardMetricsCompleted || !hasReportWithoutBoardError;

  const isAllDoraMetricsCompleted = dateRangeRequestResults.every(({ doraMetricsCompleted }) => doraMetricsCompleted);
  const hasReportWithoutDoraError = dateRangeRequestResults.some(
    ({ reportMetricsError }) => !isReportHasDoraError(reportMetricsError),
  );
  const exportDoraButtonDisabled = !isAllDoraMetricsCompleted || !hasReportWithoutDoraError;

  const exportCSV = (dataType: REPORT_TYPES, startDate: string, endDate: string): CSVReportRequestDTO => ({
    dataType: dataType,
    csvTimeStamp: csvTimeStamp,
    startDate: startDate,
    endDate: endDate,
  });

  const handleDownload = (dateRange: DateRangeItem[], dataType: REPORT_TYPES) => {
    if (dateRange.length > 1) {
      setIsShowDialog(true);
      setDownloadReportList(dateRange);
    } else {
      fetchExportData(exportCSV(dataType, startDate, endDate));
    }
  };

  return (
    <>
      <DownloadDialog
        isShowDialog={isShowDialog}
        handleClose={() => setIsShowDialog(false)}
        dateRangeItems={downloadReportList}
      />
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
              disabled={exportMetricsButtonDisabled}
              onClick={() => handleDownload(overallMetricsResults, REPORT_TYPES.METRICS)}
            >
              {COMMON_BUTTONS.EXPORT_METRIC_DATA}
            </StyledExportButton>
          )}
          {isShowExportBoardButton && (
            <StyledExportButton
              disabled={exportBoardButtonDisabled}
              onClick={() => handleDownload(boardMetricsResults, REPORT_TYPES.BOARD)}
            >
              {COMMON_BUTTONS.EXPORT_BOARD_DATA}
            </StyledExportButton>
          )}
          {isShowExportPipelineButton && (
            <StyledExportButton
              disabled={exportDoraButtonDisabled}
              onClick={() => handleDownload(pipelineMetricsResults, REPORT_TYPES.PIPELINE)}
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
