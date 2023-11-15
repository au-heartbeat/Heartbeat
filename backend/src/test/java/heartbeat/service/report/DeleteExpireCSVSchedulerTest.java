package heartbeat.service.report;

import heartbeat.service.report.scheduler.DeleteExpireCSVScheduler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class DeleteExpireCSVSchedulerTest {

	@InjectMocks
	private DeleteExpireCSVScheduler deleteExpireCSVScheduler;

	@Mock
	private GenerateReporterService generateReporterService;

	@Test
	public void shouldTriggerBatchDeleteCSV() {

		Mockito.doAnswer(invocation -> null).when(generateReporterService).deleteExpireCSV(any());

		deleteExpireCSVScheduler.triggerBatchDelete();
	}

}
