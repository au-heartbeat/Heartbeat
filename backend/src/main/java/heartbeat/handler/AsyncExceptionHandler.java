package heartbeat.handler;

import com.google.gson.Gson;
import heartbeat.exception.BaseException;
import heartbeat.util.IdUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import static heartbeat.handler.FIleType.ERROR;
import static heartbeat.service.report.scheduler.DeleteExpireCSVScheduler.EXPORT_CSV_VALIDITY_TIME;

@Log4j2
@Component
@RequiredArgsConstructor
public class AsyncExceptionHandler extends AsyncReportDataHandler {

	private final Map<String, BaseException> exceptionMap = new ConcurrentHashMap<>();

	public void put(String reportId, BaseException e) {
		createDirToConvertData(ERROR);
		creatFileByType(ERROR, reportId, new Gson().toJson(e));
	}

	public BaseException get(String reportId) {
		return exceptionMap.get(reportId);
	}

	public BaseException remove(String reportId) {
		return exceptionMap.remove(reportId);
	}

	public void deleteExpireException(long currentTimeStamp) {
		long exportTime = currentTimeStamp - EXPORT_CSV_VALIDITY_TIME;
		Set<String> keys = exceptionMap.keySet()
			.stream()
			.filter(reportId -> Long.parseLong(IdUtil.getTimeStampFromReportId(reportId)) < exportTime)
			.collect(Collectors.toSet());
		exceptionMap.keySet().removeAll(keys);
	}

}
