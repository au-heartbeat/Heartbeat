package heartbeat.decoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import heartbeat.client.decoder.CalendarFeignClientDecoder;
import heartbeat.exception.RequestFailedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class CalendarFeignClientDecoderTest {

	private final ResponseMockUtil responseMock = new ResponseMockUtil();

	private CalendarFeignClientDecoder decoder;

	@BeforeEach
	void setup() {
		decoder = new CalendarFeignClientDecoder();
	}

	@Test
	void testDecode4xxRequestFailedException() {
		int statusCode = HttpStatus.METHOD_NOT_ALLOWED.value();

		Exception exception = decoder.decode("methodKey", responseMock.getMockResponse(statusCode));

		assertEquals(RequestFailedException.class, exception.getClass());
		assertTrue(exception.getMessage().contains("Client Error"));
	}

	@Test
	void testDecode5xxRequestFailedException() {
		int statusCode = HttpStatus.BAD_GATEWAY.value();

		Exception exception = decoder.decode("methodKey", responseMock.getMockResponse(statusCode));

		assertEquals(RequestFailedException.class, exception.getClass());
		assertTrue(exception.getMessage().contains("Server Error"));
	}

	@Test
	void testDecodeUnKnownException() {
		int statusCode = HttpStatus.SEE_OTHER.value();

		Exception exception = decoder.decode("methodKey", responseMock.getMockResponse(statusCode));

		assertEquals(RequestFailedException.class, exception.getClass());
		assertTrue(exception.getMessage().contains("UnKnown Error"));
	}

}
