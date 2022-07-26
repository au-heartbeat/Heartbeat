import {
  GenerateReportRequest,
  RequestKanbanColumnSetting,
  RequestKanbanSetting,
} from "../../contract/GenerateReporter/GenerateReporterRequestBody";
import { StoryPointsAndCycleTimeRequest } from "../../contract/kanban/KanbanStoryPointParameterVerify";
import { JiraCardResponse } from "../../contract/kanban/KanbanStoryPointResponse";
import { JiraBlockReasonEnum } from "../../models/kanban/JiraBlockReasonEnum";
import { Cards } from "../../models/kanban/RequestKanbanResults";
import { Sprint } from "../../models/kanban/Sprint";
import { CalculateCardCycleTime } from "../kanban/CalculateCycleTime";
import { Jira } from "../kanban/Jira/Jira";
import { Kanban, KanbanEnum, KanbanFactory } from "../kanban/Kanban";

const KanbanKeyIdentifierMap: { [key: string]: "projectKey" | "teamName" } = {
  [KanbanEnum.CLASSIC_JIRA]: "projectKey",
  [KanbanEnum.JIRA]: "projectKey",
  [KanbanEnum.LINEAR]: "teamName",
};

export class GenerateSprintReporterService {
  private cards?: Cards;
  private sprints?: Sprint[];
  async fetchIterationInfoFromKanban(
    request: GenerateReportRequest
  ): Promise<void> {
    const kanbanSetting: RequestKanbanSetting = request.kanbanSetting;
    const kanban: Kanban = KanbanFactory.getKanbanInstantiateObject(
      kanbanSetting.type,
      kanbanSetting.token,
      kanbanSetting.site
    );
    let model: StoryPointsAndCycleTimeRequest = new StoryPointsAndCycleTimeRequest(
      kanbanSetting.token,
      kanbanSetting.type,
      kanbanSetting.site,
      kanbanSetting[KanbanKeyIdentifierMap[kanbanSetting.type]],
      kanbanSetting.boardId,
      kanbanSetting.doneColumn,
      request.startTime,
      request.endTime,
      kanbanSetting.targetFields,
      kanbanSetting.treatFlagCardAsBlock
    );
    this.cards = await kanban.getStoryPointsAndCycleTime(
      model,
      kanbanSetting.boardColumns,
      kanbanSetting.users
    );
    if (kanban instanceof Jira) {
      let sprints: Sprint[] = await kanban.getAllSprintsByBoardId(model);
    }
  }

  getLatestIterationSprintName(sprints: Sprint[]): string {
    const sortedSprints = sprints
      .filter((sprint) => sprint.startDate)
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
    return sortedSprints.length > 0
      ? sortedSprints[sortedSprints.length - 1].name
      : "";
  }

  getAllCardsByLatestSprintName(
    cards: JiraCardResponse[],
    sprintName: string
  ): JiraCardResponse[] {
    const allCardsInLatestSprint: JiraCardResponse[] = [];
    cards.forEach((card) => {
      if (card.baseInfo.fields.sprint === sprintName) {
        allCardsInLatestSprint[allCardsInLatestSprint.length] = card;
      }
    });
    return allCardsInLatestSprint;
  }

  calculateBlockReasonPercentage(
    cards: JiraCardResponse[],
    boardColumns: RequestKanbanColumnSetting[] = [],
    sprints: Sprint[]
  ): Map<string, number> {
    let totalBlockTime = 0;

    const initBlockTimeForEveryReasonMap: Map<
      string,
      number
    > = this.initTotalBlockTimeForEveryReasonMap();
    const sprintName = this.getLatestIterationSprintName(sprints);
    const matchedCards = this.getAllCardsByLatestSprintName(cards, sprintName);
    if (matchedCards.length === 0) {
      return initBlockTimeForEveryReasonMap;
    }

    for (const card of matchedCards) {
      const blockReason = card.baseInfo.fields.label || "";
      const cardCycleTime = CalculateCardCycleTime(card, boardColumns);
      totalBlockTime += cardCycleTime.steps.blocked;

      if (!initBlockTimeForEveryReasonMap.has(blockReason)) {
        initBlockTimeForEveryReasonMap.set(
          JiraBlockReasonEnum.UNKNOWN,
          initBlockTimeForEveryReasonMap.get(JiraBlockReasonEnum.UNKNOWN) ||
            0 + cardCycleTime.steps.blocked
        );
      } else {
        initBlockTimeForEveryReasonMap.set(
          blockReason,
          initBlockTimeForEveryReasonMap.get(blockReason) ||
            0 + cardCycleTime.steps.blocked
        );
      }
    }

    const blockTimePercentageForEveryReasonMap: Map<string, number> = new Map<
      string,
      number
    >();
    initBlockTimeForEveryReasonMap.forEach((value, key) => {
      const blockedReasonPercentage = parseFloat(
        (Math.floor((value / totalBlockTime) * 100) / 100).toFixed(2)
      );
      blockTimePercentageForEveryReasonMap.set(key, blockedReasonPercentage);
    });
    return blockTimePercentageForEveryReasonMap;
  }

  initTotalBlockTimeForEveryReasonMap(): Map<string, number> {
    const totalBlockTimeForEveryReasonMap = new Map<string, number>();
    for (let reason in JiraBlockReasonEnum) {
      totalBlockTimeForEveryReasonMap.set(reason, 0);
    }
    return totalBlockTimeForEveryReasonMap;
  }
}
