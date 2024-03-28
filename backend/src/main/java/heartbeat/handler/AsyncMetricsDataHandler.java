package heartbeat.handler;

import com.google.gson.Gson;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.exception.GenerateReportException;
import heartbeat.handler.base.AsyncDataBaseHandler;
import lombok.RequiredArgsConstructor;
import lombok.Synchronized;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.File;

import static heartbeat.handler.base.FIleType.METRICS_DATA_COMPLETED;

@Log4j2
@Component
@RequiredArgsConstructor
public class AsyncMetricsDataHandler extends AsyncDataBaseHandler {

	private final static String generateReportError = "Failed to update metrics data completed through this timestamp.";

	public void putMetricsDataCompleted(String timeStamp, MetricsDataCompleted metricsDataCompleted) {
		try {
			acquireLock(METRICS_DATA_COMPLETED, timeStamp);
			createFileByType(METRICS_DATA_COMPLETED, timeStamp, new Gson().toJson(metricsDataCompleted));
		}
		finally {
			unLock(METRICS_DATA_COMPLETED, timeStamp);
		}
	}

	public MetricsDataCompleted getMetricsDataCompleted(String timeStamp) {
		return readFileByType(METRICS_DATA_COMPLETED, timeStamp, MetricsDataCompleted.class);
	}

	public void deleteExpireMetricsDataCompletedFile(long currentTimeStamp, File directory) {
		deleteExpireFileByType(METRICS_DATA_COMPLETED, currentTimeStamp, directory);
	}

	@Synchronized
	public void updateMetricsDataCompletedInHandler(String metricDataFileId, MetricType metricType) {
		MetricsDataCompleted previousMetricsCompleted = getMetricsDataCompleted(metricDataFileId);
		if (previousMetricsCompleted == null) {
			log.error(generateReportError);
			throw new GenerateReportException(generateReportError);
		}
		switch (metricType) {
			case BOARD -> previousMetricsCompleted.setBoardMetricsCompleted(true);
			case DORA -> previousMetricsCompleted.setDoraMetricsCompleted(true);
			default -> {
			}
		}
		putMetricsDataCompleted(metricDataFileId, previousMetricsCompleted);
	}

	public void updateAllMetricsCompletedInHandler(String metricDataFileId) {
		MetricsDataCompleted previousMetricsCompleted = getMetricsDataCompleted(metricDataFileId);
		if (previousMetricsCompleted == null) {
			log.error(generateReportError);
			throw new GenerateReportException(generateReportError);
		}
		previousMetricsCompleted.setAllMetricsCompleted(true);
		putMetricsDataCompleted(metricDataFileId, previousMetricsCompleted);
	}

}
