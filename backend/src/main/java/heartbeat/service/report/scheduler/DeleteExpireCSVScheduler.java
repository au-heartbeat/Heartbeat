package heartbeat.service.report.scheduler;

import heartbeat.repository.FileType;
import heartbeat.repository.FileRepository;
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

	private final FileRepository fileRepository;

	@Scheduled(fixedRate = DELETE_INTERVAL_IN_MINUTES, timeUnit = TimeUnit.MINUTES)
	public void triggerBatchDelete() {
		long currentTimeStamp = System.currentTimeMillis();
		log.info("Start to delete expired files, currentTimeStamp: {}, expired days:{}", currentTimeStamp,
				fileRepository.expiredDays);
		fileRepository.removeExpiredFiles(FileType.CSV, currentTimeStamp);
		fileRepository.removeExpiredFiles(FileType.REPORT, currentTimeStamp);
		fileRepository.removeExpiredFiles(FileType.ERROR, currentTimeStamp);
		fileRepository.removeExpiredFiles(FileType.METRICS_DATA_COMPLETED, currentTimeStamp);
		fileRepository.removeExpiredFiles(FileType.REQUEST_INFO, currentTimeStamp);
	}

}
