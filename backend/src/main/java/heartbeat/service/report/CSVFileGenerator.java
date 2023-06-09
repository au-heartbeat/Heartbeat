package heartbeat.service.report;

import com.google.gson.JsonElement;
import com.opencsv.CSVWriter;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.report.dto.response.BoardCSVConfig;
import heartbeat.controller.report.dto.response.BoardCSVConfigEnum;
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
import java.lang.reflect.Field;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

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

	private static Object getPropertyValue(Object obj, String fieldName) {
		try {
			if (fieldName.contains("custom")) {
				Field customFields = obj.getClass().getDeclaredField("customFields");
				customFields.setAccessible(true);
				Map<String, JsonElement> customFieldsMap = (Map<String, JsonElement>) customFields.get(obj);
				return customFieldsMap.get(fieldName);
			}
			Field field = obj.getClass().getDeclaredField(fieldName);
			field.setAccessible(true);
			return field.get(obj);
		}
		catch (NoSuchFieldException | IllegalAccessException e) {
			e.printStackTrace();
			return null;
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

	public void convertBoardDataToCSV(List<JiraCardDTO> cardDTOList, List<BoardCSVConfig> fields,
			List<BoardCSVConfig> extraFields, String csvTimeStamp) {
		log.info("Start to create board csv directory");
		boolean created = createCsvDirectory();
		String message = created ? "Successfully create csv directory" : "CSV directory is already exist";
		log.info(message);

		String fileName = CSVFileNameEnum.BOARD.getValue() + "-" + csvTimeStamp + ".csv";
		try (CSVWriter writer = new CSVWriter(new FileWriter(fileName))) {
			List<BoardCSVConfig> fixedFields = new ArrayList<>(fields);
			fixedFields.removeAll(extraFields);

			String[][] fixedFieldsData = getFixedFieldsData(cardDTOList, fixedFields);
			String[][] extraFieldsData = getExtraFieldsData(cardDTOList, extraFields);
			String[][] mergedArrays = mergeArrays(fixedFieldsData, extraFieldsData, 14);

			writer.writeAll(Arrays.asList(mergedArrays));

		}
		catch (IOException e) {
			log.error("Failed to write file", e);
			throw new FileIOException(e);
		}
	}

	public String[][] mergeArrays(String[][] fixedFieldsData, String[][] extraFieldsData, int fixedColumnCount) {
		int mergedColumnLength = fixedFieldsData[0].length + extraFieldsData[0].length;
		String[][] mergedArray = new String[fixedFieldsData.length][mergedColumnLength];
		for (int i = 0; i < fixedFieldsData.length; i++) {
			String[] mergedPerRowArray = new String[mergedColumnLength];
			System.arraycopy(fixedFieldsData[i], 0, mergedPerRowArray, 0, 14);
			System.arraycopy(extraFieldsData[i], 0, mergedPerRowArray, fixedColumnCount, extraFieldsData[i].length);
			System.arraycopy(fixedFieldsData[i], 14, mergedPerRowArray, 14 + extraFieldsData[i].length,
					fixedFieldsData[i].length - 14);
			mergedArray[i] = mergedPerRowArray;
		}

		return mergedArray;
	}

	private String[][] getExtraFieldsData(List<JiraCardDTO> cardDTOList, List<BoardCSVConfig> extraFields) {
		int rowCount = cardDTOList.size() + 1;
		int columnCount = extraFields.size();
		String[][] data = new String[rowCount][columnCount];

		for (int i = 0; i < columnCount; i++) {
			data[0][i] = extraFields.get(i).getLabel();
		}
		for (int i = 0; i < cardDTOList.size(); i++) {
			JiraCardDTO cardDTO = cardDTOList.get(i);
			for (int j = 0; j < columnCount; j++) {
				data[i + 1][j] = getExtraData(cardDTO, extraFields.get(j));
			}
		}
		return data;

	}

	private String[][] getFixedFieldsData(List<JiraCardDTO> cardDTOList, List<BoardCSVConfig> fixedFields) {

		int rowCount = cardDTOList.size() + 1;
		int columnCount = fixedFields.size();
		String[][] data = new String[rowCount][columnCount];

		for (int i = 0; i < columnCount; i++) {
			data[0][i] = fixedFields.get(i).getLabel();
		}
		for (int i = 0; i < cardDTOList.size(); i++) {
			JiraCardDTO cardDTO = cardDTOList.get(i);
			data[i + 1] = getFixedData(cardDTO);
		}
		return data;
	}

	private String[] getFixedData(JiraCardDTO cardDTO) {
		String[] rowData = new String[BoardCSVConfigEnum.values().length];
		DecimalFormat decimalFormat = new DecimalFormat(FORMAT_2_DECIMALS);
		if (cardDTO.getBaseInfo() != null) {
			rowData[0] = cardDTO.getBaseInfo().getKey();
			rowData[1] = cardDTO.getBaseInfo().getFields().getSummary();
			rowData[2] = cardDTO.getBaseInfo().getFields().getIssuetype().getName();
			rowData[3] = cardDTO.getBaseInfo().getFields().getStatus().getDisplayName();
			rowData[4] = String.valueOf(cardDTO.getBaseInfo().getFields().getStoryPoints());
			if (cardDTO.getBaseInfo().getFields().getAssignee() != null) {
				rowData[5] = cardDTO.getBaseInfo().getFields().getAssignee().getDisplayName();
			}
			if (cardDTO.getBaseInfo().getFields().getReporter() != null) {
				rowData[6] = cardDTO.getBaseInfo().getFields().getReporter().getDisplayName();
			}

			rowData[7] = cardDTO.getBaseInfo().getFields().getProject().getKey();
			rowData[8] = cardDTO.getBaseInfo().getFields().getProject().getName();
			rowData[9] = cardDTO.getBaseInfo().getFields().getPriority().getName();

			// TODO baseInfo.fields.parent.fields.summary
			rowData[10] = cardDTO.getBaseInfo().getFields().getParent() != null
					? cardDTO.getBaseInfo().getFields().getParent().getDisplayName() : "";

			// TODO rowData[11] = baseInfo.fields.sprint

			rowData[12] = cardDTO.getBaseInfo().getFields().getLabels().toString();

			if (cardDTO.getCardCycleTime() != null) {
				rowData[13] = decimalFormat.format(cardDTO.getCardCycleTime().getTotal());
				rowData[14] = cardDTO.getTotalCycleTimeDivideStoryPoints();
				rowData[15] = decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getAnalyse());
				rowData[16] = decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getDevelopment());
				rowData[17] = decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getWaiting());
				rowData[18] = decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getTesting());
				rowData[19] = decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getBlocked());
				rowData[20] = decimalFormat.format(cardDTO.getCardCycleTime().getSteps().getReview());
			}
		}
		return rowData;
	}

	private String getExtraData(JiraCardDTO baseInfo, BoardCSVConfig extraField) {
		String[] values = extraField.getValue().split("\\.");

		Object fieldValue = baseInfo;
		for (String value : values) {
			if (fieldValue == null) {
				break;
			}
			fieldValue = getPropertyValue(fieldValue, value);
		}
		if (fieldValue != null) {
			return fieldValue.toString();
		}
		return null;
	}

}
