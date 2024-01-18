package heartbeat.service.report.calculator.model;

import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.client.dto.pipeline.buildkite.BuildKiteBuildInfo;
import heartbeat.client.dto.pipeline.buildkite.DeployTimes;
import heartbeat.controller.board.dto.response.CardCollection;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class FetchedData {

	private CardCollectionInfo cardCollectionInfo;

	private BuildKiteData buildKiteData;

	@Data
	@Builder
	public static class CardCollectionInfo {

		private CardCollection realDoneCardCollection;

		private CardCollection nonDoneCardCollection;

	}

	@Data
	@Setter
	@Builder
	public static class BuildKiteData {
		public BuildKiteData() {
			this.pipelineLeadTimes = new ArrayList<>();
			this.deployTimesList = new ArrayList<>();
			this.buildInfosList = new ArrayList<>();
//			this.leadTimeBuildInfosList = new ArrayList<>();
		}

		private List<PipelineLeadTime> pipelineLeadTimes;

		private List<DeployTimes> deployTimesList;

		private List<Map.Entry<String, List<BuildKiteBuildInfo>>> buildInfosList;

		public void addPipelineLeadTimes(PipelineLeadTime pipelineLeadTime) {
			this.pipelineLeadTimes.add(pipelineLeadTime);
		}

		public void addDeployTimes(DeployTimes deployTimesList) {
			this.deployTimesList.add(deployTimesList);
		}

		public void addBuildKiteBuildInfos(String key, List<BuildKiteBuildInfo> buildKiteBuildInfos) {
			this.buildInfosList.add(Map.entry(key, buildKiteBuildInfos));
		}

//		private List<Map.Entry<String, List<BuildKiteBuildInfo>>> leadTimeBuildInfosList;

	}

}
