package heartbeat.service.report;

import heartbeat.repository.FilePrefixType;
import heartbeat.repository.FileType;
import heartbeat.controller.board.dto.request.CardStepsEnum;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.controller.report.dto.response.ErrorInfo;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.BadRequestException;
import heartbeat.exception.BaseException;
import heartbeat.exception.GenerateReportException;
import heartbeat.exception.RequestFailedException;
import heartbeat.exception.ServiceUnavailableException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.handler.base.AsyncExceptionDTO;
import heartbeat.service.report.calculator.ClassificationCalculator;
import heartbeat.service.report.calculator.CycleTimeCalculator;
import heartbeat.service.report.calculator.DeploymentFrequencyCalculator;
import heartbeat.service.report.calculator.DevChangeFailureRateCalculator;
import heartbeat.service.report.calculator.LeadTimeForChangesCalculator;
import heartbeat.service.report.calculator.MeanToRecoveryCalculator;
import heartbeat.service.report.calculator.ReworkCalculator;
import heartbeat.service.report.calculator.VelocityCalculator;
import heartbeat.service.report.calculator.model.FetchedData;
import heartbeat.service.report.calculator.model.FetchedData.BuildKiteData;
import heartbeat.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

import static heartbeat.repository.FileType.ERROR;
import static heartbeat.repository.FileType.REPORT;
import static heartbeat.controller.report.dto.request.MetricType.BOARD;
import static heartbeat.controller.report.dto.request.MetricType.DORA;
import static heartbeat.repository.FileRepository.EXPORT_CSV_VALIDITY_TIME;
import static heartbeat.util.ValueUtil.getValueOrNull;
import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
@Log4j2
public class GenerateReporterService {

	private final KanbanService kanbanService;

	private final KanbanCsvService kanbanCsvService;

	private final PipelineService pipelineService;

	private final ClassificationCalculator classificationCalculator;

	private final DeploymentFrequencyCalculator deploymentFrequency;

	private final DevChangeFailureRateCalculator devChangeFailureRate;

	private final MeanToRecoveryCalculator meanToRecoveryCalculator;

	private final CycleTimeCalculator cycleTimeCalculator;

	private final VelocityCalculator velocityCalculator;

	private final CSVFileGenerator csvFileGenerator;

	private final LeadTimeForChangesCalculator leadTimeForChangesCalculator;

	private final ReworkCalculator reworkCalculator;

	private final AsyncMetricsDataHandler asyncMetricsDataHandler;

	private final FileRepository fileRepository;

	private static final char FILENAME_SEPARATOR = '-';

	public void generateBoardReport(String uuid, GenerateReportRequest request) {
		String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
		fileRepository.removeFileByType(ERROR, uuid, timeRangeAndTimeStamp, FilePrefixType.BOARD_REPORT_PREFIX);
		log.info(
				"Start to generate board report, _metrics: {}, _country holiday: {}, _startTime: {}, _endTime: {}, _uuid: {}, _fileName: {}",
				request.getMetrics(), request.getCalendarType(), request.getStartTime(), request.getEndTime(), uuid,
				timeRangeAndTimeStamp);
		try {
			saveReporterInHandler(generateBoardReporter(uuid, request), uuid, timeRangeAndTimeStamp,
					FilePrefixType.BOARD_REPORT_PREFIX);
			log.info(
					"Successfully generate board report, _metrics: {}, _country holiday: {}, _startTime: {}, _endTime: {}, _uuid: {}, _fileName: {}",
					request.getMetrics(), request.getCalendarType(), request.getStartTime(), request.getEndTime(), uuid,
					timeRangeAndTimeStamp);
		}
		catch (BaseException e) {
			fileRepository.createFileByType(ERROR, uuid, timeRangeAndTimeStamp, e, FilePrefixType.BOARD_REPORT_PREFIX);
			if (List.of(401, 403, 404).contains(e.getStatus()))
				asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(uuid, timeRangeAndTimeStamp, BOARD, false);
		}
	}

