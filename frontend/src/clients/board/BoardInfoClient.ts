import { HttpClient } from '@src/clients/Httpclient';
import { BoardInfoRequestDTO } from '@src/clients/board/dto/request';

export class BoardInfoClient extends HttpClient {
  getBoardInfo = async (params: BoardInfoRequestDTO) => {
    return this.axiosInstance.post(`/boards/${params.type.toLowerCase()}/info`, params);
  };
}

export const boardInfoClient = new BoardInfoClient();
