package heartbeat.controller.pipeline.dto.request;

public enum PipelineTypeEnum {

	BuildKite("BuildKite");

	public final String pipelineType;

	PipelineTypeEnum(String pipelineType) {
		this.pipelineType = pipelineType;
	}

	public static PipelineTypeEnum fromValue(String type) {
		return switch (type) {
			case "BuildKite" -> BuildKite;
			default -> throw new IllegalArgumentException("Pipeline type does not find!");
		};
	}

}
