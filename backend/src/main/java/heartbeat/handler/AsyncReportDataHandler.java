package heartbeat.handler;

import heartbeat.exception.FileIOException;
import lombok.extern.log4j.Log4j2;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Log4j2
public class AsyncReportDataHandler {

	private static final String OUTPUT_FILE_PATH = "./app/output/";
	public static final String SUFFIX_TMP = ".tmp";

	protected void createDirToConvertData(FIleType fIleType) {
		File directory = new File(OUTPUT_FILE_PATH + fIleType.getType());
		boolean isCreateSucceed = directory.mkdirs();
		String message = isCreateSucceed ? String.format("Successfully create %s directory", fIleType.getType())
				: String.format("Failed to create %s directory because it already exist", fIleType.getType());
		log.info(message);
	}

	protected void creatFileByType(FIleType fIleType, String fileKey, String json) {
		String fileName = OUTPUT_FILE_PATH + fIleType.getPath() + fileKey;
		String tmpFileName = OUTPUT_FILE_PATH + fIleType.getPath() + fileKey + SUFFIX_TMP;
		log.info("Start to write file type: {}, file name: {}", fIleType.getType(), fileName);
		try (FileWriter writer = new FileWriter(tmpFileName)) {
			writer.write(json);
			Files.move(Path.of(tmpFileName), Path.of(fileName), StandardCopyOption.ATOMIC_MOVE,
					StandardCopyOption.REPLACE_EXISTING);
			log.info("Successfully write file type: {}, file name: {}", fIleType.getType(), fileName);
		}
		catch (IOException e) {
			log.error("Failed to write file type: {}, file name: {}, reason: {}", fIleType.getType(), fileName, e);
			throw new FileIOException(e);
		}
	}

}
