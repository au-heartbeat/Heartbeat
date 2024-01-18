package heartbeat.handler;

import com.google.gson.Gson;
import heartbeat.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import static heartbeat.handler.FIleType.ERROR;

@Log4j2
@Component
@RequiredArgsConstructor
public class AsyncExceptionHandler extends AsyncReportDataHandler {

	public void put(String reportId, BaseException e) {
		createDirToConvertData(ERROR);
		creatFileByType(ERROR, reportId, new Gson().toJson(e));
	}

	public BaseException get(String reportId) {
		return readFileByType(ERROR, reportId, AsyncExceptionDTO.class);
	}

	public BaseException remove(String reportId) {
		return readAndRemoveFileByType(ERROR, reportId, AsyncExceptionDTO.class);
	}

	public void deleteExpireException(long currentTimeStamp) {
		deleteExpireFileByType(ERROR, currentTimeStamp);
	}

}
