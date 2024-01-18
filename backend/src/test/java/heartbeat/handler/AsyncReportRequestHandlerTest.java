package heartbeat.handler;

import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.util.IdUtil;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

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

	@AfterAll
	static void afterAll() {
		new File("./app/output").delete();
		new File("./app").delete();
	}

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






}
