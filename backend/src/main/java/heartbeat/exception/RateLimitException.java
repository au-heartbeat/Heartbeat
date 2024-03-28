package heartbeat.exception;

import lombok.Getter;

@Getter
public class RateLimitException extends BaseException {

	public RateLimitException(String message) {
		super(message, 429);
	}

}
