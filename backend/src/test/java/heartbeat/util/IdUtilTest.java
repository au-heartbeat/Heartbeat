package heartbeat.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class IdUtilTest {

	public static final String TEST_UUID = "test-uuid";

	@Test
	void shouldReturnBoardReportId() {
		String timeStamp = "121322545121";
		String expected = "test-uuid/board-121322545121";

		String boardReportId = IdUtil.getBoardReportFileId(TEST_UUID, timeStamp);

		Assertions.assertEquals(expected, boardReportId);
	}

	@Test
	void shouldReturnPipelineReportId() {
		String timeStamp = "121322545121";
		String expected = "test-uuid/pipeline-121322545121";

		String pipelineReportId = IdUtil.getPipelineReportFileId(TEST_UUID, timeStamp);

		Assertions.assertEquals(expected, pipelineReportId);
	}

	@Test
	void shouldReturnSourceControlReportId() {
		String timeStamp = "121322545121";
		String expected = "test-uuid/sourceControl-121322545121";

		String sourceControlReportId = IdUtil.getSourceControlReportFileId(TEST_UUID, timeStamp);

		Assertions.assertEquals(expected, sourceControlReportId);
	}

}
