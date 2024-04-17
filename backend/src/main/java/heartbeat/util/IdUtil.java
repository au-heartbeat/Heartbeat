package heartbeat.util;

public interface IdUtil {

	String BOARD_REPORT_PREFIX = "board-";

	String PIPELINE_REPORT_PREFIX = "pipeline-";

	String SOURCE_CONTROL_PREFIX = "sourceControl-";

	String DATA_COMPLETED_PREFIX = "dataCompleted-";

	static String getBoardReportFileId(String timeRangeTimeStamp) {
		return BOARD_REPORT_PREFIX + timeRangeTimeStamp;
	}

	static String getPipelineReportFileId(String timeRangeTimeStamp) {
		return PIPELINE_REPORT_PREFIX + timeRangeTimeStamp;
	}

	static String getSourceControlReportFileId(String timeRangeTimeStamp) {
		return SOURCE_CONTROL_PREFIX + timeRangeTimeStamp;
	}

	static String getDataCompletedPrefix(String timeRangeTimeStamp) {
		return DATA_COMPLETED_PREFIX + timeRangeTimeStamp;
	}

}
