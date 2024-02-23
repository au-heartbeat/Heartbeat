package heartbeat.service.report;

import heartbeat.controller.board.dto.request.StoryPointsAndCycleTimeRequest;
import heartbeat.controller.board.dto.response.CardCollection;
import heartbeat.controller.board.dto.response.JiraCardDTO;
import heartbeat.controller.report.dto.request.GenerateReportRequest;
import heartbeat.controller.report.dto.request.JiraBoardSetting;
import heartbeat.service.board.jira.JiraService;
import heartbeat.service.report.calculator.model.FetchedData;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@Log4j2
@RequiredArgsConstructor
public class KanbanService {

	private final JiraService jiraService;

	private final KanbanCsvService kanbanCsvService;

	public FetchedData.CardCollectionInfo fetchDataFromKanban(GenerateReportRequest request) {
		CardCollection nonDoneCardCollection = fetchNonDoneCardCollection(request);
		CardCollection realDoneCardCollection = fetchRealDoneCardCollection(request);
		if (nonDoneCardCollection.getCardsNumber() > 50) {
			setLasted50NoneDoneCardsWhenNumberGreaterThan50(nonDoneCardCollection);
		}
		kanbanCsvService.generateCsvInfo(request, realDoneCardCollection, nonDoneCardCollection);

		return FetchedData.CardCollectionInfo.builder()
			.realDoneCardCollection(realDoneCardCollection)
			.nonDoneCardCollection(nonDoneCardCollection)
			.build();
	}

	private static void setLasted50NoneDoneCardsWhenNumberGreaterThan50(CardCollection nonDoneCardCollection) {
		List<JiraCardDTO> jiraCardDTOList = nonDoneCardCollection.getJiraCardDTOList();
		jiraCardDTOList.sort(Comparator.comparing(o -> o.getBaseInfo().getFields().convertCreatedTime()));
		Collections.reverse(jiraCardDTOList);
		nonDoneCardCollection.setJiraCardDTOList(jiraCardDTOList.subList(0, 50));
		nonDoneCardCollection.setCardsNumber(50);
	}

	private CardCollection fetchRealDoneCardCollection(GenerateReportRequest request) {
		JiraBoardSetting jiraBoardSetting = request.getJiraBoardSetting();
		StoryPointsAndCycleTimeRequest storyPointsAndCycleTimeRequest = buildStoryPointsAndCycleTimeRequest(
				jiraBoardSetting, request.getStartTime(), request.getEndTime());
		return jiraService.getStoryPointsAndCycleTimeForDoneCards(storyPointsAndCycleTimeRequest,
				jiraBoardSetting.getBoardColumns(), jiraBoardSetting.getUsers(), jiraBoardSetting.getAssigneeFilter());
	}

	private CardCollection fetchNonDoneCardCollection(GenerateReportRequest request) {
		JiraBoardSetting jiraBoardSetting = request.getJiraBoardSetting();
		StoryPointsAndCycleTimeRequest storyPointsAndCycleTimeRequest = buildStoryPointsAndCycleTimeRequest(
				jiraBoardSetting, request.getStartTime(), request.getEndTime());
		return jiraService.getStoryPointsAndCycleTimeForNonDoneCards(storyPointsAndCycleTimeRequest,
				jiraBoardSetting.getBoardColumns(), jiraBoardSetting.getUsers());
	}

	private static StoryPointsAndCycleTimeRequest buildStoryPointsAndCycleTimeRequest(JiraBoardSetting jiraBoardSetting,
			String startTime, String endTime) {
		return StoryPointsAndCycleTimeRequest.builder()
			.token(jiraBoardSetting.getToken())
			.type(jiraBoardSetting.getType())
			.site(jiraBoardSetting.getSite())
			.project(jiraBoardSetting.getProjectKey())
			.boardId(jiraBoardSetting.getBoardId())
			.status(jiraBoardSetting.getDoneColumn())
			.startTime(startTime)
			.endTime(endTime)
			.targetFields(jiraBoardSetting.getTargetFields())
			.treatFlagCardAsBlock(jiraBoardSetting.getTreatFlagCardAsBlock())
			.build();
	}

}
