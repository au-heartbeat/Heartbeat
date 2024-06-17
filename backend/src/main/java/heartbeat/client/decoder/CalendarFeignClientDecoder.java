package heartbeat.client.decoder;

import feign.Response;
import feign.codec.ErrorDecoder;
import heartbeat.util.ExceptionUtil;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;

@Log4j2
public class CalendarFeignClientDecoder implements ErrorDecoder {
	@Override
	public Exception decode(String s, Response response) {
		log.error("Failed to get calendar info info_response status: {}, method key: {}", response.status(), s);
		HttpStatus statusCode = HttpStatus.valueOf(response.status());
		return ExceptionUtil.handleCommonFeignClientException(statusCode, s);
	}
}
