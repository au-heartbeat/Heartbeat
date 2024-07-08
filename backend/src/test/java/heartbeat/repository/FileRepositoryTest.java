package heartbeat.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonParseException;
import com.google.gson.stream.JsonReader;
import heartbeat.controller.report.dto.response.MetricsDataCompleted;
import heartbeat.exception.FileIOException;
import heartbeat.exception.GenerateReportException;
import heartbeat.exception.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.InputStreamResource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import static heartbeat.repository.FileRepository.EXPORT_CSV_VALIDITY_TIME;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Slf4j
class FileRepositoryTest {

	private static final String BASE_PATH = "./app";

	private static final String TEST_UUID = "test-uuid";

	@Mock
	Gson gson;

	@InjectMocks
	FileRepository fileRepository;

	ObjectMapper objectMapper = new ObjectMapper();

	@BeforeAll
	static void beforeAll() throws IOException {
		Path path = Paths.get(BASE_PATH);
		FileUtils.deleteDirectory(new File(BASE_PATH));
		Files.createDirectories(path);
	}

	@AfterAll
	static void afterAll() throws IOException {
		FileUtils.deleteDirectory(new File(BASE_PATH));
	}

	@Nested
	class CreatePath {

		@AfterEach
		void afterEach() throws IOException {
			Files.deleteIfExists(Paths.get("./app/output/csv/" + TEST_UUID));
		}

