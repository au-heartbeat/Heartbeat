import sinon from "sinon";
import {
  CycleTimeInfo,
  JiraCardResponse,
} from "../../../src/contract/kanban/KanbanStoryPointResponse";
import "mocha";
import { expect } from "chai";
import { GenerateSprintReporterService } from "../../../src/services/GenerateReporter/GenerateSprintReporterService";
import { JiraCard, JiraCardField } from "../../../src/models/kanban/JiraCard";
import { Sprint } from "../../../src/models/kanban/Sprint";
import { RequestKanbanColumnSetting } from "../../../src/contract/GenerateReporter/GenerateReporterRequestBody";

const service = new GenerateSprintReporterService();
const sprint1JiraCardField: JiraCardField = new JiraCardField();
const sprint2JiraCardField: JiraCardField = new JiraCardField();

describe("calculate percentage of different block reasons in the latest iteration", () => {
  const sprint1 = new Sprint(
    1,
    "closed",
    "test Sprint 1",
    "2020-05-26T03:20:43.632Z",
    "2020-06-09T03:20:37.000Z",
    "2020-07-22T01:46:20.917Z"
  );
  const sprint2 = new Sprint(
    4,
    "closed",
    "test Sprint 2",
    "2020-07-22T01:48:39.455Z",
    "2020-08-05T01:48:37.000Z",
    "2020-07-22T01:49:26.508Z"
  );
  const sprint3 = new Sprint(9, "future", "test Sprint 5");
  let sprints: Sprint[] = [sprint1, sprint2, sprint3];

  sprint1JiraCardField.sprint = "test sprint 1";
  sprint2JiraCardField.sprint = "test Sprint 2";
  sprint2JiraCardField.label = "dependencies_not_work";

  const sprint1JiraCard: JiraCard = { fields: sprint1JiraCardField, key: "" };
  const sprint2JiraCard: JiraCard = { fields: sprint2JiraCardField, key: "" };

  const cycleTimeArray1: CycleTimeInfo[] = [
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
    new JiraCardResponse(sprint1JiraCard, cycleTimeArray1),
    new JiraCardResponse(sprint2JiraCard, cycleTimeArray2),
  ];

  const boardColumns: RequestKanbanColumnSetting[] = [
    { name: "DOING", value: "In Dev" },
    { name: "WAIT", value: "Waiting for testing" },
    { name: "TEST", value: "Testing" },
    { name: "BLOCKED", value: "Block" },
    { name: "REVIEW", value: "Review" },
  ];

  it("should return the latest sprint name", async () => {
    const latestSprintName = service.getLatestIterationSprintName(sprints);

    expect(latestSprintName).equal("test Sprint 2");
  });

  it("should return an empty string when there are no matched cards", async () => {
    const sprintWithoutMatchedCards = [sprint3];

    const latestSprintName = service.getLatestIterationSprintName(
      sprintWithoutMatchedCards
    );

    expect(latestSprintName).equal("");
  });

  it("should return the latest iteration cards by sprint name", async () => {
    const cards = [
      new JiraCardResponse(sprint1JiraCard, []),
      new JiraCardResponse(sprint2JiraCard, []),
    ];

    const latestCards = service.getAllCardsByLatestSprintName(
      cards,
      "test Sprint 2"
    );

    console.log(latestCards[0].baseInfo.fields);

    expect(latestCards[0].baseInfo.fields.sprint).deep.equal("test Sprint 2");
    expect(latestCards[0]).deep.equal(cards[1]);
    expect(latestCards.length).deep.equal(1);
  });

  it("should return blocked reason percentage", async () => {
    sinon
      .stub(
        GenerateSprintReporterService.prototype,
        "initTotalBlockTimeForEveryReasonMap"
      )
      .returns(
        new Map([
          ["dependencies_not_work", 0],
          ["unknown", 0],
        ])
      );

    sinon
      .stub(
        GenerateSprintReporterService.prototype,
        "getLatestIterationSprintName"
      )
      .returns("test Sprint 2");

    const matchedCards = new JiraCardResponse(sprint2JiraCard, cycleTimeArray2);
    const list: JiraCardResponse[] = [matchedCards];
    sinon
      .stub(
        GenerateSprintReporterService.prototype,
        "getAllCardsByLatestSprintName"
      )
      .returns(list);

    const blockedPercentageByReason = service.calculateBlockReasonPercentage(
      cards,
      boardColumns,
      sprints
    );

    expect(blockedPercentageByReason.get("dependencies_not_work")).equal(1);
    expect(blockedPercentageByReason.get("unknown")).equal(0);

    sinon.restore();
  });

  it("should return a initMap when there are no matched card", async () => {
    sinon
      .stub(
        GenerateSprintReporterService.prototype,
        "getLatestIterationSprintName"
      )
      .returns("test Sprint 2");
    sinon
      .stub(
        GenerateSprintReporterService.prototype,
        "getAllCardsByLatestSprintName"
      )
      .returns([]);
    sinon
      .stub(
        GenerateSprintReporterService.prototype,
        "initTotalBlockTimeForEveryReasonMap"
      )
      .returns(
        new Map([
          ["dependencies_not_work", 0],
          ["unknown", 0],
        ])
      );
    const map = service.calculateBlockReasonPercentage(
      cards,
      boardColumns,
      sprints
    );

    expect(map).deep.equal(
      new Map([
        ["dependencies_not_work", 0],
        ["unknown", 0],
      ])
    );

    sinon.restore();
  });
});
