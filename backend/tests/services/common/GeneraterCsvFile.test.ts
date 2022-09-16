import { expect } from "chai";
import "mocha";
import sinon from "sinon";
import fs from "fs";
import {
  CycleTimeInfo,
  JiraCardResponse,
} from "../../../src/contract/kanban/KanbanStoryPointResponse";
import { ColumnResponse } from "../../../src/contract/kanban/KanbanTokenVerifyResponse";
import {
  ConvertBoardDataToXlsx,
  getActiveExtraFields,
  GetDataFromCsv,
  getExtraFields,
  getFieldDisplayValue,
  updateExtraFields,
} from "../../../src/services/common/GeneraterCsvFile";
const currentFields = [
  {
    label: "Issue type",
    value: "baseInfo.key",
    originKey: "key1",
  },
  {
    label: "Issue key",
    value: "baseInfo.key",
    originKey: "key2",
  },
];
const targetFields = [
  {
    key: "priority",
    name: "priority",
    flag: false,
  },
  {
    key: "test",
    name: "haha",
    flag: true,
  },
];

const baseInfo = {
  key: "ADM-148",
  fields: {
    statuscategorychangedate: "2020-06-28T10:14:15.630+0800",
    sprint: "ADM Sprint 3",
    fixVersions: [],
    summary: "Test card in READY FOR QA",
    label: "",
    status: { name: "todo" },
  },
};
const cycleTime = [
  { column: "BACKLOG", day: 0 },
  { column: "TESTING", day: 0 },
];
const originCycleTime = [
  { column: "BACKLOG", day: 0 },
  { column: "TESTING", day: 0 },
];
const cardCycleTime = {
  name: "ADM-148",
  steps: {
    analyse: 0,
    development: 0,
    waiting: 0,
    testing: 0,
    blocked: 0,
    review: 0,
  },
  total: 0,
};

const jiraCardResponse = new JiraCardResponse(
  baseInfo,
  cycleTime,
  originCycleTime,
  cardCycleTime
);
const jiraCardResponses: JiraCardResponse[] = [jiraCardResponse];
const timeStamp = 123456789;
const nonDonebaseInfo = {
  key: "ADM-250",
  fields: {
    statuscategorychangedate: "2020-06-28T10:14:15.630+0800",
    sprint: "ADM Sprint 3",
    fixVersions: [],
    summary: "Test card in dev",
    label: "",
    status: { name: "blocked" },
  },
};
const nonDonecycleTime: CycleTimeInfo[] = [];
const nonDoneoriginCycleTime: CycleTimeInfo[] = [];
const nonDonecardCycleTime = {
  name: "ADM-148",
  steps: {
    analyse: 0,
    development: 0,
    waiting: 0,
    testing: 0,
    blocked: 0,
    review: 0,
  },
  total: 0,
};
const jiraNonDoneCardResponse = new JiraCardResponse(
  nonDonebaseInfo,
  nonDonecycleTime,
  nonDoneoriginCycleTime,
  nonDonecardCycleTime
);
const jiraColumns: ColumnResponse[] = [
  {
    key: "indeterminate",
    value: { name: "TODO", statuses: ["TODO"] },
  },
  {
    key: "indeterminate",
    value: { name: "Testing", statuses: ["TESTING"] },
  },
];
describe("get extra fields", () => {
  it("should get extra fields when we get csv string data ", () => {
    const result = getExtraFields(targetFields, currentFields);
    const expectedExtraFields = [
      {
        label: "priority",
        value: "baseInfo.fields.priority",
        originKey: "priority",
      },
      {
        label: "haha",
        value: "baseInfo.fields.test",
        originKey: "test",
      },
    ];
    expect(result).deep.equal(expectedExtraFields);
  });
});

