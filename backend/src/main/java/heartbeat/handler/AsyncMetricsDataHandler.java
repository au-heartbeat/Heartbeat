package heartbeat.handler;

import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.exception.GenerateReportException;
import heartbeat.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.Synchronized;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

import static heartbeat.repository.FilePrefixType.DATA_COMPLETED_PREFIX;
import static heartbeat.repository.FileType.METRICS_DATA_COMPLETED;
import static heartbeat.controller.report.dto.request.MetricType.BOARD;
import static heartbeat.controller.report.dto.request.MetricType.DORA;

@Log4j2
@Component
@RequiredArgsConstructor
public class AsyncMetricsDataHandler {

	private static final String GENERATE_REPORT_ERROR = "Failed to update metrics data completed through this timestamp.";

	private final Object readWriteLock = new Object();

	private final FileRepository fileRepository;

	@Synchronized("readWriteLock")
	public void updateMetricsDataCompletedInHandler(String uuid, String fileName, MetricType metricType,
			boolean isCreateCsvSuccess) {
		MetricsDataCompleted previousMetricsCompleted = fileRepository.readFileByType(METRICS_DATA_COMPLETED, uuid,
				fileName, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
		if (previousMetricsCompleted == null) {
			String filename = fileRepository.getFileName(METRICS_DATA_COMPLETED, uuid, fileName);
			log.error(GENERATE_REPORT_ERROR + "; filename: " + filename);
			throw new GenerateReportException(GENERATE_REPORT_ERROR);
		}
		if (isCreateCsvSuccess) {
			previousMetricsCompleted.setIsSuccessfulCreateCsvFile(true);
		}
		if (metricType == BOARD) {
			previousMetricsCompleted.setBoardMetricsCompleted(true);
		}
		else {
			previousMetricsCompleted.setDoraMetricsCompleted(true);
		}
		fileRepository.createFileByType(METRICS_DATA_COMPLETED, uuid, fileName, previousMetricsCompleted,
				DATA_COMPLETED_PREFIX);
	}

	@Synchronized("readWriteLock")
	public void updateOverallMetricsCompletedInHandler(String uuid, String timeRangeAndStamp) {
		MetricsDataCompleted previousMetricsCompleted = fileRepository.readFileByType(METRICS_DATA_COMPLETED, uuid,
				timeRangeAndStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
		if (previousMetricsCompleted == null) {
			String fileName = fileRepository.getFileName(METRICS_DATA_COMPLETED, uuid, timeRangeAndStamp);
			log.error(GENERATE_REPORT_ERROR + "; filename: " + fileName);
			throw new GenerateReportException(GENERATE_REPORT_ERROR);
		}
		previousMetricsCompleted.setOverallMetricCompleted(true);
		fileRepository.createFileByType(METRICS_DATA_COMPLETED, uuid, timeRangeAndStamp, previousMetricsCompleted,
				DATA_COMPLETED_PREFIX);
	}

	public void initializeMetricsDataCompletedInHandler(String uuid, List<MetricType> metricTypes,
			String timeRangeAndTimeStamp) {
		MetricsDataCompleted previousMetricsDataCompleted = fileRepository.readFileByType(METRICS_DATA_COMPLETED, uuid,
				timeRangeAndTimeStamp, MetricsDataCompleted.class, DATA_COMPLETED_PREFIX);
		Boolean initializeBoardMetricsCompleted = null;
		Boolean initializeDoraMetricsCompleted = null;
		if (!Objects.isNull(previousMetricsDataCompleted)) {
			initializeBoardMetricsCompleted = previousMetricsDataCompleted.boardMetricsCompleted();
			initializeDoraMetricsCompleted = previousMetricsDataCompleted.doraMetricsCompleted();
		}
		fileRepository
			.createFileByType(METRICS_DATA_COMPLETED, uuid, timeRangeAndTimeStamp, MetricsDataCompleted.builder()
				.boardMetricsCompleted(metricTypes.contains(BOARD) ? Boolean.FALSE : initializeBoardMetricsCompleted)
				.doraMetricsCompleted(metricTypes.contains(DORA) ? Boolean.FALSE : initializeDoraMetricsCompleted)
				.overallMetricCompleted(Boolean.FALSE)
				.isSuccessfulCreateCsvFile(Boolean.FALSE)
				.build(), DATA_COMPLETED_PREFIX);
	}

}
