package heartbeat.handler;

import com.google.gson.Gson;
import heartbeat.controller.report.dto.request.MetricType;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.exception.GenerateReportException;
import heartbeat.repository.FilePrefixType;
import heartbeat.repository.FileRepository;
import heartbeat.repository.FileType;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static heartbeat.controller.report.dto.request.MetricType.BOARD;
import static heartbeat.controller.report.dto.request.MetricType.DORA;
import static heartbeat.repository.FileType.METRICS_DATA_COMPLETED;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AsyncMetricsDataHandlerTest {

	public static final String TEST_UUID = "test-uuid";

	@Captor
	ArgumentCaptor<MetricsDataCompleted> responseArgumentCaptor;

	@Mock
	FileRepository fileRepository;

	@InjectMocks
	AsyncMetricsDataHandler asyncMetricsDataHandler;

	@Nested
	class UpdateMetricsDataCompletedInHandler {

		@Test
		void shouldThrowGenerateReportExceptionWhenPreviousMetricsStatusIsNull() {
			long currentTimeMillis = System.currentTimeMillis();
			String currentTime = Long.toString(currentTimeMillis);

			GenerateReportException exception = assertThrows(GenerateReportException.class,
					() -> asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(TEST_UUID, currentTime, BOARD,
							false));

			assertEquals("Failed to update metrics data completed through this timestamp.", exception.getMessage());
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
		}

		@Test
		void shouldUpdateBoardMetricDataWhenPreviousMetricsStatusIsNotNullAndMetricTypeIsBoard() {
			long currentTimeMillis = System.currentTimeMillis();
			String currentTime = Long.toString(currentTimeMillis);
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.build();
			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX))
				.thenReturn(metricsDataCompleted);

			asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(TEST_UUID, currentTime, BOARD, true);

			assertTrue(metricsDataCompleted.boardMetricsCompleted());
			assertNull(metricsDataCompleted.doraMetricsCompleted());
			assertTrue(metricsDataCompleted.isSuccessfulCreateCsvFile());
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			verify(fileRepository, times(1)).createFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					metricsDataCompleted, FilePrefixType.DATA_COMPLETED_PREFIX);
		}

		@Test
		void shouldUpdateDoraMetricDataWhenPreviousMetricsStatusIsNotNullAndMetricTypeIsDora() {
			long currentTimeMillis = System.currentTimeMillis();
			String currentTime = Long.toString(currentTimeMillis);
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
				.doraMetricsCompleted(false)
				.build();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX))
				.thenReturn(metricsDataCompleted);

			asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(TEST_UUID, currentTime, DORA, true);

			assertNull(metricsDataCompleted.boardMetricsCompleted());
			assertTrue(metricsDataCompleted.doraMetricsCompleted());
			assertTrue(metricsDataCompleted.isSuccessfulCreateCsvFile());
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			verify(fileRepository, times(1)).createFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					metricsDataCompleted, FilePrefixType.DATA_COMPLETED_PREFIX);

		}

		@Test
		void shouldUpdateDoraMetricDataWhenMetricIsDoraAndCreateCsvFileUnsuccessfully() throws IOException {
			long currentTimeMillis = System.currentTimeMillis();
			String currentTime = Long.toString(currentTimeMillis);
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
				.doraMetricsCompleted(false)
				.isSuccessfulCreateCsvFile(false)
				.build();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX))
				.thenReturn(metricsDataCompleted);

			asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(TEST_UUID, currentTime, BOARD, false);

			assertTrue(metricsDataCompleted.boardMetricsCompleted());
			assertFalse(metricsDataCompleted.doraMetricsCompleted());
			assertFalse(metricsDataCompleted.isSuccessfulCreateCsvFile());
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			verify(fileRepository, times(1)).createFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					metricsDataCompleted, FilePrefixType.DATA_COMPLETED_PREFIX);
		}

	}

	@Nested
	class UpdateAllMetricsCompletedInHandler {

		@Test
		void shouldOverallMetricsDataSuccessfully() {
			long currentTimeMillis = System.currentTimeMillis();
			String currentTime = Long.toString(currentTimeMillis);
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder().build();

			when(fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX))
				.thenReturn(metricsDataCompleted);

			asyncMetricsDataHandler.updateOverallMetricsCompletedInHandler(TEST_UUID, currentTime);

			assertTrue(metricsDataCompleted.overallMetricCompleted());
			verify(fileRepository, times(1)).readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			verify(fileRepository, times(1)).createFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					metricsDataCompleted, FilePrefixType.DATA_COMPLETED_PREFIX);

		}

		@Test
		void shouldThrowGenerateReportExceptionGivenPreviousMetricsCompletedIsNull() {
			long currentTimeMillis = System.currentTimeMillis();
			String currentTime = Long.toString(currentTimeMillis);

			GenerateReportException exception = assertThrows(GenerateReportException.class,
					() -> asyncMetricsDataHandler.updateOverallMetricsCompletedInHandler(TEST_UUID, currentTime));

			assertEquals("Failed to update metrics data completed through this timestamp.", exception.getMessage());
		}

	}

	// for test which function: read and write the same file at the same time, so I use
	// the real object
	@Nested
	class UpdateAllMetricsCompletedInHandlerAtTheSameTime {

		FileRepository fileRepository = new FileRepository(new Gson());

		AsyncMetricsDataHandler asyncMetricsDataHandler = new AsyncMetricsDataHandler(fileRepository);

		// The test should be moved to integration test next.
		@RepeatedTest(100)
		@SuppressWarnings("unchecked")
		void shouldUpdateAllMetricDataAtTheSameTimeWhenPreviousMetricsStatusIsNotNull() throws IOException {
			long currentTimeMillis = System.currentTimeMillis();
			String currentTime = Long.toString(currentTimeMillis);
			List<Integer> sleepTime = new ArrayList<>();
			for (int i = 0; i < 3; i++) {
				sleepTime.add(new Random().nextInt(100));
			}
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
				.boardMetricsCompleted(false)
				.doraMetricsCompleted(false)
				.overallMetricCompleted(false)
				.build();

			fileRepository.createFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID, currentTime,
					metricsDataCompleted, FilePrefixType.DATA_COMPLETED_PREFIX);

			List<CompletableFuture<Void>> threadList = new ArrayList<>();

			threadList.add(CompletableFuture.runAsync(() -> {
				try {
					TimeUnit.MILLISECONDS.sleep(sleepTime.get(0)); // NOSONAR
				}
				catch (InterruptedException ignored) {
				}
				asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(TEST_UUID, currentTime, BOARD, true);
			}));
			threadList.add(CompletableFuture.runAsync(() -> {
				try {
					TimeUnit.MILLISECONDS.sleep(sleepTime.get(1)); // NOSONAR
				}
				catch (InterruptedException ignored) {
				}
				asyncMetricsDataHandler.updateMetricsDataCompletedInHandler(TEST_UUID, currentTime, DORA, true);
			}));
			threadList.add(CompletableFuture.runAsync(() -> {
				try {
					TimeUnit.MILLISECONDS.sleep(sleepTime.get(2)); // NOSONAR
				}
				catch (InterruptedException ignored) {
				}
				asyncMetricsDataHandler.updateOverallMetricsCompletedInHandler(TEST_UUID, currentTime);
			}));

			for (CompletableFuture<Void> thread : threadList) {
				thread.join();
			}

			MetricsDataCompleted completed = fileRepository.readFileByType(FileType.METRICS_DATA_COMPLETED, TEST_UUID,
					currentTime, MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			assertTrue(completed.boardMetricsCompleted());
			assertTrue(completed.doraMetricsCompleted());
			assertTrue(completed.allMetricsCompleted());
		}

	}

	@Nested
	class InitializeMetricsDataCompletedInHandler {

		@Test
		void shouldCreateNewFileWhenFileDontExist() {
			String timeRangeAndTimeStamp = "test-time-range";
			List<MetricType> metricTypes = List.of(BOARD, DORA);
			when(fileRepository.readFileByType(METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX))
				.thenReturn(null);

			asyncMetricsDataHandler.initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			verify(fileRepository, times(1)).readFileByType(METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			verify(fileRepository, times(1)).createFileByType(eq(METRICS_DATA_COMPLETED), eq(TEST_UUID),
					eq(timeRangeAndTimeStamp), responseArgumentCaptor.capture(),
					eq(FilePrefixType.DATA_COMPLETED_PREFIX));

			MetricsDataCompleted metricsDataCompletedCapture = responseArgumentCaptor.getValue();
			assertFalse(metricsDataCompletedCapture.boardMetricsCompleted());
			assertFalse(metricsDataCompletedCapture.doraMetricsCompleted());
			assertFalse(metricsDataCompletedCapture.overallMetricCompleted());
			assertFalse(metricsDataCompletedCapture.isSuccessfulCreateCsvFile());
		}

		@Test
		void shouldCreateNewFileWhenFileDontExistAndNoMetricTypes() {
			String timeRangeAndTimeStamp = "test-time-range";
			List<MetricType> metricTypes = List.of();
			when(fileRepository.readFileByType(METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX))
				.thenReturn(null);

			asyncMetricsDataHandler.initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			verify(fileRepository, times(1)).readFileByType(METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			verify(fileRepository, times(1)).createFileByType(eq(METRICS_DATA_COMPLETED), eq(TEST_UUID),
					eq(timeRangeAndTimeStamp), responseArgumentCaptor.capture(),
					eq(FilePrefixType.DATA_COMPLETED_PREFIX));

			MetricsDataCompleted metricsDataCompletedCapture = responseArgumentCaptor.getValue();
			assertNull(metricsDataCompletedCapture.boardMetricsCompleted());
			assertNull(metricsDataCompletedCapture.doraMetricsCompleted());
			assertFalse(metricsDataCompletedCapture.overallMetricCompleted());
			assertFalse(metricsDataCompletedCapture.isSuccessfulCreateCsvFile());
		}

		@Test
		void shouldCreateNewFileWhenFileExistAndNoMetricTypes() {
			String timeRangeAndTimeStamp = "test-time-range";
			List<MetricType> metricTypes = List.of();
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
				.boardMetricsCompleted(true)
				.doraMetricsCompleted(true)
				.build();
			when(fileRepository.readFileByType(METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX))
				.thenReturn(metricsDataCompleted);

			asyncMetricsDataHandler.initializeMetricsDataCompletedInHandler(TEST_UUID, metricTypes,
					timeRangeAndTimeStamp);

			verify(fileRepository, times(1)).readFileByType(METRICS_DATA_COMPLETED, TEST_UUID, timeRangeAndTimeStamp,
					MetricsDataCompleted.class, FilePrefixType.DATA_COMPLETED_PREFIX);
			verify(fileRepository, times(1)).createFileByType(eq(METRICS_DATA_COMPLETED), eq(TEST_UUID),
					eq(timeRangeAndTimeStamp), responseArgumentCaptor.capture(),
					eq(FilePrefixType.DATA_COMPLETED_PREFIX));

			MetricsDataCompleted metricsDataCompletedCapture = responseArgumentCaptor.getValue();
			assertTrue(metricsDataCompletedCapture.boardMetricsCompleted());
			assertTrue(metricsDataCompletedCapture.doraMetricsCompleted());
			assertFalse(metricsDataCompletedCapture.overallMetricCompleted());
			assertFalse(metricsDataCompletedCapture.isSuccessfulCreateCsvFile());
		}

	}

}
