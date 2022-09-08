import axios from "axios";
import { JsonConvert } from "json2typescript";
import parseLinkHeader from "parse-link-header";
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

  async fetchPipelineInfo(
    pipelineGetStepsRequest: PipelineGetStepsRequest
  ): Promise<PipelineInfo> {
    const jsonConvert = new JsonConvert();
    const fetchURL = `/organizations/${pipelineGetStepsRequest.orgId}/pipelines/${pipelineGetStepsRequest.pipelineId}/builds`;
    const fetchParams: FetchParams = {
      page: "1",
      per_page: "100",
      finished_from: new Date(pipelineGetStepsRequest.startTime),
      created_to: new Date(pipelineGetStepsRequest.endTime),
    };

    const pipelineBuilds: Array<any> = await this.fetchDataPageByPage(
      fetchURL,
      fetchParams
    );
    const bkBuildInfoList: BKBuildInfo[] = jsonConvert.deserializeArray(
      pipelineBuilds,
      BKBuildInfo
    );
    const bkJobInfoSet = new Set<string>();
    bkBuildInfoList.forEach((buildInfo) => {
      buildInfo.jobs
        .filter(
          (job) => job != undefined && job.name != undefined && job.name != ""
        )
        .forEach((job) => {
          bkJobInfoSet.add(job.name!);
        });
    });
    const bkJobInfoList = [...bkJobInfoSet];
    const bkEffectiveSteps = bkJobInfoList.sort((a: string, b: string) => {
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
  private async fetchDataPageByPage(
    fetchURL: string,
    fetchParams: FetchParams
  ): Promise<Array<any>> {
    const dataCollector: Array<any> = [];
    const response = await this.httpClient.get(fetchURL, {
      params: fetchParams,
    });
    const dataFromTheFirstPage: Array<any> = response.data;
    dataCollector.push(...dataFromTheFirstPage);
    const links = parseLinkHeader(response.headers["link"]);
    const totalPage: string =
      links != null && links["last"] != null ? links["last"].page : "1";
    if (totalPage != "1") {
      await Promise.all(
        [...Array(Number(totalPage)).keys()].map(async (index) => {
          if (index == 0) return;
          return this.httpClient
            .get(fetchURL, {
              params: { ...fetchParams, page: String(index + 1) },
            })
            .then((response) => {
              const dataFromOnePage: Array<any> = response.data;
              dataCollector.push(...dataFromOnePage);
            });
        })
      );
    }
    return dataCollector;
  }
}
