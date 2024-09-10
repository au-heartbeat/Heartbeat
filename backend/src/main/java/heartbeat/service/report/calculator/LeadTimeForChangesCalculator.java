package heartbeat.service.report.calculator;

import heartbeat.client.dto.codebase.github.LeadTime;
import heartbeat.client.dto.codebase.github.PipelineLeadTime;
import heartbeat.client.dto.codebase.github.SourceControlLeadTime;
import heartbeat.controller.pipeline.dto.request.DeploymentEnvironment;
import heartbeat.controller.report.dto.request.CodeBase;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.response.AvgLeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChanges;
import heartbeat.controller.report.dto.response.LeadTimeForChangesOfPipelines;
import heartbeat.controller.report.dto.response.LeadTimeForChangesOfSourceControl;
import heartbeat.service.report.calculator.model.AverageLeadTime;
import heartbeat.service.report.calculator.model.FetchedData;
import heartbeat.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.LongStream;

@Log4j2
@RequiredArgsConstructor
@Component
public class LeadTimeForChangesCalculator {

	public LeadTimeForChanges calculate(FetchedData fetchedData, GenerateReportRequest request) {
		List<PipelineLeadTime> pipelineLeadTime = fetchedData.getBuildKiteData().getPipelineLeadTimes();
		List<DeploymentEnvironment> deploymentEnvironmentList = request.getBuildKiteSetting().getDeploymentEnvList();

		Pair<List<LeadTimeForChangesOfPipelines>, List<AverageLeadTime>> pipelinePair = calculateLeadTimeForChangesOfPipelines(
				pipelineLeadTime, deploymentEnvironmentList);
		List<LeadTimeForChangesOfPipelines> leadTimeForChangesOfPipelines = pipelinePair.getLeft();
		List<AverageLeadTime> avgDelayTimesOfPipelines = pipelinePair.getRight();

		List<SourceControlLeadTime> sourceControlLeadTimes = fetchedData.getRepoData().getSourceControlLeadTimes();
		List<CodeBase> sourceControlCodeBase = request.getCodebaseSetting().getCodebases();

		Pair<List<LeadTimeForChangesOfSourceControl>, List<AverageLeadTime>> sourceControlPair = calculateLeadTimeForChangesOfSourceControl(
				sourceControlLeadTimes, sourceControlCodeBase);
		List<LeadTimeForChangesOfSourceControl> leadTimeForChangesOfSourceControls = sourceControlPair.getLeft();
		List<AverageLeadTime> avgDelayTimesOfSourceControls = sourceControlPair.getRight();

		AvgLeadTimeForChanges avgLeadTimeForChanges = calculateAverageLeadTimeForChanges(avgDelayTimesOfPipelines,
				avgDelayTimesOfSourceControls);

		return new LeadTimeForChanges(leadTimeForChangesOfPipelines, leadTimeForChangesOfSourceControls,
				avgLeadTimeForChanges);
	}

	private Pair<List<LeadTimeForChangesOfPipelines>, List<AverageLeadTime>> calculateLeadTimeForChangesOfPipelines(
			List<PipelineLeadTime> pipelineLeadTime, List<DeploymentEnvironment> deploymentEnvironmentList) {
		List<LeadTimeForChangesOfPipelines> leadTimeForChangesOfPipelines = new ArrayList<>();

		List<AverageLeadTime> avgDelayTimeList = pipelineLeadTime.stream().map(item -> {
			Pair<Double, Double> leadTimePair = calculateLeadTimeForChanges(item.getLeadTimes());
			if (leadTimePair == null) {
				return new AverageLeadTime(0d, 0d);
			}
			double avgPrLeadTime = leadTimePair.getLeft();
			double avgPipelineLeadTime = leadTimePair.getRight();

			leadTimeForChangesOfPipelines.add(LeadTimeForChangesOfPipelines.builder()
				.name(item.getPipelineName())
				.step(item.getPipelineStep())
				.prLeadTime(avgPrLeadTime)
				.pipelineLeadTime(avgPipelineLeadTime)
				.totalDelayTime(avgPrLeadTime + avgPipelineLeadTime)
				.build());

			return new AverageLeadTime(avgPrLeadTime, avgPipelineLeadTime);
		}).toList();

		List<LeadTimeForChangesOfPipelines> leftOverPipelines = deploymentEnvironmentList.stream()
			.filter(deploymentEnvironment -> leadTimeForChangesOfPipelines.stream()
				.noneMatch(leadTimeForChangesOfPipeline -> Objects.equals(deploymentEnvironment.getName(),
						leadTimeForChangesOfPipeline.getName())
						&& Objects.equals(deploymentEnvironment.getStep(), leadTimeForChangesOfPipeline.getStep())))
			.map(it -> LeadTimeForChangesOfPipelines.builder()
				.name(it.getName())
				.step(it.getStep())
				.pipelineLeadTime(0.0)
				.prLeadTime(0.0)
				.totalDelayTime(0.0)
				.build())
			.toList();

		leadTimeForChangesOfPipelines.addAll(leftOverPipelines);
		return Pair.of(leadTimeForChangesOfPipelines, avgDelayTimeList);
	}

