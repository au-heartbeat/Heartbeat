package heartbeat.util;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public interface DecodeUtil {

	static String decodePathValue(String branch) {
		return URLDecoder.decode(branch, StandardCharsets.UTF_8);
	}

}
