import { expect } from "chai";
import "mocha";
import { PipelineGetStepsRequest } from "../../../src/contract/pipeline/PipelineGetStepsRequest";
import { BuildkiteGetSteps } from "../../../src/services/pipeline/Buildkite/BuildkiteGetSteps";
import { mock } from "../../TestTools";

const buildkiteGetSteps = new BuildkiteGetSteps("testToken");

const pipelineLatestBuildData = [
  {
    id: "f7c42703-4925-4c8c-aa0f-dbc105696055",
    created_at: "2021-12-11T02:19:01.748Z",
    scheduled_at: "2021-12-11T02:19:01.701Z",
    started_at: "2021-12-11T02:19:11.509Z",
    finished_at: "2021-12-11T02:24:05.276Z",
    branch: "master",
    status: "passed",
    jobs: [
      {
        name: "job1",
      },
      {
        name: "",
      },
      {
        name: "job2",
      },
      {
        name: undefined,
      },
    ],
  },
];

describe("fetch pipeline steps", () => {
  it("should get pipeline steps when given an existing pipeline info", async () => {
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

    mock
      .onGet(
        `/organizations/${pipelineGetStepsRequest.orgId}/pipelines/${pipelineGetStepsRequest.pipelineId}/builds`
      )
      .reply(200, pipelineLatestBuildData);

    const result = await buildkiteGetSteps.fetchPipelineSteps(
      pipelineGetStepsRequest
    );
    expect(result.orgId).equals("testId");
    expect(result.orgName).equals("testName");
    expect(result.id).equals("testPipelineId");
    expect(result.steps).deep.equals(["job1", "job2"]);
  });
});
