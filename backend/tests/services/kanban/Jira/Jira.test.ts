import { expect } from "chai";
import "mocha";
import sinon from "sinon";
import { Jira } from "../../../../src/services/kanban/Jira/Jira";
import { mock } from "../../../TestTools";
import JiraCards from "../../../fixture/JiraCards.json";
import Sprints from "../../../fixture/Sprints.json";
import EmptySprints from "../../../fixture/EmptySprints.json";
import JiraCardCycleTime from "../../../fixture/JiraCardCycleTime.json";
import { StoryPointsAndCycleTimeRequest } from "../../../../src/contract/kanban/KanbanStoryPointParameterVerify";
import { Sprint } from "../../../../src/models/kanban/Sprint";
<<<<<<< HEAD
import {
  CycleTimeInfo,
  JiraCardResponse,
} from "../../../../src/contract/kanban/KanbanStoryPointResponse";
import { RequestKanbanColumnSetting } from "../../../../src/contract/GenerateReporter/GenerateReporterRequestBody";
import { JiraCard, JiraCardField } from "../../../../src/models/kanban/JiraCard";

const jira = new Jira("testToken", "domain");
let emptyJiraCardField: JiraCardField = new JiraCardField();
=======
import { CycleTimeInfo } from "../../../../src/contract/kanban/KanbanStoryPointResponse";

const jira = new Jira("testToken", "domain");
>>>>>>> 3770c2c (feat: sort the results by complete date)

