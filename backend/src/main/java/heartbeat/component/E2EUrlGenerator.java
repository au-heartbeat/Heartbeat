package heartbeat.component;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;

@Component
@Profile(value = "e2e")
public class E2EUrlGenerator implements UrlGenerator {

	@Override
	public URI getUri(String site) {
		return URI.create("http://54.223.108.141:4323");
	}

}
