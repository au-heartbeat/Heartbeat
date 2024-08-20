package heartbeat.controller.pipeline.dto.response;

import heartbeat.controller.pipeline.dto.request.PipelineType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class PipelineTypeTest {

	@Test
	void shouldConvertValueToType() {
		PipelineType buildKiteType = PipelineType.fromValue("buildkite");

		assertEquals(PipelineType.BUILDKITE, buildKiteType);
	}

	@Test
	void shouldConvertValueToTypeWhenTypeIsNone() {
		PipelineType buildKiteType = PipelineType.fromValue("none");

		assertEquals(PipelineType.NONE, buildKiteType);
	}

	@Test
	void shouldThrowExceptionWhenDateTypeNotSupported() {
		assertThatThrownBy(() -> PipelineType.fromValue("unknown")).isInstanceOf(IllegalArgumentException.class)
			.hasMessageContaining("Pipeline type does not find!");
	}

}