	public void generateDoraReport(String uuid, GenerateReportRequest request) {
		String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
		fileRepository.removeFileByType(ERROR, uuid, timeRangeAndTimeStamp, FilePrefixType.PIPELINE_REPORT_PREFIX);
		fileRepository.removeFileByType(ERROR, uuid, timeRangeAndTimeStamp, FilePrefixType.SOURCE_CONTROL_PREFIX);

		FetchedData fetchedData = new FetchedData();
		if (CollectionUtils.isNotEmpty(request.getPipelineMetrics())) {
			GenerateReportRequest pipelineRequest = request.toPipelineRequest();
			generatePipelineReport(uuid, pipelineRequest, fetchedData);
		}
		if (CollectionUtils.isNotEmpty(request.getSourceControlMetrics())) {
			GenerateReportRequest sourceControlRequest = request.toSourceControlRequest();
			generateSourceControlReport(uuid, sourceControlRequest, fetchedData);
		}

		MetricsDataCompleted previousMetricsCompleted = fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED,
				uuid, timeRangeAndTimeStamp, MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);

		if (previousMetricsCompleted != null && Boolean.FALSE.equals(previousMetricsCompleted.doraMetricsCompleted())) {
			CompletableFuture.runAsync(() -> generateCSVForPipeline(uuid, request, fetchedData.getBuildKiteData()));
		}
	}

	private void generatePipelineReport(String uuid, GenerateReportRequest request, FetchedData fetchedData) {
		String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

		log.info(
				"Start to generate pipeline report, _metrics: {}, _country holiday: {}, _startTime: {}, _endTime: {}, _uuid: {}, _fileName: {}",
				request.getPipelineMetrics(), request.getCalendarType(), request.getStartTime(), request.getEndTime(),
				uuid, timeRangeAndTimeStamp);
		try {
			fetchBuildKiteData(request, fetchedData);
			saveReporterInHandler(generatePipelineReporter(request, fetchedData), uuid, timeRangeAndTimeStamp,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			log.info(
					"Successfully generate pipeline report, _metrics: {}, _country holiday: {}, _startTime: {}, _endTime: {}, _uuid: {}, _fileName: {}",
					request.getPipelineMetrics(), request.getCalendarType(), request.getStartTime(),
					request.getEndTime(), uuid, timeRangeAndTimeStamp);
		}
		catch (BaseException e) {
			fileRepository.createFileByType(ERROR, uuid, timeRangeAndTimeStamp, e,
					FilePrefixType.PIPELINE_REPORT_PREFIX);
			if (List.of(401, 403, 404).contains(e.getStatus()))
				asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(uuid, timeRangeAndTimeStamp, DORA, false);
		}
	}

	private void generateSourceControlReport(String uuid, GenerateReportRequest request, FetchedData fetchedData) {
		String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();

		log.info(
				"Start to generate source control report, _metrics: {}, _country holiday: {}, _startTime: {}, _endTime: {}, _uuid: {} _fileName: {}",
				request.getSourceControlMetrics(), request.getCalendarType(), request.getStartTime(),
				request.getEndTime(), uuid, timeRangeAndTimeStamp);
		try {
			fetchGitHubData(request, fetchedData);
			saveReporterInHandler(generateSourceControlReporter(request, fetchedData), uuid, timeRangeAndTimeStamp,
					FilePrefixType.SOURCE_CONTROL_PREFIX);
			log.info(
					"Successfully generate source control report, _metrics: {}, _country holiday: {}, _startTime: {}, _endTime: {}, _uuid: {} _fileName: {}",
					request.getSourceControlMetrics(), request.getCalendarType(), request.getStartTime(),
					request.getEndTime(), uuid, timeRangeAndTimeStamp);
		}
		catch (BaseException e) {
			fileRepository.createFileByType(ERROR, uuid, timeRangeAndTimeStamp, e,
					FilePrefixType.SOURCE_CONTROL_PREFIX);
			if (List.of(401, 403, 404).contains(e.getStatus()))
				asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(uuid, timeRangeAndTimeStamp, DORA, false);
		}
	}

	private synchronized ReportResponse generatePipelineReporter(GenerateReportRequest request,
			FetchedData fetchedData) {

		ReportResponse reportResponse = new ReportResponse(EXPORT_CSV_VALIDITY_TIME);

		request.getPipelineMetrics().forEach(metric -> {
			switch (metric) {
				case "deployment frequency" -> reportResponse.setDeploymentFrequency(
						deploymentFrequency.calculate(fetchedData.getBuildKiteData().getDeployTimesList(),
								Long.parseLong(request.getStartTime()), Long.parseLong(request.getEndTime()),
								request.getCalendarType(), request.getTimezoneByZoneId()));
				case "dev change failure rate" -> reportResponse.setDevChangeFailureRate(
						devChangeFailureRate.calculate(fetchedData.getBuildKiteData().getDeployTimesList()));
				default -> reportResponse.setDevMeanTimeToRecovery(meanToRecoveryCalculator
					.calculate(fetchedData.getBuildKiteData().getDeployTimesList(), request));
			}
		});

		return reportResponse;
	}

	private synchronized ReportResponse generateBoardReporter(String uuid, GenerateReportRequest request) {
		FetchedData fetchedData = fetchJiraBoardData(request, new FetchedData());

		ReportResponse reportResponse = new ReportResponse(EXPORT_CSV_VALIDITY_TIME);
		JiraBoardSetting jiraBoardSetting = request.getJiraBoardSetting();

		request.getBoardMetrics().forEach(metric -> {
			switch (metric) {
				case "velocity" -> assembleVelocity(fetchedData, reportResponse);
				case "cycle time" -> assembleCycleTime(fetchedData, reportResponse, jiraBoardSetting);
				case "classification" -> assembleClassification(fetchedData, reportResponse, jiraBoardSetting);
				default -> assembleReworkInfo(request, fetchedData, reportResponse);
			}
		});

		CompletableFuture.runAsync(() -> generateCsvForBoard(uuid, request, fetchedData));
		return reportResponse;
	}

	private void generateCsvForBoard(String uuid, GenerateReportRequest request, FetchedData fetchedData) {
		kanbanCsvService.generateCsvInfo(uuid, request, fetchedData.getCardCollectionInfo());
		asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(uuid, request.getTimeRangeAndTimeStamp(), BOARD,
				true);
	}

	private void assembleVelocity(FetchedData fetchedData, ReportResponse reportResponse) {
		CardCollection cardCollection = fetchedData.getCardCollectionInfo().getRealDoneCardCollection();
		reportResponse.setVelocity(velocityCalculator.calculateVelocity(cardCollection));
	}

	private void assembleCycleTime(FetchedData fetchedData, ReportResponse reportResponse,
			JiraBoardSetting jiraBoardSetting) {
		reportResponse.setCycleTime(cycleTimeCalculator.calculateCycleTime(
				fetchedData.getCardCollectionInfo().getRealDoneCardCollection(), jiraBoardSetting.getBoardColumns()));
	}

	private void assembleClassification(FetchedData fetchedData, ReportResponse reportResponse,
			JiraBoardSetting jiraBoardSetting) {
		reportResponse.setClassificationList(classificationCalculator.calculate(jiraBoardSetting.getTargetFields(),
				fetchedData.getCardCollectionInfo().getRealDoneCardCollection()));
	}

	private void assembleReworkInfo(GenerateReportRequest request, FetchedData fetchedData,
			ReportResponse reportResponse) {
		if (isNull(request.getJiraBoardSetting().getReworkTimesSetting())) {
			return;
		}
		CardCollection realDoneCardCollection = fetchedData.getCardCollectionInfo().getRealDoneCardCollection();
		CardStepsEnum enumReworkState = request.getJiraBoardSetting().getReworkTimesSetting().getEnumReworkState();
		reportResponse.setRework(reworkCalculator.calculateRework(realDoneCardCollection, enumReworkState));
	}

	private synchronized ReportResponse generateSourceControlReporter(GenerateReportRequest request,
			FetchedData fetchedData) {

		ReportResponse reportResponse = new ReportResponse(EXPORT_CSV_VALIDITY_TIME);

		request.getSourceControlMetrics()
			.forEach(metric -> reportResponse.setLeadTimeForChanges(
					leadTimeForChangesCalculator.calculate(fetchedData.getBuildKiteData().getPipelineLeadTimes())));

		return reportResponse;
	}

	private void fetchBuildKiteData(GenerateReportRequest request, FetchedData fetchedData) {
		if (request.getBuildKiteSetting() == null)
			throw new BadRequestException("Failed to fetch BuildKite info due to BuildKite setting is null.");
		fetchedData.setBuildKiteData(pipelineService.fetchBuildKiteInfo(request));
	}

	private void fetchGitHubData(GenerateReportRequest request, FetchedData fetchedData) {
		if (request.getCodebaseSetting() == null)
			throw new BadRequestException("Failed to fetch Github info due to code base setting is null.");
		fetchedData.setBuildKiteData(pipelineService.fetchGitHubData(request));
	}

	private FetchedData fetchJiraBoardData(GenerateReportRequest request, FetchedData fetchedData) {
		if (CollectionUtils.isNotEmpty(request.getBoardMetrics())) {
			if (request.getJiraBoardSetting() == null)
				throw new BadRequestException("Failed to fetch Jira info due to Jira board setting is null.");
			fetchedData.setCardCollectionInfo(kanbanService.fetchDataFromKanban(request));
		}
		return fetchedData;
	}

	private void generateCSVForPipeline(String uuid, GenerateReportRequest request, BuildKiteData buildKiteData) {
		List<PipelineCSVInfo> pipelineData = pipelineService.generateCSVForPipeline(request.getStartTime(),
				request.getEndTime(), buildKiteData, request.getBuildKiteSetting().getDeploymentEnvList());

		csvFileGenerator.convertPipelineDataToCSV(uuid, pipelineData, request.getTimeRangeAndTimeStamp());
		asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(uuid, request.getTimeRangeAndTimeStamp(), DORA,
				true);
	}

	public void generateCSVForMetric(String uuid, ReportResponse reportContent, String csvTimeRangeTimeStamp) {
		csvFileGenerator.convertMetricDataToCSV(uuid, reportContent, csvTimeRangeTimeStamp);
	}

	private void saveReporterInHandler(ReportResponse reportContent, String uuid, String fileName,
			FilePrefixType filePrefixType) {
		fileRepository.createFileByType(REPORT, uuid, fileName, reportContent, filePrefixType);
	}

	private ErrorInfo handleAsyncExceptionAndGetErrorInfo(AsyncExceptionDTO exception) {
		if (Objects.nonNull(exception)) {
			int status = exception.getStatus();
			final String errorMessage = exception.getMessage();
			switch (status) {
				case 401, 403, 404 -> {
					return ErrorInfo.builder().status(status).errorMessage(errorMessage).build();
				}
				case 500 -> throw new GenerateReportException(errorMessage);
				case 503 -> throw new ServiceUnavailableException(errorMessage);
				default -> throw new RequestFailedException(status, errorMessage);
			}
		}
		return null;
	}

	public MetricsDataCompleted checkReportReadyStatus(String uuid, String timeRangeAndTimeStamp) {
		String timeStamp = timeRangeAndTimeStamp.substring(timeRangeAndTimeStamp.lastIndexOf(FILENAME_SEPARATOR) + 1);
		if (fileRepository.isExpired(System.currentTimeMillis(), Long.parseLong(timeStamp))) {
			throw new GenerateReportException("Failed to get report due to report time expires");
		}
		return fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, uuid, timeRangeAndTimeStamp,
				MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
	}

	public ReportResponse getComposedReportResponse(String uuid, String startTime, String endTime) {
		String timeRangeAndTimeStamp = fileRepository.getFileTimeRangeAndTimeStampByStartTimeAndEndTime(
				FileType.METRICS_DATA_COMPLETED, uuid, startTime, endTime);
		if (timeRangeAndTimeStamp == null) {
			return ReportResponse.builder()
				.overallMetricsCompleted(false)
				.boardMetricsCompleted(false)
				.doraMetricsCompleted(false)
				.allMetricsCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();
		}

		return getComposedReportResponse(uuid, timeRangeAndTimeStamp);
	}

	public ReportResponse getComposedReportResponse(String uuid, String timestamp, String startTime, String endTime) {
		String timeRangeAndTimeStamp = startTime + FILENAME_SEPARATOR + endTime + FILENAME_SEPARATOR + timestamp;

		return getComposedReportResponse(uuid, timeRangeAndTimeStamp);
	}

	private ReportResponse getComposedReportResponse(String uuid, String timeRangeAndTimeStamp) {
		MetricsDataCompleted reportReadyStatus = checkReportReadyStatus(uuid, timeRangeAndTimeStamp);

		ReportResponse boardReportResponse = fileRepository.readFileByType(REPORT, uuid, timeRangeAndTimeStamp,
				ReportResponse.class, FilePrefixType.BOARD_REPORT_PREFIX);
		ReportResponse pipelineReportResponse = fileRepository.readFileByType(REPORT, uuid, timeRangeAndTimeStamp,
				ReportResponse.class, FilePrefixType.PIPELINE_REPORT_PREFIX);
		ReportResponse sourceControlReportResponse = fileRepository.readFileByType(REPORT, uuid, timeRangeAndTimeStamp,
				ReportResponse.class, FilePrefixType.SOURCE_CONTROL_PREFIX);

		ReportMetricsError reportMetricsError = getReportErrorAndHandleAsyncException(uuid, timeRangeAndTimeStamp);
		return ReportResponse.builder()
			.velocity(getValueOrNull(boardReportResponse, ReportResponse::getVelocity))
			.classificationList(getValueOrNull(boardReportResponse, ReportResponse::getClassificationList))
			.cycleTime(getValueOrNull(boardReportResponse, ReportResponse::getCycleTime))
			.rework(getValueOrNull(boardReportResponse, ReportResponse::getRework))
			.exportValidityTime(EXPORT_CSV_VALIDITY_TIME)
			.deploymentFrequency(getValueOrNull(pipelineReportResponse, ReportResponse::getDeploymentFrequency))
			.devChangeFailureRate(getValueOrNull(pipelineReportResponse, ReportResponse::getDevChangeFailureRate))
			.devMeanTimeToRecovery(getValueOrNull(pipelineReportResponse, ReportResponse::getDevMeanTimeToRecovery))
			.leadTimeForChanges(getValueOrNull(sourceControlReportResponse, ReportResponse::getLeadTimeForChanges))
			.boardMetricsCompleted(reportReadyStatus.boardMetricsCompleted())
			.doraMetricsCompleted(reportReadyStatus.doraMetricsCompleted())
			.overallMetricsCompleted(reportReadyStatus.overallMetricCompleted())
			.allMetricsCompleted(reportReadyStatus.allMetricsCompleted())
			.isSuccessfulCreateCsvFile(reportReadyStatus.isSuccessfulCreateCsvFile())
			.reportMetricsError(reportMetricsError)
			.build();
	}

	private ReportMetricsError getReportErrorAndHandleAsyncException(String uuid, String timeRangeAndTimeStamp) {
		AsyncExceptionDTO boardException = fileRepository.readFileByType(ERROR, uuid, timeRangeAndTimeStamp,
				AsyncExceptionDTO.class, FilePrefixType.BOARD_REPORT_PREFIX);
		AsyncExceptionDTO pipelineException = fileRepository.readFileByType(ERROR, uuid, timeRangeAndTimeStamp,
				AsyncExceptionDTO.class, FilePrefixType.PIPELINE_REPORT_PREFIX);
		AsyncExceptionDTO sourceControlException = fileRepository.readFileByType(ERROR, uuid, timeRangeAndTimeStamp,
				AsyncExceptionDTO.class, FilePrefixType.SOURCE_CONTROL_PREFIX);
		return ReportMetricsError.builder()
			.boardMetricsError(handleAsyncExceptionAndGetErrorInfo(boardException))
			.pipelineMetricsError(handleAsyncExceptionAndGetErrorInfo(pipelineException))
			.sourceControlMetricsError(handleAsyncExceptionAndGetErrorInfo(sourceControlException))
			.build();
	}

}