describe("get field display value", () => {
  it("should get field display name when obj is an Object", () => {
    const obj = {
      displayName: "testDisplayName",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".displayName");
  });
  it("should get field name when obj is an Object ", () => {
    const obj = {
      name: "testName",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".name");
  });
  it("should get field key when update obj is an Object ", () => {
    const obj = {
      key: "testKey",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".key");
  });
  it("should get field value when obj is an Object ", () => {
    const obj = {
      value: "testValue",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".value");
  });
  it("should return false when obj is not an Object ", () => {
    const obj = "";
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(false);
  });

  it("should get field display value when obj is an Array ", () => {
    const obj = [{ displayName: "testDisplayName", name: "testName" }];
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal("[0].displayName");
  });
});

describe("get active extra fields", () => {
  it("should return fields when flag is true", () => {
    const expected = [
      {
        key: "test",
        name: "haha",
        flag: true,
      },
    ];
    const result = getActiveExtraFields(targetFields);
    expect(result).deep.equal(expected);
  });
});

describe("get data from csv", () => {
  afterEach(() => {
    sinon.restore();
  });
  it("should get data from csv when fetch board csv data", async () => {
    const dataType = "board";
    sinon.stub(fs, "readFileSync").returns("test");
    const result = await GetDataFromCsv(dataType, timeStamp);
    expect(result).to.equal("test");
  });
  it("should return empty when dataType is null", async () => {
    const dataType = "";
    const result = await GetDataFromCsv(dataType, timeStamp);
    expect(result).to.be.empty;
  });
  it("should throw error when file does not exist", async () => {
    const dataType = "board";
    try {
      await GetDataFromCsv(dataType, timeStamp);
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).equals("read csv file error");
      }
    }
  });
});

describe("update extra fields", () => {
  it("should get data from csv when fetch board csv data", async () => {
    const extraFields = [
      {
        label: "priority",
        value: "baseInfo.fields.priority",
        originKey: "priority",
      },
      {
        label: "haha",
        value: "baseInfo.fields.test",
        originKey: "test",
      },
    ];
    updateExtraFields(extraFields, jiraCardResponses);

    expect(extraFields[0].value).to.equal("baseInfo.fields.priority");
  });
});

describe("convert board data to xlsx", () => {
  it("should convert board data to xlsx when get data from board", async () => {
    const nonDonebaseInfo1 = {
      key: "ADM-148",
      fields: {
        statuscategorychangedate: "2020-06-28T10:14:15.630+0800",
        sprint: "ADM Sprint 3",
        fixVersions: [],
        summary: "Test card in READY FOR QA",
        label: "",
        status: { name: "todo" },
      },
    };
    const jiraNonDoneCardResponse1 = new JiraCardResponse(
      nonDonebaseInfo1,
      nonDonecycleTime,
      nonDoneoriginCycleTime,
      nonDonecardCycleTime
    );
    const jiraNonDoneCardResponses1: JiraCardResponse[] = [
      jiraNonDoneCardResponse,
      jiraNonDoneCardResponse1,
    ];
    const result = await ConvertBoardDataToXlsx(
      jiraCardResponses,
      jiraNonDoneCardResponses1,
      jiraColumns,
      targetFields
    );

    expect(result[0][2].header).deep.equal("Issue Type");
    expect(result[1][1].Status).deep.equal("");
  });
  it("should crease jiraColumns when jiraNonDoneCardResponses baseInfo fields status equal undefined ", async () => {
    const nonDonebaseInfo2 = {
      key: "ADM-165",
      fields: {
        statuscategorychangedate: "2020-06-28T10:14:15.630+0800",
        sprint: "ADM Sprint 3",
        fixVersions: [],
        summary: "Test card in READY FOR QA",
        label: "",
      },
    };
    const jiraNonDoneCardResponse2 = new JiraCardResponse(
      nonDonebaseInfo2,
      nonDonecycleTime,
      nonDoneoriginCycleTime,
      nonDonecardCycleTime
    );
    const jiraNonDoneCardResponses2: JiraCardResponse[] = [
      jiraNonDoneCardResponse,
      jiraNonDoneCardResponse2,
    ];
    const result = await ConvertBoardDataToXlsx(
      jiraCardResponses,
      jiraNonDoneCardResponses2,
      jiraColumns,
      targetFields
    );
    expect(result[0][0].header).deep.equal("Issue key");
    expect(result[1][0].Status).deep.equal("todo");
  });
});
