package heartbeat.service.report;

import heartbeat.repository.FileRepository;
import heartbeat.repository.FileType;
import heartbeat.service.report.scheduler.DeleteExpireCSVScheduler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DeleteExpireCSVSchedulerTest {

	@Mock
	FileRepository fileRepository;

	@InjectMocks
	private DeleteExpireCSVScheduler deleteExpireCSVScheduler;

	@Test
	void shouldTriggerBatchDeleteCSV() {

		assertDoesNotThrow(() -> deleteExpireCSVScheduler.triggerBatchDelete());
		verify(fileRepository, times(1)).removeExpiredFiles(eq(FileType.CSV), anyLong());
		verify(fileRepository, times(1)).removeExpiredFiles(eq(FileType.REPORT), anyLong());
		verify(fileRepository, times(1)).removeExpiredFiles(eq(FileType.ERROR), anyLong());
		verify(fileRepository, times(1)).removeExpiredFiles(eq(FileType.METRICS_DATA_COMPLETED), anyLong());
		verify(fileRepository, times(1)).removeExpiredFiles(eq(FileType.CONFIGS), anyLong());

	}

}
