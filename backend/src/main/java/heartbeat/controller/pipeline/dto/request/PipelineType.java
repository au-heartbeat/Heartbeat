package heartbeat.controller.pipeline.dto.request;

public enum PipelineType {

	BuildKite("buildkite");

	public final String pipelineType;

	PipelineType(String pipelineType) {
		this.pipelineType = pipelineType;
	}

	public static PipelineType fromValue(String type) {
		return switch (type) {
			case "buildkite" -> BuildKite;
			default -> throw new IllegalArgumentException("Pipeline type does not find!");
		};
	}

}
