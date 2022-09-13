import { expect } from "chai";
import "mocha";
import {
  getExtraFields,
  getFieldDisplayValue,
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
describe("getExtraFields", () => {
  it("should get extra fields when we get csv string data ", () => {
    const targetField = [
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
    const result = getExtraFields(targetField, currentFields);
    const expectedExtrafields = [
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
    expect(result).deep.equal(expectedExtrafields);
  });
});

// describe("insertExtraFields", () => {
//     it("should insert extra fields when we get csv string data ", () => {
//         const extraFields = [
//             {
//                 label: "status",
//                 value: "baseInfo.key",
//                 originKey: "statusKey"
//             },
//             {
//                 label: "Cycle Time",
//                 value: "baseInfo.key",
//                 originKey: "cycleTimeKey"
//             }
//         ];

//         // expect().deep.equal();
//     })
// })

describe("get field display value", () => {
  it("should get field display name when update extra fields ", () => {
    const obj = {
      displayName: "testDisplayName",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".displayName");
  });
  it("should get field name when update extra fields ", () => {
    const obj = {
      name: "testName",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".name");
  });
  it("should get field key when update extra fields ", () => {
    const obj = {
      key: "testKey",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".key");
  });
  it("should get field display value when update extra fields ", () => {
    const obj = {
      value: "testValue",
    };
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(".value");
  });
  it("should get field display value when update extra fields ", () => {
    const obj = "";
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal(false);
  });

  it("should get field display value when obj is a Array ", () => {
    const obj = [{ displayName: "testDisplayName", name: "testName" }];
    const result = getFieldDisplayValue(obj);
    expect(result).deep.equal("[0].displayName");
  });
});
