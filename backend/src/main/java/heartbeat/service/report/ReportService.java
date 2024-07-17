package heartbeat.service.report;

import heartbeat.controller.report.dto.request.BuildKiteSetting;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.request.ReportType;
import heartbeat.controller.report.dto.response.ReportMetricsError;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.controller.report.dto.response.ShareApiDetailsResponse;
import heartbeat.controller.report.dto.response.UuidResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.AsyncMetricsDataHandler;
import heartbeat.repository.FilePrefixType;
import heartbeat.repository.FileType;
import heartbeat.service.report.calculator.ReportGenerator;
import heartbeat.repository.FileRepository;
import heartbeat.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.function.BiConsumer;

import static java.util.Optional.ofNullable;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

	private final CSVFileGenerator csvFileGenerator;

	private final AsyncMetricsDataHandler asyncMetricsDataHandler;

	private final GenerateReporterService generateReporterService;

	private final ReportGenerator reportGenerator;

	private final FileRepository fileRepository;

	private static final String FILENAME_SEPARATOR = "-";

	public InputStreamResource exportCsv(ReportType reportDataType, String uuid, String startTime, String endTime) {
		String timeRangeAndTimeStamp = fileRepository.getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType.REPORT,
				uuid, startTime, endTime);
		if (timeRangeAndTimeStamp == null) {
			throw new NotFoundException("Failed to fetch CSV data due to CSV not found");
		}

		String csvTimestamp = timeRangeAndTimeStamp.split(FILENAME_SEPARATOR)[2];

		if (fileRepository.isExpired(System.currentTimeMillis(), Long.parseLong(csvTimestamp))) {
			throw new NotFoundException("Failed to fetch CSV data due to CSV not found");
		}
		return csvFileGenerator.getDataFromCSV(reportDataType, uuid, timeRangeAndTimeStamp);
	}

	public void generateReport(GenerateReportRequest request, String uuid) {
		List<MetricType> metricTypes = request.getMetricTypes();
		String timeRangeAndTimeStamp = request.getTimeRangeAndTimeStamp();
		asyncMetricsDataHandler.initializeMetricsDataCompletedInHandler(uuid, metricTypes, timeRangeAndTimeStamp);
		Map<MetricType, BiConsumer<String, GenerateReportRequest>> reportGeneratorMap = reportGenerator
			.getReportGenerator(generateReporterService);
		List<CompletableFuture<Void>> threadList = new ArrayList<>();
		for (MetricType metricType : metricTypes) {
			CompletableFuture<Void> metricTypeThread = CompletableFuture
				.runAsync(() -> reportGeneratorMap.get(metricType).accept(uuid, request));
			threadList.add(metricTypeThread);
		}

		CompletableFuture<Void> allFutures = CompletableFuture.allOf(threadList.toArray(new CompletableFuture[0]));
		allFutures.thenRun(() -> {
			ReportResponse reportResponse = generateReporterService.getComposedReportResponse(uuid,
					request.getCsvTimeStamp(),
					convertTimeStampToYYYYMMDD(request.getStartTime(), request.getTimezoneByZoneId()),
					convertTimeStampToYYYYMMDD(request.getEndTime(), request.getTimezoneByZoneId()));
			if (isNotGenerateMetricError(reportResponse.getReportMetricsError())) {
				generateReporterService.generateCSVForMetric(uuid, reportResponse, request.getTimeRangeAndTimeStamp());
			}
			asyncMetricsDataHandler.updateOverallMetricsCompletedInHandler(uuid, request.getTimeRangeAndTimeStamp());
		});
	}

	private String convertTimeStampToYYYYMMDD(String timeStamp, ZoneId timezone) {
		return TimeUtil.convertToUserSimpleISOFormat(Long.parseLong(timeStamp), timezone);
	}

	private boolean isNotGenerateMetricError(ReportMetricsError reportMetricsError) {
		return Objects.isNull(reportMetricsError.getBoardMetricsError())
				&& Objects.isNull(reportMetricsError.getSourceControlMetricsError())
				&& Objects.isNull(reportMetricsError.getPipelineMetricsError());
	}

	public ShareApiDetailsResponse getShareReportInfo(String uuid) {
		List<String> reportUrls;
		try {
			reportUrls = fileRepository.getFiles(FileType.REPORT, uuid)
				.stream()
				.map(it -> it.split(FILENAME_SEPARATOR))
				.filter(it -> it.length > 2)
				.map(it -> this.generateReportCallbackUrl(uuid, it[1], it[2]))
				.distinct()
				.toList();
		}
		catch (NotFoundException e) {
			log.error("Get share details result: failed, reportId: {}", uuid);
			throw new NotFoundException(String.format("Don't find the %s folder in the report files", uuid));
		}

		if (reportUrls.isEmpty()) {
			log.error("Get share details result: failed, reportId: {}", uuid);
			throw new NotFoundException(
					String.format("Don't get the data, please check the uuid: %s, maybe it's expired or error", uuid));
		}
		List<SavedRequestInfo> savedRequestInfoList = fileRepository.getFiles(FileType.CONFIGS, uuid)
			.stream()
			.map(it -> it.split(FILENAME_SEPARATOR))
			.map(it -> it[1] + FILENAME_SEPARATOR + it[2] + FILENAME_SEPARATOR + it[3])
			.map(it -> fileRepository.readFileByType(FileType.CONFIGS, uuid, it, SavedRequestInfo.class,
					FilePrefixType.USER_CONFIG_REPORT_PREFIX))
			.toList();
		List<String> metrics = savedRequestInfoList.stream()
			.map(SavedRequestInfo::getMetrics)
			.flatMap(Collection::stream)
			.distinct()
			.toList();
		List<String> pipelines = savedRequestInfoList.stream()
			.map(SavedRequestInfo::getPipelines)
			.flatMap(Collection::stream)
			.map(it -> String.format("%s/%s", it.getName(), it.getStep()))
			.distinct()
			.toList();
		return ShareApiDetailsResponse.builder().metrics(metrics).pipelines(pipelines).reportURLs(reportUrls).build();
	}

	public String generateReportCallbackUrl(String uuid, String startTime, String endTime) {
		return "/reports/" + uuid + "/detail?startTime=" + startTime + "&endTime=" + endTime;
	}

	public UuidResponse generateReportId() {
		return UuidResponse.builder().reportId(UUID.randomUUID().toString()).build();
	}

	public void saveRequestInfo(GenerateReportRequest request, String uuid) {
		SavedRequestInfo savedRequestInfo = SavedRequestInfo.builder()
			.metrics(request.getMetrics())
			.pipelines(ofNullable(request.getBuildKiteSetting()).map(BuildKiteSetting::getDeploymentEnvList)
				.orElse(List.of()))
			.build();
		fileRepository.createFileByType(FileType.CONFIGS, uuid, request.getTimeRangeAndTimeStamp(), savedRequestInfo,
				FilePrefixType.USER_CONFIG_REPORT_PREFIX);
	}

}
