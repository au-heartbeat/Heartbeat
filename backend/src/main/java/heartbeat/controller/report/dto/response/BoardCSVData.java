package heartbeat.controller.report.dto.response;

import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardCSVData {

	@CsvBindByName(column = "Issue key")
	private String issueKey;

	@CsvBindByName(column = "Summary")
	private String summary;

	@CsvBindByName(column = "Issue Type")
	private String issueType;

	@CsvBindByName(column = "Status")
	private String status;

	@CsvBindByName(column = "Story Points")
	private String storyPoints;

	@CsvBindByName(column = "assignee")
	private String assigneeName;

	@CsvBindByName(column = "Reporter")
	private String reporterName;

	@CsvBindByName(column = "Project Key")
	private String projectKey;

	@CsvBindByName(column = "Project Name")
	private String projectName;

	@CsvBindByName(column = "Priority")
	private String priorityName;

	@CsvBindByName(column = "Parent Summary")
	private String parentSummary;

	@CsvBindByName(column = "Sprint")
	private String sprint;

	@CsvBindByName(column = "Labels")
	private String labels;

	@CsvBindByName(column = "Cycle Time")
	private String cycleTime;

	@CsvBindByName(column = "Cycle Time / Story Points")
	private String totalCycleTimeDivideStoryPoints;

	@CsvBindByName(column = "Analysis Days")
	private String analysisDays;

	@CsvBindByName(column = "In Dev Days")
	private String inDevDays;

	@CsvBindByName(column = "Waiting Days")
	private String waitingDays;

	@CsvBindByName(column = "Testing Days")
	private String testingDays;

	@CsvBindByName(column = "Block Days")
	private String blockDays;

	@CsvBindByName(column = "Review Days")
	private String reviewDays;

}
