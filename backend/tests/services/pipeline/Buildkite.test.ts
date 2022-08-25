import "mocha";
import { expect } from "chai";
import { mock } from "../../TestTools";
import BKOrganizationInfo from "../../fixture/BKOrganizationInfo.json";
import BKPipelineInfo from "../../fixture/BKPipelineInfo.json";
import BKBuildInfoList from "../../fixture/BKBuildInfoList.json";
import { Buildkite } from "../../../src/services/pipeline/Buildkite/Buildkite";
import { PipelineInfo } from "../../../src/contract/pipeline/PipelineInfo";
import { PipelineError } from "../../../src/errors/PipelineError";
import sinon from "sinon";
import { DeploymentEnvironment } from "../../../src/contract/GenerateReporter/GenerateReporterRequestBody";
import { BuildInfo, JobInfo } from "../../../src/models/pipeline/BuildInfo";
import { BKBuildInfo } from "../../../src/models/pipeline/Buildkite/BKBuildInfo";

const buildkite = new Buildkite("testToken");

describe("verify token", () => {
  it("should return true when token has required permissions", async () => {
    mock.onGet("/access-token").reply(200, {
      scopes: ["read_builds", "read_organizations", "read_pipelines"],
    });
    const hasPermission: boolean = await buildkite.verifyToken();
    expect(hasPermission).true;
  });

  it("should return true when token does not have required permissions", async () => {
    mock.onGet("/access-token").reply(200, {
      scopes: ["read_builds", "read_organizations"],
    });
    const hasPermission: boolean = await buildkite.verifyToken();
    expect(hasPermission).false;
  });

  it("should throw exception when token is invalid", () => {
    mock.onGet("/access-token").reply(401);
    expect(async () => {
      await buildkite.verifyToken();
    }).to.throw;
  });
});

describe("fetch pipeline ", () => {
  it("should return expected pipeline info", async () => {
    mock.onGet("/organizations").reply(200, BKOrganizationInfo);
    mock
      .onGet(
        `/organizations/${BKOrganizationInfo[0].slug}/pipelines/${BKPipelineInfo[0].slug}/builds`
      )
      .reply(200, BKBuildInfoList, {
        link: null,
      });
    mock
      .onGet(`/organizations/${BKOrganizationInfo[0].slug}/pipelines`)
      .reply(200, BKPipelineInfo, {
        link: null,
      });
    mock.onGet("/access-token").reply(200, {
      scopes: ["read_builds", "read_organizations", "read_pipelines"],
    });

    const pipelineInfo: PipelineInfo[] = await buildkite.fetchPipelineInfo(
      new Date().getTime() - 10000000,
      new Date().getTime()
    );
    const expectPipelineInfo: PipelineInfo[] = [
      new PipelineInfo(
        "buildkite-test-slug",
        "buildkite-test-name",
        [],
        "https://github.com/expample/example.git",
        "buildkite-test-slug",
        "buildkite-test-name"
      ),
    ];

    expect(pipelineInfo).deep.equal(expectPipelineInfo);
  });
  it("should return error when token failed", async () => {
    mock.onGet("/access-token").reply(200, {
      scopes: ["read_builds", "read_organizations"],
    });
    try {
      await buildkite.fetchPipelineInfo(
        new Date().getTime() - 10000000,
        new Date().getTime()
      );
    } catch (error) {
      if (error instanceof PipelineError) {
        expect(error.message).equals(
          new PipelineError("permission deny!").message
        );
      }
    }
  });
});

describe("fetch pipeline repository", () => {
  it("should return expected repository", async () => {
    const orgSlug = BKOrganizationInfo[0].slug;
    const pipelineSlug = BKPipelineInfo[0].slug;
    mock
      .onGet(`/organizations/${orgSlug}/pipelines/${pipelineSlug}`)
      .reply(200, BKPipelineInfo[0]);

    const repositories: Map<string, string> = await buildkite.getRepositories([
      {
        orgId: orgSlug,
        orgName: "orgName",
        id: pipelineSlug,
        name: "pipelineName",
        step: "step",
      },
    ]);
    const expectRepositories: Map<string, string> = new Map<string, string>();
    expectRepositories.set(
      pipelineSlug,
      "https://github.com/expample/example.git"
    );

    expect(repositories).deep.equal(expectRepositories);
  });
});

describe("count deploy times", () => {
  it("should return error", async () => {
    const deployments: DeploymentEnvironment = {
      orgId: "",
      orgName: "MYOB",
      id: "sme-web",
      name: "sme-web",
      step: ":rocket: :eagle: Deploy Integration App",
    };
    const BKJobInfo1: JobInfo = {
      name: ":rainbow-flag: uploading pipeline",
      state: "passed",
      startedAt: "2021-12-16T22:10:29.122Z",
      finishedAt: "2021-12-16T22:10:58.849Z",
    };
    const bkBuildInfo: BKBuildInfo = {
      jobs: [BKJobInfo1],
      commit: "18f8f5f2b89d255bb3f156e3fa13ae31fb66fb1f",
      pipelineCreateTime: "2021-12-17T02:11:55.965Z",
      number: 9400,
    };
    const buildInfo1 = new BuildInfo(bkBuildInfo);
    const buildInfos: BuildInfo[] = [buildInfo1];
    try {
      await buildkite.countDeployTimes(deployments, buildInfos);
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).equals("miss orgId argument");
      }
    }
  });
});