		@Test
		void shouldThrowExceptionWhenUuidIsInvalid() {
			IllegalArgumentException uuidContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createPath(FileType.CSV, "..abc"));
			IllegalArgumentException uuidContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createPath(FileType.CSV, "aa/abc"));
			IllegalArgumentException uuidContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createPath(FileType.CSV, "aa\\abc"));

			assertEquals("Invalid filepath, filepath: ..abc", uuidContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: aa/abc", uuidContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: aa\\abc", uuidContainsBackslash.getMessage());
		}

		@Test
		void shouldCreatePathSuccessfully() {
			FileType fileType = FileType.CSV;
			String expectedFilepath = "./app/output/" + fileType.getPath() + TEST_UUID;

			fileRepository.createPath(fileType, TEST_UUID);

			File realFile = new File(expectedFilepath);
			assertTrue(realFile.exists());
			assertTrue(realFile.isDirectory());
		}

		@Test
		void shouldCreatePathErrorWhenCreateThrowException() {

			FileType fileType = FileType.CSV;
			String expectedFilepath = "./app/output/" + fileType.getPath() + TEST_UUID;

			try (MockedStatic<Files> mockStatic = mockStatic(Files.class)) {
				mockStatic.when(() -> Files.createDirectories(Paths.get(expectedFilepath)))
					.thenThrow(IOException.class);

				assertThrows(FileIOException.class, () -> {
					fileRepository.createPath(fileType, TEST_UUID);
				});

				File realFile = new File(expectedFilepath);
				assertFalse(realFile.exists());
			}
		}

	}

	@Nested
	class ReadFileByType {

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/report/" + TEST_UUID);
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/report"));
		}

		@Test
		void shouldThrowExceptionWhenUuidIsInvalid() {
			IllegalArgumentException uuidContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readFileByType(FileType.CSV, "..abc", "test", MetricsDataCompleted.class,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readFileByType(FileType.CSV, "aa/abc", "test", MetricsDataCompleted.class,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readFileByType(FileType.CSV, "aa\\abc", "test", MetricsDataCompleted.class,
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..abc", uuidContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: aa/abc", uuidContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: aa\\abc", uuidContainsBackslash.getMessage());
		}

		@Test
		void shouldNotReadFileWhenFilePathDontStartWithAppOutput() {
			try (MockedConstruction<File> fileMockedConstruction = mockConstruction(File.class,
					(mock, context) -> when(mock.toPath()).thenReturn(Path.of("./abc/efg")))) {
				String test = fileRepository.readFileByType(FileType.REPORT, TEST_UUID, "test-name", String.class,
						FilePrefixType.BOARD_REPORT_PREFIX);
				assertNull(test);
				assertFalse(fileMockedConstruction.constructed().isEmpty());
			}
		}

		@Test
		void shouldThrowExceptionWhenTimeRangeIsInvalid() {
			IllegalArgumentException timeRangeContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readFileByType(FileType.CSV, TEST_UUID, "..test", MetricsDataCompleted.class,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readFileByType(FileType.CSV, TEST_UUID, "te/st", MetricsDataCompleted.class,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readFileByType(FileType.CSV, TEST_UUID, "t\\est", MetricsDataCompleted.class,
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..test", timeRangeContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: te/st", timeRangeContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: t\\est", timeRangeContainsBackslash.getMessage());
		}

		@Test
		void shouldReadFileSuccessfullyWhenFileExist() throws IOException {
			String testFileName = "test";
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
				.doraMetricsCompleted(true)
				.boardMetricsCompleted(true)
				.overallMetricCompleted(false)
				.build();
			String json = objectMapper.writeValueAsString(metricsDataCompleted);
			try (FileWriter writer = new FileWriter("./app/output/report/" + TEST_UUID + "/"
					+ FilePrefixType.BOARD_REPORT_PREFIX.getPrefix() + testFileName)) {
				writer.write(json);
			}

			when(gson.fromJson(any(JsonReader.class), eq(MetricsDataCompleted.class))).thenReturn(metricsDataCompleted);

			MetricsDataCompleted result = fileRepository.readFileByType(FileType.REPORT, TEST_UUID, testFileName,
					MetricsDataCompleted.class, FilePrefixType.BOARD_REPORT_PREFIX);

			assertTrue(result.doraMetricsCompleted());
			assertTrue(result.boardMetricsCompleted());
			assertFalse(result.overallMetricCompleted());
			assertNull(result.isSuccessfulCreateCsvFile());
		}

		@Test
		void shouldReadFileNullWhenFileDontExist() {
			String dontExistFileName = "dontExistFileName";

			MetricsDataCompleted result = fileRepository.readFileByType(FileType.REPORT, TEST_UUID, dontExistFileName,
					MetricsDataCompleted.class, FilePrefixType.BOARD_REPORT_PREFIX);

			assertNull(result);
		}

		@Test
		void shouldReadFileErrorWhenJsonParseError() throws IOException {
			String testFileName = "test";
			MetricsDataCompleted metricsDataCompleted = MetricsDataCompleted.builder()
				.doraMetricsCompleted(true)
				.boardMetricsCompleted(true)
				.overallMetricCompleted(false)
				.build();
			String json = objectMapper.writeValueAsString(metricsDataCompleted);
			try (FileWriter writer = new FileWriter("./app/output/report/" + TEST_UUID + "/"
					+ FilePrefixType.BOARD_REPORT_PREFIX.getPrefix() + testFileName)) {
				writer.write(json);
			}

			when(gson.fromJson(any(JsonReader.class), any(Class.class))).thenThrow(JsonParseException.class);

			GenerateReportException generateReportException = assertThrows(GenerateReportException.class,
					() -> fileRepository.readFileByType(FileType.REPORT, TEST_UUID, testFileName,
							MetricsDataCompleted.class, FilePrefixType.BOARD_REPORT_PREFIX));
			assertEquals("Failed to read file report test-uuid board-test", generateReportException.getMessage());

		}

	}

	@Nested
	class GetFileName {

		@Test
		void shouldThrowExceptionWhenUuidIsInvalid() {
			IllegalArgumentException uuidContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.getFileName(FileType.CSV, "..abc", "test"));
			IllegalArgumentException uuidContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.getFileName(FileType.CSV, "aa/abc", "test"));
			IllegalArgumentException uuidContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.getFileName(FileType.CSV, "aa\\abc", "test"));

			assertEquals("Invalid filepath, filepath: ..abc", uuidContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: aa/abc", uuidContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: aa\\abc", uuidContainsBackslash.getMessage());
		}

		@Test
		void shouldThrowExceptionWhenTimeRangeIsInvalid() {
			IllegalArgumentException timeRangeContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.getFileName(FileType.CSV, TEST_UUID, "..test"));
			IllegalArgumentException timeRangeContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.getFileName(FileType.CSV, TEST_UUID, "te/st"));
			IllegalArgumentException timeRangeContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.getFileName(FileType.CSV, TEST_UUID, "t\\est"));

			assertEquals("Invalid filepath, filepath: ..test", timeRangeContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: te/st", timeRangeContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: t\\est", timeRangeContainsBackslash.getMessage());
		}

		@Test
		void shouldGetFileName() {
			FileType fileType = FileType.REPORT;
			String fileName = "test-filename";

			String result = fileRepository.getFileName(fileType, TEST_UUID, fileName);
			assertEquals("./app/output/report/test-uuid/test-filename", result);
		}

	}

	@Nested
	class CreateFileByType {

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/report/" + TEST_UUID);
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/report"));
		}

		@AfterEach
		void afterEach() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/report/" + TEST_UUID));
		}

		@Test
		void shouldThrowExceptionWhenUuidIsInvalid() {
			IllegalArgumentException uuidContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createFileByType(FileType.CSV, "..abc", "test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createFileByType(FileType.CSV, "aa/abc", "test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createFileByType(FileType.CSV, "aa\\abc", "test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..abc", uuidContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: aa/abc", uuidContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: aa\\abc", uuidContainsBackslash.getMessage());
		}

		@Test
		void shouldThrowExceptionWhenTimeRangeIsInvalid() {
			IllegalArgumentException timeRangeContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createFileByType(FileType.CSV, TEST_UUID, "..test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createFileByType(FileType.CSV, TEST_UUID, "te/st", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createFileByType(FileType.CSV, TEST_UUID, "t\\est", null,
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..test", timeRangeContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: te/st", timeRangeContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: t\\est", timeRangeContainsBackslash.getMessage());
		}

		@Test
		void shouldCreateFileSuccessfully() throws IOException {
			FileType fileType = FileType.REPORT;
			String fileName = "test-filename";
			String data = "test-data";
			FilePrefixType boardReportPrefix = FilePrefixType.BOARD_REPORT_PREFIX;
			String expectedFilepath = "./app/output/" + fileType.getPath() + TEST_UUID + "/"
					+ boardReportPrefix.getPrefix() + fileName;

			when(gson.toJson(data)).thenReturn(data);

			fileRepository.createFileByType(fileType, TEST_UUID, fileName, data, boardReportPrefix);

			verify(gson).toJson(data);

			File realFile = new File(expectedFilepath);
			assertTrue(realFile.exists());
			assertFalse(realFile.isDirectory());

			List<String> lines = Files.readAllLines(Paths.get(expectedFilepath));
			String realContent = String.join("\n", lines);
			assertEquals(data, realContent);
		}

		@Test
		void shouldCreateFileErrorWhenMoveFailed() {
			FileType fileType = FileType.REPORT;
			String fileName = "test-filename";
			String data = "test-data";
			FilePrefixType boardReportPrefix = FilePrefixType.BOARD_REPORT_PREFIX;
			String expectedFilepath = "./app/output/" + fileType.getPath() + TEST_UUID + "/"
					+ boardReportPrefix.getPrefix() + fileName;

			when(gson.toJson(data)).thenReturn(data);

			try (MockedStatic<Files> mockStatic = mockStatic(Files.class)) {
				mockStatic.when(() -> Files.move(any(), any(), any())).thenThrow(IOException.class);

				GenerateReportException generateReportException = assertThrows(GenerateReportException.class, () -> {
					fileRepository.createFileByType(fileType, TEST_UUID, fileName, data, boardReportPrefix);
				});

				assertEquals("Failed to write report ./app/output/report/test-uuid/board-test-filename",
						generateReportException.getMessage());

				verify(gson).toJson(data);

				File realFile = new File(expectedFilepath);
				assertFalse(realFile.exists());
			}
		}

	}

	@Nested
	class CreateCsvFileByType {

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/csv/" + TEST_UUID);
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/csv"));
		}

		@AfterEach
		void afterEach() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/csv/" + TEST_UUID));
		}

		@Test
		void shouldThrowExceptionWhenUuidIsInvalid() {
			IllegalArgumentException uuidContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createCSVFileByType("..abc", "test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createCSVFileByType("aa/abc", "test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createCSVFileByType("aa\\abc", "test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..abc", uuidContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: aa/abc", uuidContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: aa\\abc", uuidContainsBackslash.getMessage());
		}

		@Test
		void shouldThrowExceptionWhenTimeRangeIsInvalid() {
			IllegalArgumentException timeRangeContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createCSVFileByType(TEST_UUID, "..test", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createCSVFileByType(TEST_UUID, "te/st", null,
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.createCSVFileByType(TEST_UUID, "t\\est", null,
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: board-..test.csv", timeRangeContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: board-te/st.csv", timeRangeContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: board-t\\est.csv", timeRangeContainsBackslash.getMessage());
		}

		@Test
		void shouldCreateCsvFileSuccessfully() throws IOException {
			String fileName = "test-filename";
			String[][] data = new String[][] { { "a", "b" }, { "c", "d" } };
			FilePrefixType boardReportPrefix = FilePrefixType.BOARD_REPORT_PREFIX;
			String expectedFilepath = "./app/output/csv/" + TEST_UUID + "/" + boardReportPrefix.getPrefix() + fileName
					+ ".csv";
			List<String> expectedData = List.of("\"a\",\"b\"", "\"c\",\"d\"");

			fileRepository.createCSVFileByType(TEST_UUID, fileName, data, boardReportPrefix);

			File realFile = new File(expectedFilepath);
			assertTrue(realFile.exists());
			assertFalse(realFile.isDirectory());

			List<String> realContent = Files.readAllLines(Paths.get(expectedFilepath));

			assertEquals(expectedData.size(), realContent.size());
			for (int i = 0; i < expectedData.size(); i++) {
				assertEquals(expectedData.get(i), realContent.get(i));
			}
		}

		@Test
		void shouldCreateCsvFileErrorWhenFileExistAndFileIsDirectory() throws IOException {
			String fileName = "test-filename";
			String[][] data = new String[][] { { "a", "b" }, { "c", "d" } };
			FilePrefixType boardReportPrefix = FilePrefixType.BOARD_REPORT_PREFIX;
			String expectedFilepath = "./app/output/csv/" + TEST_UUID + "/" + boardReportPrefix.getPrefix() + fileName
					+ ".csv";
			Path path = Paths.get(expectedFilepath);
			Files.createDirectories(path);

			FileIOException fileIOException = assertThrows(FileIOException.class, () -> {
				fileRepository.createCSVFileByType(TEST_UUID, fileName, data, boardReportPrefix);
			});

			assertEquals("File handle error: ./app/output/csv/test-uuid/board-test-filename.csv (Is a directory)",
					fileIOException.getMessage());

			File realFile = new File(expectedFilepath);
			assertTrue(realFile.exists());
		}

	}

	@Nested
	class RemoveFileByType {

		String removedFile = "./app/output/csv/" + TEST_UUID + "/board-test-remove-file";

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/csv/" + TEST_UUID);
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/csv"));
		}

		@Test
		void shouldThrowExceptionWhenUuidIsInvalid() {
			IllegalArgumentException uuidContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.removeFileByType(FileType.CSV, "..abc", "test",
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.removeFileByType(FileType.CSV, "aa/abc", "test",
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.removeFileByType(FileType.CSV, "aa\\abc", "test",
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..abc", uuidContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: aa/abc", uuidContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: aa\\abc", uuidContainsBackslash.getMessage());
		}

		@Test
		void shouldThrowExceptionWhenTimeRangeIsInvalid() {
			IllegalArgumentException timeRangeContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.removeFileByType(FileType.CSV, TEST_UUID, "..test",
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.removeFileByType(FileType.CSV, TEST_UUID, "te/st",
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.removeFileByType(FileType.CSV, TEST_UUID, "t\\est",
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..test", timeRangeContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: te/st", timeRangeContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: t\\est", timeRangeContainsBackslash.getMessage());
		}

		@Test
		void shouldRemoveFileSuccessfully() throws IOException {
			Path path = Paths.get(removedFile);
			Files.createFile(path);

			FileType fileType = FileType.CSV;
			String fileName = "test-remove-file";
			FilePrefixType boardReportPrefix = FilePrefixType.BOARD_REPORT_PREFIX;
			String expectedFilepath = "./app/output/csv/" + TEST_UUID + "/" + boardReportPrefix.getPrefix() + fileName;

			fileRepository.removeFileByType(fileType, TEST_UUID, fileName, boardReportPrefix);

			File realFile = new File(expectedFilepath);
			assertFalse(realFile.exists());
		}

		@Test
		void shouldRemoveFileErrorWhenFileDeleteThrowIOException() throws IOException {
			Path path = Paths.get(removedFile);
			Files.createFile(path);

			FileType fileType = FileType.CSV;
			String fileName = "test-remove-file";
			FilePrefixType boardReportPrefix = FilePrefixType.BOARD_REPORT_PREFIX;
			String expectedFilepath = "./app/output/csv/" + TEST_UUID + "/" + boardReportPrefix.getPrefix() + fileName;

			try (MockedStatic<Files> mockStatic = mockStatic(Files.class)) {
				mockStatic.when(() -> Files.deleteIfExists(Paths.get(expectedFilepath))).thenThrow(IOException.class);

				GenerateReportException generateReportException = assertThrows(GenerateReportException.class, () -> {
					fileRepository.removeFileByType(fileType, TEST_UUID, fileName, boardReportPrefix);
				});

				assertEquals("Failed to remove csv, uuid: test-uuid file with file:test-remove-file",
						generateReportException.getMessage());

				File realFile = new File(expectedFilepath);
				assertTrue(realFile.exists());
			}
			FileUtils.delete(new File(removedFile));
		}

	}

	@Nested
	class RemoveExpiredFiles {

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/csv/" + TEST_UUID);
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/csv"));
		}

		@Test
		void shouldRemoveErrorWhenDirectoryDontExist() {
			FileType fileType = FileType.REPORT;
			long timestamp = 123L;
			String expectedFilepath = "./app/output/report";

			try (MockedStatic<FileUtils> mockStatic = mockStatic(FileUtils.class)) {
				fileRepository.removeExpiredFiles(fileType, timestamp);

				mockStatic.verify(() -> FileUtils.deleteDirectory(any(File.class)), never());

				File realFile = new File(expectedFilepath);
				assertFalse(realFile.exists());
			}
		}

		@Test
		void shouldRemoveErrorWhenPathIsNotDirectory() throws IOException {
			FileType fileType = FileType.REPORT;
			long timestamp = 123L;

			String expectedFilePath = "./app/output/report";
			Path path = Paths.get(expectedFilePath);
			Files.createFile(path);

			try (MockedStatic<FileUtils> mockStatic = mockStatic(FileUtils.class)) {
				fileRepository.removeExpiredFiles(fileType, timestamp);

				mockStatic.verify(() -> FileUtils.deleteDirectory(any(File.class)), never());

				File realFile = new File(expectedFilePath);
				assertTrue(realFile.exists());
				File[] listFiles = realFile.listFiles();
				assertNull(listFiles);
			}
			Files.deleteIfExists(path);
		}

		@Test
		void shouldRemoveSuccessfullyWhenDirectoryIsEmpty() throws IOException {
			FileType fileType = FileType.CSV;
			long timestamp = 123L;

			String expectedFilePath = "./app/output/csv/" + TEST_UUID;
			Path path = Paths.get(expectedFilePath);
			Files.createDirectories(path);

			try (MockedStatic<FileUtils> mockStatic = mockStatic(FileUtils.class)) {
				fileRepository.removeExpiredFiles(fileType, timestamp);

				mockStatic.verify(() -> FileUtils.deleteDirectory(any(File.class)), times(1));

				File realFile = new File(expectedFilePath);
				assertTrue(realFile.exists());
				File[] listFiles = realFile.listFiles();
				assertNotNull(listFiles);
				assertEquals(0, listFiles.length);
			}
			Files.deleteIfExists(path);
		}

		@Test
		void shouldRemoveSuccessfullyWhenDirectoryIsNotEmpty() throws IOException {
			FileType fileType = FileType.CSV;
			long timestamp = 123L;
			long currentTimestamp = EXPORT_CSV_VALIDITY_TIME + timestamp + 10000L;

			String expectedFilePath = "./app/output/csv/" + TEST_UUID;
			Path path = Paths.get(expectedFilePath);
			Files.createDirectories(path);
			Path filePath = Paths.get("./app/output/csv/" + TEST_UUID + "/board-1-2-" + timestamp);
			Files.createFile(filePath);

			fileRepository.removeExpiredFiles(fileType, currentTimestamp);

			File realFile = new File("./app/output/csv");
			assertTrue(realFile.exists());
			File[] listFiles = realFile.listFiles();
			assertNotNull(listFiles);
			assertEquals(0, listFiles.length);

			Files.deleteIfExists(path);
		}

		@Test
		void shouldRemoveErrorWhenFileIsNotExpired() throws IOException {
			FileType fileType = FileType.CSV;
			long timestamp = 123L;
			long currentTimestamp = EXPORT_CSV_VALIDITY_TIME + timestamp - 10000L;

			Path path = Paths.get("./app/output/csv/" + TEST_UUID);
			Files.createDirectories(path);
			Path filePath = Paths.get("./app/output/csv/" + TEST_UUID + "/board-1-2-" + timestamp);
			Files.createFile(filePath);

			fileRepository.removeExpiredFiles(fileType, currentTimestamp);

			File realFile = new File("./app/output/csv");
			assertTrue(realFile.exists());
			File[] listFiles = realFile.listFiles();
			assertNotNull(listFiles);
			assertEquals(1, listFiles.length);

			Files.deleteIfExists(filePath);
			Files.deleteIfExists(path);
		}

		@Test
		void shouldRemoveErrorWhenDeleteThrowException() throws IOException {
			FileType fileType = FileType.CSV;
			long timestamp = 123L;
			long currentTimestamp = EXPORT_CSV_VALIDITY_TIME + timestamp + 10000L;

			Path path = Paths.get("./app/output/csv/" + TEST_UUID);
			Files.createDirectories(path);
			Path filePath = Paths.get("./app/output/csv/" + TEST_UUID + "/board-1-2-" + timestamp);
			Files.createFile(filePath);

			try (MockedStatic<FileUtils> mockStatic = mockStatic(FileUtils.class)) {
				mockStatic.when(() -> FileUtils.deleteDirectory(any(File.class))).thenThrow(IOException.class);

				fileRepository.removeExpiredFiles(fileType, currentTimestamp);

				mockStatic.verify(() -> FileUtils.deleteDirectory(any(File.class)), times(1));

				File realFile = new File("./app/output/csv");
				assertTrue(realFile.exists());
				File[] listFiles = realFile.listFiles();
				assertNotNull(listFiles);
				assertEquals(1, listFiles.length);
			}

			Files.deleteIfExists(filePath);
			Files.deleteIfExists(path);
		}

	}

	@Nested
	class GetReportFiles {

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/report");
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/report"));
		}

		@Test
		void shouldGetReportListErrorWhenReportDontExist() {
			NotFoundException notFoundException = assertThrows(NotFoundException.class,
					() -> fileRepository.getFiles(FileType.REPORT, TEST_UUID));

			assertEquals("Don't find the test-uuid folder in the report files", notFoundException.getMessage());
		}

		@Test
		void shouldGetReportListErrorWhenReportIsNotDirectory() throws IOException {
			Path path = Paths.get("./app/output/report/" + TEST_UUID);
			Files.createFile(path);

			NotFoundException notFoundException = assertThrows(NotFoundException.class,
					() -> fileRepository.getFiles(FileType.REPORT, TEST_UUID));

			assertEquals("Don't find the test-uuid folder in the report files", notFoundException.getMessage());

			Files.deleteIfExists(path);
		}

		@Test
		void shouldGetReportListSuccessfully() throws IOException {
			String expectedName = "test-name";
			Path path = Paths.get("./app/output/report/" + TEST_UUID);
			Files.createDirectory(path);
			Path filePath = Paths.get("./app/output/report/" + TEST_UUID + "/" + expectedName);
			Files.createFile(filePath);

			List<String> reportFiles = fileRepository.getFiles(FileType.REPORT, TEST_UUID);

			assertEquals(1, reportFiles.size());
			assertEquals(expectedName, reportFiles.get(0));

			Files.deleteIfExists(filePath);
			Files.deleteIfExists(path);
		}

	}

	@Nested
	class GetReportFileTimeRangeAndTimeStampByStartTimeAndEndTime {

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/report");
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			FileUtils.deleteDirectory(new File("./app/output/report"));
		}

		@ParameterizedTest
		@ValueSource(strings = { "test-name", "board-20200101-20200102-123", "board-20240100-20240102-123",
				"board-20240101-20240103-123" })
		void shouldReturnNullWhenFileNameIsInvalid(String expectedName) throws IOException {
			String startTime = "20240101";
			String endTime = "20240102";
			Path path = Paths.get("./app/output/report/" + TEST_UUID);
			Files.createDirectory(path);
			Path filePath = Paths.get("./app/output/report/" + TEST_UUID + "/" + expectedName);
			Files.createFile(filePath);

			String result = fileRepository.getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType.REPORT, TEST_UUID,
					startTime, endTime);

			assertNull(result);

			Files.deleteIfExists(filePath);
			Files.deleteIfExists(path);
		}

		@Test
		void shouldGetTimeRangesSuccessfully() throws IOException {
			String expectedName = "board-20240101-20240102-123";
			String startTime = "20240101";
			String endTime = "20240102";
			Path path = Paths.get("./app/output/report/" + TEST_UUID);
			Files.createDirectory(path);
			Path filePath = Paths.get("./app/output/report/" + TEST_UUID + "/" + expectedName);
			Files.createFile(filePath);

			String result = fileRepository.getFileTimeRangeAndTimeStampByStartTimeAndEndTime(FileType.REPORT, TEST_UUID,
					startTime, endTime);

			assertEquals("20240101-20240102-123", result);

			Files.deleteIfExists(filePath);
			Files.deleteIfExists(path);
		}

	}

	@Nested
	class IsExpired {

		@Test
		void shouldExpired() {
			long startTime = 123L;
			long endTime = startTime + EXPORT_CSV_VALIDITY_TIME + 10000L;

			boolean expired = fileRepository.isExpired(endTime, startTime);

			assertTrue(expired);
		}

		@Test
		void shouldNotExpired() {
			long startTime = 123L;
			long endTime = startTime + EXPORT_CSV_VALIDITY_TIME - 10000L;

			boolean expired = fileRepository.isExpired(endTime, startTime);

			assertFalse(expired);
		}

	}

	@Nested
	class ReadStringFromCsvFile {

		@BeforeAll
		static void beforeAll() throws IOException {
			Path path = Paths.get("./app/output/csv/test-uuid");
			Files.createDirectories(path);
		}

		@AfterAll
		static void afterAll() throws IOException {
			Path path = Paths.get("./app/output/csv/test-uuid");
			Files.deleteIfExists(path);
		}

		@Test
		void shouldThrowExceptionWhenUuidIsInvalid() {
			IllegalArgumentException uuidContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readStringFromCsvFile("..abc", "test", FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readStringFromCsvFile("aa/abc", "test", FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException uuidContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readStringFromCsvFile("aa\\abc", "test", FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..abc", uuidContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: aa/abc", uuidContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: aa\\abc", uuidContainsBackslash.getMessage());
		}

		@Test
		void shouldThrowExceptionWhenTimeRangeIsInvalid() {
			IllegalArgumentException timeRangeContainsTwoPoint = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readStringFromCsvFile(TEST_UUID, "..test",
							FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsSlash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readStringFromCsvFile(TEST_UUID, "te/st", FilePrefixType.BOARD_REPORT_PREFIX));
			IllegalArgumentException timeRangeContainsBackslash = assertThrows(IllegalArgumentException.class,
					() -> fileRepository.readStringFromCsvFile(TEST_UUID, "t\\est",
							FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("Invalid filepath, filepath: ..test", timeRangeContainsTwoPoint.getMessage());
			assertEquals("Invalid filepath, filepath: te/st", timeRangeContainsSlash.getMessage());
			assertEquals("Invalid filepath, filepath: t\\est", timeRangeContainsBackslash.getMessage());
		}

		@Test
		void shouldReadCsvFileSuccessfully() throws IOException {
			Path path = Paths.get("./app/output/csv/test-uuid/board-1-2-3.csv");
			Files.createFile(path);

			InputStreamResource inputStreamResource = fileRepository.readStringFromCsvFile(TEST_UUID, "1-2-3",
					FilePrefixType.BOARD_REPORT_PREFIX);

			InputStream inputStream = inputStreamResource.getInputStream();
			String returnData = new BufferedReader(new InputStreamReader(inputStream)).lines()
				.collect(Collectors.joining("\n"));

			assertEquals("", returnData);

			Files.deleteIfExists(path);
		}

		@Test
		void shouldReadCsvFileErrorWhenFileIsDirectory() throws IOException {
			Path path = Paths.get("./app/output/csv/test-uuid/board-1-2-3.csv");
			Files.createDirectory(path);

			FileIOException fileIOException = assertThrows(FileIOException.class,
					() -> fileRepository.readStringFromCsvFile(TEST_UUID, "1-2-3", FilePrefixType.BOARD_REPORT_PREFIX));

			assertEquals("File handle error: ./app/output/csv/test-uuid/board-1-2-3.csv (Is a directory)",
					fileIOException.getMessage());

			Files.deleteIfExists(path);
		}

	}

}
