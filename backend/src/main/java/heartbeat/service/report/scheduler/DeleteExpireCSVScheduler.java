package heartbeat.service.report.scheduler;

import heartbeat.service.report.GenerateReporterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Log4j2
@Component
@RequiredArgsConstructor
public class DeleteExpireCSVScheduler {

	public static final int DELETE_INTERVAL_IN_MINUTES = 5;

	private final GenerateReporterService generateReporterService;

	@Scheduled(fixedRate = DELETE_INTERVAL_IN_MINUTES, timeUnit = TimeUnit.MINUTES)
	public void triggerBatchDelete() {
		long currentTimeStamp = System.currentTimeMillis();
		log.info("start delete expire csv,current time stamp:{}", currentTimeStamp);
		generateReporterService.deleteExpireCSV(currentTimeStamp);
	}

}
