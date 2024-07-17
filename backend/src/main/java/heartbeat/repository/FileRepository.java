package heartbeat.repository;

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.opencsv.CSVWriter;
import heartbeat.exception.FileIOException;
import heartbeat.exception.GenerateReportException;
import heartbeat.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

import static heartbeat.repository.FileType.CSV;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileRepository {

	private static final String BASE_OUTPUT_PATH = "./app/output";

	private static final String NORMALIZE_BASE_OUTPUT_PATH = "app/output";

	private static final String SLASH = "/";

	private static final String FILENAME_SEPARATOR = "-";

	public static final String SUFFIX_TMP = ".tmp";

	@Value("${heartbeat.expiredDays}")
	public int expiredDays = 7;

	private static final long ONE_DAY_MILLISECONDS = 1000L * 3600 * 24;

	private static final String CSV_EXTENSION = ".csv";

	private static final String SUCCESSFULLY_WRITE_FILE_LOGS = "Successfully write file type: {}, uuid: {}, file name: {}";

	private final Gson gson;

	public void createPath(FileType type, String uuid) {
		isCorrectFilePath(uuid);

		Path path = Path.of(BASE_OUTPUT_PATH + SLASH + type.getType() + SLASH + uuid);
		try {
			Files.createDirectories(path);
			log.info("Successfully create {} directory", path);
		}
		catch (IOException e) {
			log.error("Failed to create {} directory", path);
			throw new FileIOException(e);
		}
	}

	public <T> T readFileByType(FileType fileType, String uuid, String fileName, Class<T> classType,
			FilePrefixType fileNamePrefix) {
		isCorrectFilePath(uuid);
		isCorrectFilePath(fileName);

		String realFileName = fileNamePrefix.getPrefix() + fileName;
		File file = new File(getFileName(fileType, uuid, realFileName));
		if (file.toPath().normalize().startsWith(NORMALIZE_BASE_OUTPUT_PATH) && file.exists()) {
			try (JsonReader reader = new JsonReader(new FileReader(file))) {
				T result = gson.fromJson(reader, classType);
				log.info("Successfully read file folder: {}, uuid: {}, file name: {}", fileType.getType(), uuid,
						realFileName);
				return result;
			}
			catch (Exception e) {
				log.error("Failed to read file folder: {}, uuid: {}, file name: {}, reason: {}", fileType.getType(),
						uuid, realFileName, e);
				throw new GenerateReportException(
						"Failed to read file " + fileType.getType() + " " + uuid + " " + realFileName);
			}
		}
		return null;
	}

	public String getFileName(FileType fileType, String uuid, String fileName) {
		isCorrectFilePath(uuid);
		isCorrectFilePath(fileName);

		return BASE_OUTPUT_PATH + SLASH + fileType.getType() + SLASH + uuid + SLASH + fileName;
	}

	public <T> void createFileByType(FileType fileType, String uuid, String fileName, T data,
			FilePrefixType fileNamePrefix) {
		isCorrectFilePath(uuid);
		isCorrectFilePath(fileName);

		String json = gson.toJson(data);
		createFileHandler(fileType, uuid, fileName, fileNamePrefix,
				realFileName -> createNormalFileHandler(fileType, uuid, json, realFileName));
	}

	public void createCSVFileByType(String uuid, String fileName, String[][] data, FilePrefixType fileNamePrefix) {
		isCorrectFilePath(uuid);

		FileType fileType = CSV;
		createFileHandler(fileType, uuid, fileName + CSV_EXTENSION, fileNamePrefix,
				realFileName -> createCSVFileHandler(fileType, uuid, data, realFileName));
	}

	public void removeFileByType(FileType fileType, String uuid, String fileName, FilePrefixType fileNamePrefix) {
		isCorrectFilePath(uuid);
		isCorrectFilePath(fileName);

		String realFileName = fileNamePrefix.getPrefix() + fileName;
		String path = getFileName(fileType, uuid, realFileName);

		log.info("Start to remove file folder: {}, uuid: {}, file name: {}", fileType.getType(), uuid, fileName);
		try {
			Files.deleteIfExists(Path.of(path));
			log.info("Successfully remove file folder: {}, file name: {}", fileType.getType(), fileName);
		}
		catch (Exception e) {
			log.error("Failed to remove file folder: {}, uuid: {}, file name: {}", fileType.getType(), uuid,
					realFileName);
			throw new GenerateReportException(
					"Failed to remove " + fileType.getType() + ", uuid: " + uuid + " file with file:" + fileName);
		}
	}

	public void removeExpiredFiles(FileType fileType, long currentTimeStamp) {
		String pathname = BASE_OUTPUT_PATH + SLASH + fileType.getType();
		File baseFile = new File(pathname);
		if (!baseFile.exists() || !baseFile.isDirectory()) {
			log.info("{} path don't exist", pathname);
			return;
		}
		List<String> expiredDirectories = new ArrayList<>();
		List<String> dontExpiredDirectories = new ArrayList<>();
		File[] uuidDirectories = baseFile.listFiles();
		log.info("Start to deleted expired {} file", fileType.getType());
		for (File uuidDirectory : uuidDirectories) {
			File[] files = uuidDirectory.listFiles();
			try {
				if (files.length == 0) {
					FileUtils.deleteDirectory(uuidDirectory);
					expiredDirectories.add(uuidDirectory.getName());
				}
				else {
					String timeStamp = files[0].getName().split("[-.]")[3];
					if (isExpired(currentTimeStamp, Long.parseLong(timeStamp))) {
						FileUtils.deleteDirectory(uuidDirectory);
						expiredDirectories.add(uuidDirectory.getName());
					}
					else {
						dontExpiredDirectories.add(uuidDirectory.getName());
					}
				}
			}
			catch (Exception e) {
				log.error("Failed to deleted expired {} file, file path: {}, reason: {}", fileType.getType(),
						uuidDirectory, e);
			}
		}
		log.info("Successfully deleted expired {} file, expired files: {}, no expired files: {}", fileType.getType(),
				expiredDirectories, dontExpiredDirectories);
	}

	public List<String> getFiles(FileType fileType, String uuid) {
		isCorrectFilePath(uuid);

		String fileName = BASE_OUTPUT_PATH + SLASH + fileType.getPath() + uuid;
		File folder = new File(fileName);

		if (folder.exists() && folder.isDirectory()) {
			log.info("Successfully get the {} folder in the report files", fileName);
			return Arrays.stream(folder.listFiles()).map(File::getName).toList();
		}
		else {
			log.error("Don't find the {} folder in the report files", fileName);
			throw new NotFoundException(String.format("Don't find the %s folder in the report files", fileName));
		}
	}

	public String getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType fileType, String uuid, String startTime,
			String endTime) {
		isCorrectFilePath(uuid);

		return getFiles(fileType, uuid).stream()
			.map(it -> it.split(FILENAME_SEPARATOR))
			.filter(it -> it.length == 4)
			.filter(it -> Objects.equals(it[1], startTime) && Objects.equals(it[2], endTime))
			.map(it -> it[1] + FILENAME_SEPARATOR + it[2] + FILENAME_SEPARATOR + it[3])
			.findFirst()
			.orElse(null);

	}

	public boolean isExpired(long currentTimeStamp, long timeStamp) {
		return timeStamp < currentTimeStamp - this.getExpiredTime();
	}

	public long getExpiredTime() {
		return this.expiredDays * ONE_DAY_MILLISECONDS;
	}

	public InputStreamResource readStringFromCsvFile(String uuid, String fileName, FilePrefixType filePrefixType) {
		isCorrectFilePath(uuid);
		isCorrectFilePath(fileName);

		File file = new File(getFileName(CSV, uuid, filePrefixType.getPrefix() + fileName + CSV_EXTENSION));
		try {
			InputStream inputStream = new FileInputStream(file);
			return new InputStreamResource(inputStream);
		}
		catch (IOException e) {
			log.error("Failed to read file", e);
			throw new FileIOException(e);
		}
	}

	private void createFileHandler(FileType fileType, String uuid, String fileName, FilePrefixType fileNamePrefix,
			Consumer<String> handler) {
		createPath(fileType, uuid);
		String realBaseFileName = fileNamePrefix.getPrefix() + fileName;
		String realFileName = getFileName(fileType, uuid, realBaseFileName);
		log.info("Start to write file folder: {}, uuid: {}, file name: {}", fileType.getType(), uuid, realFileName);
		synchronized (this) {
			handler.accept(realFileName);
		}
		log.info(SUCCESSFULLY_WRITE_FILE_LOGS, fileType.getType(), uuid, realFileName);
	}

	private void createNormalFileHandler(FileType fileType, String uuid, String json, String realFileName) {
		String tmpFileName = realFileName + SUFFIX_TMP;

		try (FileWriter writer = new FileWriter(tmpFileName)) {
			writer.write(json);
			Files.move(Path.of(tmpFileName), Path.of(realFileName), StandardCopyOption.ATOMIC_MOVE);
			log.info(SUCCESSFULLY_WRITE_FILE_LOGS, fileType.getType(), uuid, realFileName);
		}
		catch (Exception e) {
			log.error("Failed to write file folder: {}, uuid: {}, file name: {}, reason: {}", fileType.getType(), uuid,
					realFileName, e);
			throw new GenerateReportException("Failed to write " + fileType.getType() + " " + realFileName);
		}
	}

	private void createCSVFileHandler(FileType fileType, String uuid, String[][] json, String realFileName) {
		try (CSVWriter writer = new CSVWriter(new FileWriter(realFileName))) {
			writer.writeAll(Arrays.asList(json));
			log.info(SUCCESSFULLY_WRITE_FILE_LOGS, fileType.getType(), uuid, realFileName);
		}
		catch (IOException e) {
			log.error("Failed to write {} file", fileType.getType(), e);
			throw new FileIOException(e);
		}
	}

	private void isCorrectFilePath(String filepath) {
		if (filepath.contains("..") || filepath.contains("/") || filepath.contains("\\")) {
			throw new IllegalArgumentException("Invalid filepath, filepath: " + filepath);
		}
	}

}
