package heartbeat.service.report;

import com.opencsv.CSVWriter;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.BoardCSVData;
import heartbeat.controller.report.dto.response.LeadTimeInfo;
import heartbeat.controller.report.dto.response.PipelineCSVInfo;
import heartbeat.exception.FileIOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Component
@Log4j2
public class CSVFileGenerator {

	private static final String FORMAT_2_DECIMALS = "0.00";

	private static InputStreamResource readStringFromCsvFile(String fileName) {
		try {
			InputStream inputStream = new FileInputStream(fileName);
			InputStreamResource resource = new InputStreamResource(inputStream);

			return resource;
		}
		catch (IOException e) {
			log.error("Failed to read file", e);
			throw new FileIOException(e);
		}
	}

	public void convertPipelineDataToCSV(List<PipelineCSVInfo> leadTimeData, String csvTimeStamp) {
		log.info("Start to create csv directory");
		boolean created = createCsvDirectory();
		String message = created ? "Successfully create csv directory" : "CSV directory is already exist";
		log.info(message);

		String fileName = CSVFileNameEnum.PIPELINE.getValue() + "-" + csvTimeStamp + ".csv";
		File file = new File(fileName);

		try (CSVWriter csvWriter = new CSVWriter(new FileWriter(file))) {
			String[] headers = { "Pipeline Name", "Pipeline Step", "Build Number", "Committer",
					"First Code Committed Time In PR", "Code Committed Time", "PR Created Time", "PR Merged Time",
					"Deployment Completed Time", "Total Lead Time (HH:mm:ss)",
					"Time from PR Created to PR Merged (HH:mm:ss)",
					"Time from PR Merged to Deployment Completed (HH:mm:ss)", "Status" };

			csvWriter.writeNext(headers);

			for (PipelineCSVInfo csvInfo : leadTimeData) {
				String committerName = null;
				String commitDate = null;
				String pipelineName = csvInfo.getPipeLineName();
				String stepName = csvInfo.getStepName();
				String buildNumber = String.valueOf(csvInfo.getBuildInfo().getNumber());
				String state = csvInfo.getDeployInfo().getState();
				if (csvInfo.getCommitInfo() != null) {
					committerName = csvInfo.getCommitInfo().getCommit().getCommitter().getName();
					commitDate = csvInfo.getCommitInfo().getCommit().getCommitter().getDate();
				}

				LeadTimeInfo leadTimeInfo = csvInfo.getLeadTimeInfo();
				String firstCommitTimeInPr = leadTimeInfo.getFirstCommitTimeInPr();
				String prCreatedTime = leadTimeInfo.getPrCreatedTime();
				String prMergedTime = leadTimeInfo.getPrMergedTime();
				String jobFinishTime = leadTimeInfo.getJobFinishTime();
				String totalTime = leadTimeInfo.getTotalTime();
				String prDelayTime = leadTimeInfo.getPrDelayTime();
				String pipelineDelayTime = leadTimeInfo.getPipelineDelayTime();

				String[] rowData = { pipelineName, stepName, buildNumber, committerName, firstCommitTimeInPr,
						commitDate, prCreatedTime, prMergedTime, jobFinishTime, totalTime, prDelayTime,
						pipelineDelayTime, state };

				csvWriter.writeNext(rowData);
			}
		}
		catch (IOException e) {
			log.error("Failed to write file", e);
			throw new FileIOException(e);
		}
	}

	public InputStreamResource getDataFromCSV(String dataType, long csvTimeStamp) {
		return switch (dataType) {
			// todo: add board case
			case "pipeline" -> readStringFromCsvFile(CSVFileNameEnum.PIPELINE.getValue() + "-" + csvTimeStamp + ".csv");
			case "board" -> readStringFromCsvFile(CSVFileNameEnum.BOARD.getValue() + "-" + csvTimeStamp + ".csv");
			default -> new InputStreamResource(new ByteArrayInputStream("".getBytes()));
		};
	}

	private boolean createCsvDirectory() {
		String directoryPath = "./csv";
		File directory = new File(directoryPath);
		return directory.mkdirs();
	}

