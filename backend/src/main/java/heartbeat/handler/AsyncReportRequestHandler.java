package heartbeat.handler;

import com.google.gson.Gson;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.handler.base.AsyncDataBaseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.io.File;

import static heartbeat.handler.base.FIleType.REPORT;

@Log4j2
@Component
@RequiredArgsConstructor
public class AsyncReportRequestHandler extends AsyncDataBaseHandler {

	public void putReport(String reportId, ReportResponse e) {
		creatFileByType(REPORT, reportId, new Gson().toJson(e));
	}

	public ReportResponse getReport(String reportId) {
		return readFileByType(REPORT, reportId, ReportResponse.class);
	}

	public void deleteExpireReport(long currentTimeStamp, File directory) {
		deleteExpireFileByType(REPORT, currentTimeStamp, directory);
	}

}
