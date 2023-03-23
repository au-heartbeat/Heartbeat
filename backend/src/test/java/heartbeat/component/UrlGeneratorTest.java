package heartbeat.component;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.net.URI;

import org.junit.jupiter.api.Test;

class UrlGeneratorTest {

	private final SITUrlGenerator generator = new SITUrlGenerator();

	private final E2EUrlGenerator e2EUrlGenerator = new E2EUrlGenerator();

	@Test
	public void testSITUrlGeneratorGetUri() {
		String siteName = "site";
		URI expectedUri = URI.create("https://site.atlassian.net");
		URI actualUri = generator.getUri(siteName);
		assertEquals(expectedUri, actualUri);
	}

	@Test
	public void testE2EUrlGeneratorGetUri() {
		String siteName = "site";
		URI expectedUri = URI.create("http://54.223.108.141:4323");
		URI actualUri = e2EUrlGenerator.getUri(siteName);
		assertEquals(expectedUri, actualUri);
	}

}
