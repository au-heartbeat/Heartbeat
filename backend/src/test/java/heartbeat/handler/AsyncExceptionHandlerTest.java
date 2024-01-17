package heartbeat.handler;

import heartbeat.exception.BaseException;
import heartbeat.exception.UnauthorizedException;
import heartbeat.util.IdUtil;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

@ExtendWith(MockitoExtension.class)
class AsyncExceptionHandlerTest {

	public static final String APP_OUTPUT_ERROR = "./app/output/error";

	@InjectMocks
	AsyncExceptionHandler asyncExceptionHandler;

	@AfterEach
	void afterEach() {
		new File(APP_OUTPUT_ERROR).delete();
	}

	@Test
	void shouldDeleteAsyncException() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		String expireTime = Long.toString(currentTimeMillis - 1900000L);
		String boardReportId1 = IdUtil.getBoardReportId(currentTime);
		String boardReportId2 = IdUtil.getBoardReportId(expireTime);
		asyncExceptionHandler.put(boardReportId1, new UnauthorizedException(""));
		asyncExceptionHandler.put(boardReportId2, new UnauthorizedException(""));

		asyncExceptionHandler.deleteExpireException(currentTimeMillis);

		assertNull(asyncExceptionHandler.get(boardReportId2));
		assertNotNull(asyncExceptionHandler.get(boardReportId1));
	}

	@Test
	void shouldPutAndGetAsyncException() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		String boardReportId = IdUtil.getBoardReportId(currentTime);
		asyncExceptionHandler.put(boardReportId, new UnauthorizedException("test"));

		BaseException baseException = asyncExceptionHandler.get(boardReportId);
		assertEquals(HttpStatus.UNAUTHORIZED.value(), baseException.getStatus());
		assertEquals("test", baseException.getMessage());

		assertNull(asyncExceptionHandler.get(currentTime));
	}

	@Test
	void shouldCreateTargetDirWhenPutAsyncException() {
		boolean mkdirs = new File(APP_OUTPUT_ERROR).mkdirs();
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		String boardReportId = IdUtil.getBoardReportId(currentTime);

		asyncExceptionHandler.put(boardReportId, new UnauthorizedException("test"));

		assertTrue(mkdirs);
		assertTrue(Files.exists(Path.of(APP_OUTPUT_ERROR)));
	}

	@Test
	void shouldPutAndRemoveAsyncException() {
		long currentTimeMillis = System.currentTimeMillis();
		String currentTime = Long.toString(currentTimeMillis);
		String boardReportId = IdUtil.getBoardReportId(currentTime);
		asyncExceptionHandler.put(boardReportId, new UnauthorizedException("test"));

		BaseException baseException = asyncExceptionHandler.remove(boardReportId);
		assertEquals(HttpStatus.UNAUTHORIZED.value(), baseException.getStatus());
		assertEquals("test", baseException.getMessage());

		assertNull(asyncExceptionHandler.get(currentTime));
	}

}
