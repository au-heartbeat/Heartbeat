import "mocha";
import { expect } from "chai";
import { GenerateReportService } from "../../../src/services/GenerateReporter/GenerateReportService";
import fs from "fs";
import { JiraBlockReasonEnum } from "../../../src/models/kanban/JiraBlockReasonEnum";
import { SprintStatistics } from "../../../src/models/kanban/SprintStatistics";
const sprint1Name = "test Sprint 1";
const sprint2Name = "test Sprint 2";
const sprint3Name = "test Sprint 3";
const sprintStatistics = new SprintStatistics(
  [
    { sprintName: sprint1Name, value: 3 },
    { sprintName: sprint2Name, value: 2 },
  ],
  [
    {
      sprintName: sprint1Name,
      value: { standardDeviation: 1.91, average: 4.53 },
    },
    {
      sprintName: sprint2Name,
      value: { standardDeviation: 1.5, average: 3.5 },
    },
    {
      sprintName: sprint3Name,
      value: { standardDeviation: 0, average: 2 },
    },
  ],
  [
    {
      sprintName: sprint1Name,
      value: { blockedPercentage: 0.22, developingPercentage: 0.78 },
    },
    {
      sprintName: sprint2Name,
      value: {
        blockedPercentage: 0.29,
        developingPercentage: 0.71,
      },
    },
    {
      sprintName: sprint3Name,
      value: {
        blockedPercentage: 0.5,
        developingPercentage: 0.5,
      },
    },
  ],
  {
    totalBlockedPercentage: 0.5,
    blockReasonPercentage: [
      {
        reasonName: JiraBlockReasonEnum.DEPENDENCIES_NOT_WORK,
        percentage: 0.07,
      },
      {
        reasonName: JiraBlockReasonEnum.TAKE_LEAVE,
        percentage: 0.07,
      },
      {
        reasonName: JiraBlockReasonEnum.OTHERS,
        percentage: 0.07,
      },
    ],
  }
);
describe("generate excel file", () => {
  const reportService = new GenerateReportService();
  const reportServiceProto = Object.getPrototypeOf(reportService);
  it("should return the sprint statistics map when given sprint statistics", () => {
    const iterationDataMap =
      reportServiceProto.getSprintStatisticsMap(sprintStatistics);
    const expected = new Map();
    expected.set("test Sprint 1", ["test Sprint 1", 1.91, 0.22, 0.78]);
    expected.set("test Sprint 2", ["test Sprint 2", 1.5, 0.29, 0.71]);
    expected.set("test Sprint 3", ["test Sprint 3", 0, 0.5, 0.5]);
    expect(iterationDataMap).deep.equal(expected);
  });

  it("should return the empty sprint statistics map when given empty sprint statistics", () => {
    const emptySprintStatistics = new SprintStatistics([], [], [], {
      totalBlockedPercentage: 0,
      blockReasonPercentage: [],
    });
    const emptyIterationDataMap = reportServiceProto.getSprintStatisticsMap(
      emptySprintStatistics
    );
    const expected = new Map();
    expect(emptyIterationDataMap).deep.equal(expected);
  });

  it("should generate the file when given time stamp", () => {
    reportServiceProto.kanabanSprintStatistics = sprintStatistics;
    const testTimeStamp = 11;
    reportServiceProto.generateExcelFile(testTimeStamp);
    setTimeout(() => {
      fs.stat("xlsx/exportSprintExcel-11.xlsx", (err, stats) => {
        expect(stats !== undefined).equal(true);
      });
      fs.stat("xlsx/exportSprintExcel-a.xlsx", (err, stats) => {
        expect(stats !== undefined).equal(false);
      });
    }, 1000);
  });
});