	public void convertBoardDataToCSV(List<JiraCardDTO> cardDTOList, List<BoardCSVConfig> fields, String csvTimeStamp) {
		log.info("Start to create board csv directory");
		boolean created = createCsvDirectory();
		String message = created ? "Successfully create csv directory" : "CSV directory is already exist";
		log.info(message);

		String fileName = CSVFileNameEnum.BOARD.getValue() + "-" + csvTimeStamp + ".csv";
		try (CSVWriter writer = new CSVWriter(new FileWriter(fileName))) {
			String[] header = getHeader(fields);

			writer.writeNext(header);
			

			HeaderColumnNameMappingStrategy<BoardCSVData> mappingStrategy = new HeaderColumnNameMappingStrategy<>();
			mappingStrategy.setType(BoardCSVData.class);
			mappingStrategy.setColumnOrderOnWrite(new ClassFieldOrderComparator(header));

			List<BoardCSVData> boardCSVDataList = new ArrayList<>();

			for (JiraCardDTO cardDTO : cardDTOList) {
				BoardCSVData boardCSVData = extractCSVData(cardDTO);
				boardCSVDataList.add(boardCSVData);
			}

			StatefulBeanToCsv<BoardCSVData> beanToCsv = new StatefulBeanToCsvBuilder<BoardCSVData>(writer)
				.withQuotechar(CSVWriter.NO_QUOTE_CHARACTER)
				.withMappingStrategy(mappingStrategy)
				.build();
			beanToCsv.write(boardCSVDataList);
		}
		catch (IOException e) {
			log.error("Failed to write file", e);
			throw new FileIOException(e);
		}
		// TODO 规范异常处理
		catch (CsvRequiredFieldEmptyException | CsvDataTypeMismatchException e) {
			throw new RuntimeException(e);
		}
	}

	private BoardCSVData extractCSVData(JiraCardDTO cardDTO) {
		BoardCSVData boardCSVData = BoardCSVData.builder().build();
		DecimalFormat decimalFormat = new DecimalFormat(FORMAT_2_DECIMALS);
		if (cardDTO.getBaseInfo() != null) {
			boardCSVData.setIssueKey(cardDTO.getBaseInfo().getKey());
			boardCSVData.setSummary(cardDTO.getBaseInfo().getFields().getSummary());
			boardCSVData.setIssueType(cardDTO.getBaseInfo().getFields().getIssuetype().getName());
			boardCSVData.setStatus(cardDTO.getBaseInfo().getFields().getStatus().getDisplayName());
			boardCSVData.setStoryPoints(String.valueOf(cardDTO.getBaseInfo().getFields().getStoryPoints()));
			if (cardDTO.getBaseInfo().getFields().getAssignee() != null) {
				boardCSVData.setAssigneeName(cardDTO.getBaseInfo().getFields().getAssignee().getDisplayName());
			}
			if (cardDTO.getBaseInfo().getFields().getReporter() != null) {
				boardCSVData.setReporterName(cardDTO.getBaseInfo().getFields().getReporter().getDisplayName());
			}

			boardCSVData.setProjectKey(cardDTO.getBaseInfo().getFields().getProject().getKey());
			boardCSVData.setProjectName(cardDTO.getBaseInfo().getFields().getProject().getName());
			boardCSVData.setPriorityName(cardDTO.getBaseInfo().getFields().getPriority().getDisplayName());

			boardCSVData.setParentSummary(cardDTO.getBaseInfo().getFields().getParent() != null
					? cardDTO.getBaseInfo().getFields().getParent().getDisplayName() : "");

			boardCSVData.setLabels(cardDTO.getBaseInfo().getFields().getLabels().toString());

			boardCSVData.setTotalCycleTimeDivideStoryPoints(cardDTO.getTotalCycleTimeDivideStoryPoints());

			if (cardDTO.getCardCycleTime() != null) {
				boardCSVData.setCycleTime(decimalFormat.format(cardDTO.getCardCycleTime().getTotal()));
				boardCSVData.setAnalysisDays(decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getAnalyse()));
				boardCSVData.setInDevDays(decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getDevelopment()));
				boardCSVData.setWaitingDays(decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getWaiting()));
				boardCSVData.setTestingDays(decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getTesting()));
				boardCSVData.setBlockDays(decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getBlocked()));
				boardCSVData.setReviewDays(decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getReview()));
			}
		}
		return boardCSVData;
	}

	private String[] getHeader(List<BoardCSVConfig> fields) {
		List<String> headers = new ArrayList<>();
		fields.forEach((field) -> {
			headers.add(field.getLabel().toUpperCase());
		});
		return headers.toArray(new String[0]);
	}

	// private String getRowData() {
	// try {
	// // 获取 fields 字段
	// Field fieldsField = baseInfo.getClass().getDeclaredField("fields");
	// fieldsField.setAccessible(true);
	// Object fieldsObject = fieldsField.get(baseInfo);
	//
	// // 获取 summary 字段
	// Field summaryField = fieldsObject.getClass().getDeclaredField("summary");
	// summaryField.setAccessible(true);
	// summary = (String) summaryField.get(fieldsObject);
	// } catch (NoSuchFieldException | IllegalAccessException e) {
	// e.printStackTrace();
	// }
	//
	// }

}
