package heartbeat.handler;

import com.google.gson.Gson;
import heartbeat.controller.report.dto.response.ReportResponse;
import heartbeat.exception.NotFoundException;
import heartbeat.handler.base.AsyncDataBaseHandler;
import heartbeat.handler.base.FIleType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import static heartbeat.handler.base.FIleType.REPORT;

@Component
@RequiredArgsConstructor
public class AsyncReportRequestHandler extends AsyncDataBaseHandler {

	private static final String OUTPUT_FILE_PATH = "./app/output/";

	private static final String SLASH = "/";

	public void putReport(String reportId, ReportResponse e) {
		createFileByType(REPORT, reportId, new Gson().toJson(e));
	}

	public ReportResponse getReport(String reportId) {
		Path targetPath = new File(OUTPUT_FILE_PATH).toPath().normalize();
		String fileName = targetPath + SLASH + REPORT.getPath() + reportId;
		return readFileByType(new File(fileName), REPORT, reportId, ReportResponse.class);
	}

	public void deleteExpireReportFile(long currentTimeStamp, File directory) {
		deleteExpireFileByType(REPORT, currentTimeStamp, directory);
	}

	public List<String> getReportFiles(String uuid) {
		Path targetPath = new File(OUTPUT_FILE_PATH).toPath().normalize();
		String fileName = targetPath + SLASH + REPORT.getPath() + uuid;
		File folder = new File(fileName);

		if (folder.exists() && folder.isDirectory()) {
			return Arrays.stream(Objects.requireNonNull(folder.listFiles())).map(File::getName).toList();
		}
		else {
			throw new NotFoundException(String.format("Don't find the %s folder in the report files", uuid));
		}
	}

}
