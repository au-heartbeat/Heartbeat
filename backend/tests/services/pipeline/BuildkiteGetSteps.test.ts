import "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { BuildkiteGetSteps } from "../../../src/services/pipeline/Buildkite/BuildkiteGetSteps";
import { PipelineGetStepsRequest } from "../../../src/contract/pipeline/PipelineGetStepsRequest";

const buildkitegetsteps = new BuildkiteGetSteps("testToken");
const buildkitegetstepsProto = Object.getPrototypeOf(buildkitegetsteps);

describe("fetch pipeline info", () => {
  it("fetch pipeline info", async () => {
    const pipelineGetStepsRequest: PipelineGetStepsRequest = {
      orgId: "testId",
      orgName: "testName",
      pipelineId: "testPipelineId",
      pipelineName: "testPipelineName",
      repository: "https://github.com/expample/example.git",
      token: "testToken",
      type: "",
      startTime: 1590080044000,
      endTime: 1590080094000,
    };
    sinon.stub(buildkitegetstepsProto, "fetchDataPageByPage").returns([
      {
        id: "f7c42703-4925-4c8c-aa0f-dbc105696055",
        created_at: "2021-12-11T02:19:01.748Z",
        scheduled_at: "2021-12-11T02:19:01.701Z",
        started_at: "2021-12-11T02:19:11.509Z",
        finished_at: "2021-12-11T02:24:05.276Z",
        jobs: [
          {
            name: "test01",
          },
        ],
      },
      {
        id: "f7c42703-4925-4c8c-aa0f-dbc105696056",
        created_at: "2021-12-11T02:19:01.748Z",
        scheduled_at: "2021-12-11T02:19:01.701Z",
        started_at: "2021-12-11T02:19:11.509Z",
        finished_at: "2021-12-11T02:24:05.276Z",
        jobs: [
          {
            name: "test02",
          },
        ],
      },
    ]);
    const result = await buildkitegetsteps.fetchPipelineInfo(
      pipelineGetStepsRequest
    );
    expect(result.orgId).contains("testId");
    expect(result.orgName).contains("testName");
    expect(result.id).contains("testPipelineId");
  });
});