describe("get story points and cycle times of done cards during period", () => {
  const storyPointsAndCycleTimeRequest = new StoryPointsAndCycleTimeRequest(
    "testToken",
    "jira",
    "domain",
    "project",
    "2",
    ["Done"],
    1589080044000,
    1589944044000,
    [
      {
        key: "customfield_10016",
        name: "Story point estimate",
        flag: true,
      },
    ],
    false
  );

  it("should return all the sprints by domain name and borad id", async () => {
    const expected = [
      new Sprint(
        1,
        "closed",
        "ADM Sprint 1",
        "2020-05-26T03:20:43.632Z",
        "2020-06-09T03:20:37.000Z",
        "2020-07-22T01:46:20.917Z"
      ),
      new Sprint(
        4,
        "closed",
        "ADM Sprint 2",
        "2020-07-22T01:48:39.455Z",
        "2020-08-05T01:48:37.000Z",
        "2020-07-22T01:49:26.508Z"
      ),
      new Sprint(9, "future", "ADM Sprint 5"),
    ];
    mock
      .onGet(
        `https://${storyPointsAndCycleTimeRequest.site}.atlassian.net/rest/agile/1.0/board/${storyPointsAndCycleTimeRequest.boardId}/sprint`
      )
      .reply(200, Sprints);
    expect(
      await jira.getAllSprintsByBoardId(storyPointsAndCycleTimeRequest)
    ).deep.equal(expected);
  });

  it("should return story points when having matched cards", async () => {
    sinon.stub(Jira, "getCycleTimeAndAssigneeSet").returns(
      Promise.resolve({
        cycleTimeInfos: Array.of<CycleTimeInfo>(),
        assigneeSet: new Set<string>(["Test User"]),
        originCycleTimeInfos: Array.of<CycleTimeInfo>(),
      })
    );
    mock
      .onGet(
        `https://${
          storyPointsAndCycleTimeRequest.site
        }.atlassian.net/rest/agile/1.0/board/2/issue?maxResults=100&jql=status in ('${storyPointsAndCycleTimeRequest.status.join(
          "','"
        )}')`
      )
      .reply(200, JiraCards);

    const response = await jira.getStoryPointsAndCycleTime(
      storyPointsAndCycleTimeRequest,
      [],
      ["Test User"]
    );
    expect(response.storyPointSum).deep.equal(6);
    sinon.restore();
  });

  it("should filter cards by selected user", async () => {
    sinon.stub(Jira, "getCycleTimeAndAssigneeSet").returns(
      Promise.resolve({
        cycleTimeInfos: Array.of<CycleTimeInfo>(),
        assigneeSet: new Set<string>([]),
        originCycleTimeInfos: Array.of<CycleTimeInfo>(),
      })
    );
    mock
      .onGet(
        `https://${
          storyPointsAndCycleTimeRequest.site
        }.atlassian.net/rest/agile/1.0/board/2/issue?maxResults=100&jql= status in ('${storyPointsAndCycleTimeRequest.status.join(
          "','"
        )}')`
      )
      .reply(200, JiraCards);

    const response = await jira.getStoryPointsAndCycleTime(
      storyPointsAndCycleTimeRequest,
      [],
      []
    );
    expect(response.storyPointSum).deep.equal(0);
    sinon.restore();
  });

  it("should return cycle time when having matched cards", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const WorkDayCalculate = require("../../../../src/services/common/WorkDayCalculate");
    sinon.stub(WorkDayCalculate, "calculateWorkDaysBy24Hours").returns(0.5);

    const jiraCardKey = "ADM-50";
    mock
      .onGet(
        `https://${storyPointsAndCycleTimeRequest.site}.atlassian.net/rest/internal/2/issue/${jiraCardKey}/activityfeed`
      )
      .reply(200, JiraCardCycleTime);

    const response: {
      cycleTimeInfos: CycleTimeInfo[];
    } = await Jira.getCycleTimeAndAssigneeSet(
      jiraCardKey,
      storyPointsAndCycleTimeRequest.token,
      storyPointsAndCycleTimeRequest.site,
      false
    );

    const cycleTime = Array.of(
      new CycleTimeInfo("BACKLOG", 0.5),
      new CycleTimeInfo("DOING", 0.5),
      new CycleTimeInfo("DONE", 0.5)
    );

    expect(response.cycleTimeInfos).deep.equal(cycleTime);
    sinon.restore();
  });
<<<<<<< HEAD

  it("should map cards by iteration", async () => {
    sinon.stub(Jira, "getCycleTimeAndAssigneeSet").returns(
      Promise.resolve({
        cycleTimeInfos: Array.of<CycleTimeInfo>(),
        assigneeSet: new Set<string>(["Test User"]),
        originCycleTimeInfos: Array.of<CycleTimeInfo>(),
      })
    );

    mock
      .onGet(
        `https://${
          storyPointsAndCycleTimeRequest.site
        }.atlassian.net/rest/agile/1.0/board/2/issue?maxResults=100&jql=status in ('${storyPointsAndCycleTimeRequest.status.join(
          "','"
        )}')`
      )
      .reply(200, JiraCards);

    const response = await jira.getStoryPointsAndCycleTime(
      storyPointsAndCycleTimeRequest,
      [],
      ["Test User"]
    );

    const cards = response.matchedCards;
    const map = jira.mapCardsByIteration(cards);
    expect(map).deep.equal(
      new Map<string, JiraCardResponse[]>([
        ["test Sprint 1", [cards[0]]],
        ["test Sprint 2", [cards[1]]],
      ])
    );

    sinon.restore();
  });

  it("should return blocked percentage given cards", async () => {
    const emptyJiraCard: JiraCard = { fields: emptyJiraCardField, key: "" };

    const cycleTimeArray: CycleTimeInfo[] = [
      { column: "DOING", day: 1 },
      { column: "WAIT", day: 2 },
      { column: "TEST", day: 3 },
      { column: "BLOCKED", day: 4 },
      { column: "REVIEW", day: 5 },
    ];
    const cycleTimeArray2: CycleTimeInfo[] = [
      { column: "DOING", day: 2 },
      { column: "WAIT", day: 3 },
      { column: "TEST", day: 4 },
      { column: "BLOCKED", day: 5 },
      { column: "REVIEW", day: 6 },
    ];

    const cards = [
      new JiraCardResponse(emptyJiraCard, cycleTimeArray),
      new JiraCardResponse(emptyJiraCard, cycleTimeArray2),
    ];
    const boardColumns: RequestKanbanColumnSetting[] = [
      { name: "DOING", value: "In Dev" },
      { name: "WAIT", value: "Waiting for testing" },
      { name: "TEST", value: "Testing" },
      { name: "BLOCKED", value: "Block" },
      { name: "REVIEW", value: "Review" },
    ];

    const blockedPercentage = jira.calculateCardsBlockedPercentage(cards, boardColumns);
    expect(blockedPercentage).equal(0.25);

    sinon.restore();
  });

  it("should return blocked percentage given iteration hashmap", async () => {
    const emptyJiraCard: JiraCard = { fields: emptyJiraCardField, key: "" };

    const cycleTimeArray: CycleTimeInfo[] = [
      { column: "DOING", day: 1 },
      { column: "WAIT", day: 2 },
      { column: "TEST", day: 3 },
      { column: "BLOCKED", day: 4 },
      { column: "REVIEW", day: 5 },
    ];
    const cycleTimeArray2: CycleTimeInfo[] = [
      { column: "DOING", day: 2 },
      { column: "WAIT", day: 3 },
      { column: "TEST", day: 4 },
      { column: "BLOCKED", day: 5 },
      { column: "REVIEW", day: 6 },
    ];

    const mapIterationCards = new Map<string, JiraCardResponse[]>([
      ["test Sprint 1", [new JiraCardResponse(emptyJiraCard, cycleTimeArray)]],
      ["test Sprint 2", [new JiraCardResponse(emptyJiraCard, cycleTimeArray2)]],
    ]);
    const boardColumns: RequestKanbanColumnSetting[] = [
      { name: "DOING", value: "In Dev" },
      { name: "WAIT", value: "Waiting for testing" },
      { name: "TEST", value: "Testing" },
      { name: "BLOCKED", value: "Block" },
      { name: "REVIEW", value: "Review" },
    ];

    const map = jira.calculateIterationBlockedPercentage(
      mapIterationCards,
      boardColumns
    );
    expect(map).deep.equal(
      new Map<string, number>([
        ["test Sprint 1", 0.26],
        ["test Sprint 2", 0.25],
      ])
    );

    sinon.restore();
  });

  it("should return developing percentage given iteration hashmap", async () => {
    const mapIterationBlockedPercentage = new Map<string, number>([
      ["test Sprint 1", 0.26],
      ["test Sprint 2", 0.25],
    ]);

    const map = jira.calculateIterationDevelopingPercentage(
      mapIterationBlockedPercentage
    );
    expect(map).deep.equal(
      new Map<string, number>([
        ["test Sprint 1", 0.74],
        ["test Sprint 2", 0.75],
      ])
    );

    sinon.restore();
  });
=======
>>>>>>> 3770c2c (feat: sort the results by complete date)
});

