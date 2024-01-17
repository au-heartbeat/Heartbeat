package heartbeat.handler;

import lombok.extern.log4j.Log4j2;

import java.io.File;

@Log4j2
public class AsyncHandler {

	private static final String OUTPUT_FILE_PATH = "./app/output/";

	protected void createDirToConvertData(FIleType fIleType) {
		File directory = new File(OUTPUT_FILE_PATH + fIleType.getType());
		boolean isCreateSucceed = directory.mkdirs();
		String message = isCreateSucceed ? String.format("Successfully create %s directory", fIleType.getType())
				: String.format("Failed to create %s directory because it already exist", fIleType.getType());
		log.info(message);
	}

}
