import {
  ISourceControlGetBranchResponseDTO,
  ISourceControlGetOrganizationResponseDTO,
  SourceControlGetBranchResponseDTO,
  SourceControlGetCrewResponseDTO,
  SourceControlGetOrganizationResponseDTO,
  SourceControlGetRepoResponseDTO,
} from '@src/clients/sourceControl/dto/response';
import {
  SourceControlGetBranchRequestDTO,
  SourceControlGetCrewRequestDTO,
  SourceControlGetOrganizationRequestDTO,
  SourceControlGetRepoRequestDTO,
  SourceControlInfoRequestDTO,
  SourceControlVerifyRequestDTO,
} from '@src/clients/sourceControl/dto/request';
import {
  SOURCE_CONTROL_CONFIG_TITLE,
  SOURCE_CONTROL_ERROR_MESSAGE,
  SOURCE_CONTROL_VERIFY_ERROR_CASE_TEXT_MAPPING,
  SourceControlTypes,
  UNKNOWN_ERROR_TITLE,
} from '@src/constants/resources';
import { HttpClient } from '@src/clients/HttpClient';
import { IAppError } from '@src/errors/ErrorType';
import { isAppError } from '@src/errors';
import { HttpStatusCode } from 'axios';

export interface SourceControlResult {
  code?: number | string;
  errorTitle?: string;
}

export class SourceControlClient extends HttpClient {
  private getSourceControlApiType = (type: SourceControlVerifyRequestDTO['type']) => {
    return type === SourceControlTypes.GitHubEnterprise ? SourceControlTypes.GitHub : type;
  };

  verifyToken = async (params: SourceControlVerifyRequestDTO) => {
    const result: SourceControlResult = {};
    const { token, type, site } = params;
    const sourceControlType = this.getSourceControlApiType(type);
    try {
      const response = await this.axiosInstance.post(
        `/source-control/${sourceControlType.toLocaleLowerCase()}/verify`,
        {
          token,
          site,
        },
      );
      result.code = response.status;
    } catch (e) {
      if (isAppError(e)) {
        const exception = e as IAppError;
        result.code = exception.code;
        result.errorTitle = SOURCE_CONTROL_VERIFY_ERROR_CASE_TEXT_MAPPING[`${exception.code}`] || UNKNOWN_ERROR_TITLE;
      }
    }
    return result;
  };

  verifyBranch = async (params: SourceControlInfoRequestDTO) => {
    const result: SourceControlResult = {};
    const { token, type, repository, branch, site } = params;
    const sourceControlType = this.getSourceControlApiType(type);
    try {
      const response = await this.axiosInstance.post(
        `/source-control/${sourceControlType.toLocaleLowerCase()}/repos/branches/verify`,
        {
          token,
          repository,
          branch,
          site,
        },
      );
      result.code = response.status;
    } catch (e) {
      if (isAppError(e)) {
        const exception = e as IAppError;
        result.code = exception.code;
        result.errorTitle = SOURCE_CONTROL_VERIFY_ERROR_CASE_TEXT_MAPPING[`${exception.code}`] || UNKNOWN_ERROR_TITLE;
      }
    }
    return result;
  };

  getOrganization = async (
    params: SourceControlGetOrganizationRequestDTO,
  ): Promise<ISourceControlGetOrganizationResponseDTO> => {
    const { token, type, site } = params;
    const sourceControlType = this.getSourceControlApiType(type);
    const result: ISourceControlGetOrganizationResponseDTO = {
      code: null,
      data: undefined,
      errorTitle: '',
      errorMessage: '',
    };

    try {
      const response = await this.axiosInstance.post(
        `/source-control/${sourceControlType.toLocaleLowerCase()}/organizations`,
        {
          token,
          site,
        },
      );
      if (response.status === HttpStatusCode.Ok) {
        result.data = response.data as SourceControlGetOrganizationResponseDTO;
      }
      result.code = response.status;
    } catch (e) {
      if (isAppError(e)) {
        const exception = e as IAppError;
        result.code = exception.code;
        if (
          (exception.code as number) >= HttpStatusCode.BadRequest &&
          (exception.code as number) < HttpStatusCode.InternalServerError
        ) {
          result.errorTitle = SOURCE_CONTROL_CONFIG_TITLE;
        } else {
          result.errorTitle = UNKNOWN_ERROR_TITLE;
        }
      }

      result.errorMessage = SOURCE_CONTROL_ERROR_MESSAGE;
    }

    return result;
  };

  getRepo = async (params: SourceControlGetRepoRequestDTO): Promise<SourceControlGetRepoResponseDTO> => {
    const { token, organization, type, endTime, site } = params;
    const sourceControlType = this.getSourceControlApiType(type);
    let result: SourceControlGetRepoResponseDTO = {
      name: [],
    };
    const response = await this.axiosInstance.post(`/source-control/${sourceControlType.toLocaleLowerCase()}/repos`, {
      token,
      organization,
      endTime,
      site,
    });
    if (response.status === HttpStatusCode.Ok) {
      result = response.data as SourceControlGetRepoResponseDTO;
    }
    return result;
  };

  getBranch = async (params: SourceControlGetBranchRequestDTO): Promise<ISourceControlGetBranchResponseDTO> => {
    const { token, organization, type, repo, site } = params;
    const sourceControlType = this.getSourceControlApiType(type);
    const result: ISourceControlGetBranchResponseDTO = {
      code: null,
      data: undefined,
      errorTitle: '',
      errorMessage: '',
    };

    try {
      const response = await this.axiosInstance.post(
        `/source-control/${sourceControlType.toLocaleLowerCase()}/branches`,
        {
          token,
          organization,
          repo,
          site,
        },
      );
      if (response.status === HttpStatusCode.Ok) {
        result.data = response.data as SourceControlGetBranchResponseDTO;
      }
      result.code = response.status;
    } catch (e) {
      if (isAppError(e)) {
        const exception = e as IAppError;
        result.code = exception.code;
        if (
          (exception.code as number) >= HttpStatusCode.BadRequest &&
          (exception.code as number) < HttpStatusCode.InternalServerError
        ) {
          result.errorTitle = SOURCE_CONTROL_CONFIG_TITLE;
        } else {
          result.errorTitle = UNKNOWN_ERROR_TITLE;
        }
      }

      result.errorMessage = SOURCE_CONTROL_ERROR_MESSAGE;
    }

    return result;
  };

  getCrew = async (params: SourceControlGetCrewRequestDTO): Promise<SourceControlGetCrewResponseDTO> => {
    const { token, organization, type, repo, branch, endTime, startTime, site } = params;
    const sourceControlType = this.getSourceControlApiType(type);
    let result: SourceControlGetCrewResponseDTO = {
      crews: [],
    };
    const response = await this.axiosInstance.post(`/source-control/${sourceControlType.toLocaleLowerCase()}/crews`, {
      token,
      organization,
      repo,
      branch,
      startTime,
      endTime,
      site,
    });
    if (response.status === HttpStatusCode.Ok) {
      result = response.data as SourceControlGetCrewResponseDTO;
    }
    return result;
  };
}

export const sourceControlClient = new SourceControlClient();
