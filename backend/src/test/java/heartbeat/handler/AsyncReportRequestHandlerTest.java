package heartbeat.handler;

import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.GenerateReportException;
import heartbeat.util.IdUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class AsyncReportRequestHandlerTest {

	public static final String APP_OUTPUT_REPORT = "./app/output/report";

	@InjectMocks
	AsyncReportRequestHandler asyncReportRequestHandler;

	@AfterEach
	void afterEach() {
		new File(APP_OUTPUT_REPORT).delete();
	}

	@InjectMocks
	AsyncMetricsDataHandler asyncMetricsDataHandler;

	@Test
	void shouldDeleteReportWhenReportIsExpire() throws IOException {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		String expireTime = Long.toString(currentTimeMillis - 1900000L);
		String unExpireFile = IdUtil.getBoardReportId(currentTime);
		String expireFile = IdUtil.getBoardReportId(expireTime);
		asyncReportRequestHandler.putReport(unExpireFile, ReportResponse.builder().build());
		asyncReportRequestHandler.putReport(expireFile, ReportResponse.builder().build());

		asyncReportRequestHandler.deleteExpireReport(currentTimeMillis);

		assertNull(asyncReportRequestHandler.getReport(expireFile));
		assertNotNull(asyncReportRequestHandler.getReport(unExpireFile));
		Files.deleteIfExists(Path.of(APP_OUTPUT_REPORT + "/" + unExpireFile));
		assertNull(asyncReportRequestHandler.getReport(unExpireFile));
	}

	@Test
	void shouldGetAsyncReportWhenPuttingReportIntoAsyncReportRequestHandler() throws IOException {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		String boardReportId = IdUtil.getBoardReportId(currentTime);

		asyncReportRequestHandler.putReport(boardReportId, ReportResponse.builder().build());

		assertNotNull(asyncReportRequestHandler.getReport(boardReportId));
		Files.deleteIfExists(Path.of(APP_OUTPUT_REPORT + "/" + boardReportId));
		assertNull(asyncReportRequestHandler.getReport(boardReportId));
	}

	@Test
	void shouldDeleteMetricsDataReadyWhenExpireIsExpire() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		String expireTime = Long.toString(currentTimeMillis - 1900000L);
		MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder().boardMetricsCompleted(false).build();
		asyncMetricsDataHandler.putMetricsDataCompleted(currentTime, metricsDataCompleted);
		asyncMetricsDataHandler.putMetricsDataCompleted(expireTime, metricsDataCompleted);

		asyncMetricsDataHandler.deleteExpireMetricsDataCompleted(currentTimeMillis);

		assertNull(asyncMetricsDataHandler.getMetricsDataCompleted(expireTime));
		assertNotNull(asyncMetricsDataHandler.getMetricsDataCompleted(currentTime));
	}

	@Test
	void shouldGetAsyncMetricsDataReadyWhenPuttingMetricsReadyIntoAsyncReportRequestHandler() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder().boardMetricsCompleted(false).build();
		asyncMetricsDataHandler.putMetricsDataCompleted(currentTime, metricsDataCompleted);

		assertNotNull(asyncMetricsDataHandler.getMetricsDataCompleted(currentTime));
	}

	@Test
	void shouldThrowGenerateReportExceptionWhenPreviousMetricsDataReadyIsNull() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);

		Exception exception = assertThrows(GenerateReportException.class,
				() -> asyncMetricsDataHandler.isReportReady(currentTime));
		assertEquals("Failed to locate the report using this report ID.", exception.getMessage());
	}

	@Test
	void shouldReturnFalseWhenExistFalseValue() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
			.boardMetricsCompleted(false)
			.sourceControlMetricsCompleted(false)
			.pipelineMetricsCompleted(null)
			.build();
		asyncMetricsDataHandler.putMetricsDataCompleted(currentTime, metricsDataCompleted);

		boolean reportReady = asyncMetricsDataHandler.isReportReady(currentTime);

		assertFalse(reportReady);
	}

	@Test
	void shouldReturnTrueWhenNotExistFalseValue() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
			.boardMetricsCompleted(true)
			.sourceControlMetricsCompleted(null)
			.pipelineMetricsCompleted(true)
			.build();
		asyncMetricsDataHandler.putMetricsDataCompleted(currentTime, metricsDataCompleted);

		boolean reportReady = asyncMetricsDataHandler.isReportReady(currentTime);

		assertTrue(reportReady);
	}
}