	private Pair<List<LeadTimeForChangesOfSourceControl>, List<AverageLeadTime>> calculateLeadTimeForChangesOfSourceControl(
			List<SourceControlLeadTime> sourceControlLeadTimes, List<CodeBase> codeBases) {
		List<LeadTimeForChangesOfSourceControl> leadTimeForChangesOfSourceControls = new ArrayList<>();

		List<AverageLeadTime> avgDelayTimeList = sourceControlLeadTimes.stream().map(item -> {
			Pair<Double, Double> leadTimePair = calculateLeadTimeForChanges(item.getLeadTimes());
			if (leadTimePair == null) {
				return new AverageLeadTime(0d, 0d);
			}
			double avgPrLeadTime = leadTimePair.getLeft();
			double avgPipelineLeadTime = leadTimePair.getRight();

			leadTimeForChangesOfSourceControls.add(LeadTimeForChangesOfSourceControl.builder()
				.organization(item.getOrganization())
				.repo(item.getRepo())
				.prLeadTime(avgPrLeadTime)
				.pipelineLeadTime(avgPipelineLeadTime)
				.totalDelayTime(avgPrLeadTime + avgPipelineLeadTime)
				.build());

			return new AverageLeadTime(avgPrLeadTime, avgPipelineLeadTime);
		}).toList();

		List<LeadTimeForChangesOfSourceControl> leftOverSourceControl = codeBases.stream()
			.filter(codeBase -> leadTimeForChangesOfSourceControls.stream()
				.noneMatch(leadTimeForChangesOfSourceControl -> Objects.equals(codeBase.getOrganization(),
						leadTimeForChangesOfSourceControl.getOrganization())
						&& Objects.equals(codeBase.getRepo(), leadTimeForChangesOfSourceControl.getRepo())))
			.map(it -> LeadTimeForChangesOfSourceControl.builder()
				.organization(it.getOrganization())
				.repo(it.getRepo())
				.pipelineLeadTime(0.0)
				.prLeadTime(0.0)
				.totalDelayTime(0.0)
				.build())
			.toList();

		leadTimeForChangesOfSourceControls.addAll(leftOverSourceControl);
		return Pair.of(leadTimeForChangesOfSourceControls, avgDelayTimeList);
	}

	private AvgLeadTimeForChanges calculateAverageLeadTimeForChanges(List<AverageLeadTime> avgOfPipelines,
			List<AverageLeadTime> avgOfSourceControls) {

		int count = avgOfPipelines.size() + avgOfSourceControls.size();
		AvgLeadTimeForChanges avgLeadTimeForChanges = new AvgLeadTimeForChanges();
		if (count == 0) {
			return avgLeadTimeForChanges;
		}

		// get average pr lead time and pipeline lead time
		Double avgPrLeadTimeOfAllPipeline = avgOfPipelines.stream()
			.map(AverageLeadTime::getAvgPrLeadTime)
			.reduce(0.0, Double::sum);
		Double avgPrLeadTimeOfAllSourceControl = avgOfSourceControls.stream()
			.map(AverageLeadTime::getAvgPrLeadTime)
			.reduce(0.0, Double::sum);
		Double avgPipeDelayTimeOfAllPipeline = avgOfPipelines.stream()
			.map(AverageLeadTime::getAvgPipelineLeadTime)
			.reduce(0.0, Double::sum);
		Double avgPipeDelayTimeOfAllSourceControl = avgOfSourceControls.stream()
			.map(AverageLeadTime::getAvgPipelineLeadTime)
			.reduce(0.0, Double::sum);
		Double avgPrLeadTime = (avgPrLeadTimeOfAllPipeline + avgPrLeadTimeOfAllSourceControl) / count;
		Double avgPipelineLeadTime = (avgPipeDelayTimeOfAllPipeline + avgPipeDelayTimeOfAllSourceControl) / count;

		avgLeadTimeForChanges.setPrLeadTime(avgPrLeadTime);
		avgLeadTimeForChanges.setPipelineLeadTime(avgPipelineLeadTime);
		avgLeadTimeForChanges.setTotalDelayTime(avgPrLeadTime + avgPipelineLeadTime);
		return avgLeadTimeForChanges;
	}

	private Pair<Double, Double> calculateLeadTimeForChanges(List<LeadTime> leadTimes) {
		if (leadTimes == null || leadTimes.isEmpty()) {
			return null;
		}
		int buildNumber = leadTimes.size();
		// 过滤掉noPr的数据
		List<LeadTime> noPrLeadTime = leadTimes.stream()
			.filter(leadTime -> leadTime.getPrMergedTime() != null && leadTime.getPrMergedTime() != 0)
			.filter(leadTime -> leadTime.getPrLeadTime() != null && leadTime.getPrLeadTime() != 0)
			.toList();
		// 通过noPrLeadTimeList去计算totalPrLeadTime
		double totalPrLeadTime = noPrLeadTime.stream()
			.flatMapToLong(leadTime -> LongStream.of(leadTime.getPrLeadTime()))
			.sum();
		// 通过PipelineLeadTime去计算totalPipelineLeadTime
		double totalPipelineLeadTime = leadTimes.stream()
			.flatMapToLong(leadTime -> LongStream.of(leadTime.getPipelineLeadTime()))
			.sum();

		double avgPrLeadTime = TimeUtil.convertMillisecondToMinutes(totalPrLeadTime / buildNumber);
		double avgPipelineLeadTime = TimeUtil.convertMillisecondToMinutes(totalPipelineLeadTime / buildNumber);

		return Pair.of(avgPrLeadTime, avgPipelineLeadTime);
	}

}
