import axios from "axios";
import { JsonConvert } from "json2typescript";
import { PipelineGetStepsRequest } from "../../../contract/pipeline/PipelineGetStepsRequest";
import { PipelineInfo } from "../../../contract/pipeline/PipelineInfo";
import { BKBuildInfo } from "../../../models/pipeline/Buildkite/BKBuildInfo";
import { FetchParams } from "../../../types/FetchParams";
import { PipelineGetSteps } from "../PipelineGetSteps";

export class BuildkiteGetSteps implements PipelineGetSteps {
  private httpClient = axios.create({
    baseURL: "https://api.buildkite.com/v2",
  });

  constructor(token: string) {
    this.httpClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  async fetchPipelineSteps(
    pipelineGetStepsRequest: PipelineGetStepsRequest
  ): Promise<PipelineInfo> {
    const jsonConvert = new JsonConvert();
    const fetchURL = `/organizations/${pipelineGetStepsRequest.orgId}/pipelines/${pipelineGetStepsRequest.pipelineId}/builds`;
    const fetchParams: FetchParams = {
      page: "1",
      per_page: "1",
      finished_from: new Date(pipelineGetStepsRequest.startTime),
      created_to: new Date(pipelineGetStepsRequest.endTime),
      branch: ["master", "main"],
      state: "passed",
    };

    const response = await this.httpClient.get(fetchURL, {
      params: fetchParams,
    });
    const pipelineBuilds: Array<any> = response.data;
    const bkBuildInfoList: BKBuildInfo[] = jsonConvert.deserializeArray(
      pipelineBuilds,
      BKBuildInfo
    );

    const bkEffectiveSteps = bkBuildInfoList[0].jobs
      .filter(
        (job) => job != undefined && job.name != undefined && job.name != ""
      )
      .map((job) => job.name!)
      .sort((a: string, b: string) => {
        return a.localeCompare(b);
      });

    return new PipelineInfo(
      pipelineGetStepsRequest.pipelineId,
      pipelineGetStepsRequest.pipelineName,
      bkEffectiveSteps,
      pipelineGetStepsRequest.repository,
      pipelineGetStepsRequest.orgId,
      pipelineGetStepsRequest.orgName
    );
  }
}