describe("get sprints data by domain name and boardId", () => {
  const storyPointsAndCycleTimeRequest = new StoryPointsAndCycleTimeRequest(
    "testToken",
    "jira",
    "domain",
    "project",
    "2",
    ["Done"],
    1589080044000,
    1589944044000,
    [
      {
        key: "customfield_10016",
        name: "Story point estimate",
        flag: true,
      },
    ],
    false
  );

  it("should return all the sprints when has sprints", async () => {
    const expected = [
      new Sprint(
        1,
        "closed",
        "ADM Sprint 1",
        "2020-05-26T03:20:43.632Z",
        "2020-06-09T03:20:37.000Z",
        "2020-07-22T01:46:20.917Z"
      ),
      new Sprint(
        4,
        "active",
        "ADM Sprint 2",
        "2020-07-22T01:48:39.455Z",
        "2020-08-05T01:48:37.000Z"
      ),
      new Sprint(9, "future", "ADM Sprint 5"),
    ];

    mock
      .onGet(
        `https://${storyPointsAndCycleTimeRequest.site}.atlassian.net/rest/agile/1.0/board/${storyPointsAndCycleTimeRequest.boardId}/sprint`
      )
      .reply(200, Sprints);

    expect(
      await jira.getAllSprintsByBoardId(storyPointsAndCycleTimeRequest)
    ).deep.equal(expected);
  });

  it("should return empty when no sprints", async () => {
    mock
      .onGet(
        `https://${storyPointsAndCycleTimeRequest.site}.atlassian.net/rest/agile/1.0/board/${storyPointsAndCycleTimeRequest.boardId}/sprint`
      )
      .reply(200, EmptySprints);

    expect(
      await jira.getAllSprintsByBoardId(storyPointsAndCycleTimeRequest)
    ).deep.equal([]);
  });
});
