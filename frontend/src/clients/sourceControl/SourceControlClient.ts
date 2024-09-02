import {
  ISourceControlGetBranchResponseDTO,
  ISourceControlGetCrewResponseDTO,
  ISourceControlGetOrganizationResponseDTO,
  ISourceControlGetRepoResponseDTO,
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
  verifyToken = async (params: SourceControlVerifyRequestDTO) => {
    const result: SourceControlResult = {};
    const { token, type } = params;
    try {
      const response = await this.axiosInstance.post(`/source-control/${type.toLocaleLowerCase()}/verify`, {
        token,
      });
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
    const { token, type, repository, branch } = params;
    try {
      const response = await this.axiosInstance.post(
        `/source-control/${type.toLocaleLowerCase()}/repos/branches/verify`,
        {
          token,
          repository,
          branch,
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
    const { token, type } = params;
    const result: ISourceControlGetOrganizationResponseDTO = {
      code: null,
      data: undefined,
      errorTitle: '',
      errorMessage: '',
    };

    try {
      const response = await this.axiosInstance.post(`/source-control/${type.toLocaleLowerCase()}/organizations`, {
        token,
      });
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

  getRepo = async (params: SourceControlGetRepoRequestDTO): Promise<ISourceControlGetRepoResponseDTO> => {
    const { token, organization, type, endTime } = params;
    const result: ISourceControlGetRepoResponseDTO = {
      code: null,
      data: undefined,
      errorTitle: '',
      errorMessage: '',
    };

    try {
      const response = await this.axiosInstance.post(`/source-control/${type.toLocaleLowerCase()}/repos`, {
        token,
        organization,
        endTime,
      });
      if (response.status === HttpStatusCode.Ok) {
        result.data = response.data as SourceControlGetRepoResponseDTO;
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

  getBranch = async (params: SourceControlGetBranchRequestDTO): Promise<ISourceControlGetBranchResponseDTO> => {
    const { token, organization, type, repo } = params;
    const result: ISourceControlGetBranchResponseDTO = {
      code: null,
      data: undefined,
      errorTitle: '',
      errorMessage: '',
    };

    try {
      const response = await this.axiosInstance.post(`/source-control/${type.toLocaleLowerCase()}/branches`, {
        token,
        organization,
        repo,
      });
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

  getCrew = async (params: SourceControlGetCrewRequestDTO): Promise<ISourceControlGetCrewResponseDTO> => {
    const { token, organization, type, repo, branch, endTime, startTime } = params;
    const result: ISourceControlGetCrewResponseDTO = {
      code: null,
      data: undefined,
      errorTitle: '',
      errorMessage: '',
    };

    try {
      const response = await this.axiosInstance.post(`/source-control/${type.toLocaleLowerCase()}/crews`, {
        token,
        organization,
        repo,
        branch,
        startTime,
        endTime,
      });
      if (response.status === HttpStatusCode.Ok) {
        result.data = response.data as SourceControlGetCrewResponseDTO;
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
}

export const sourceControlClient = new SourceControlClient();
