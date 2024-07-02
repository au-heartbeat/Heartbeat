package heartbeat.util;

public interface IdUtil {

	String BOARD_REPORT_PREFIX = "board-";

	String PIPELINE_REPORT_PREFIX = "pipeline-";

	String SOURCE_CONTROL_PREFIX = "sourceControl-";

	String DATA_COMPLETED_PREFIX = "dataCompleted-";

	String SLASH = "/";

	static String getBoardReportFileId(String uuid, String timeRangeAndTimeStamp) {
		return uuid + SLASH + BOARD_REPORT_PREFIX + timeRangeAndTimeStamp;
	}

	static String getPipelineReportFileId(String uuid, String timeRangeAndTimeStamp) {
		return uuid + SLASH + PIPELINE_REPORT_PREFIX + timeRangeAndTimeStamp;
	}

	static String getSourceControlReportFileId(String uuid, String timeRangeAndTimeStamp) {
		return uuid + SLASH + SOURCE_CONTROL_PREFIX + timeRangeAndTimeStamp;
	}

	static String getDataCompletedPrefix(String uuid, String timeRangeAndTimeStamp) {
		return uuid + SLASH + DATA_COMPLETED_PREFIX + timeRangeAndTimeStamp;
	}

}
