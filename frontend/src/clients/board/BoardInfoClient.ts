import HttpClient from '@src/clients/CustomHttpClient';
import { BoardInfoRequestDTO } from '@src/clients/board/dto/request';

export const boardInfoClient = (data: BoardInfoRequestDTO) => {
  return HttpClient().post(`/board/${data.type.toLowerCase()}/info`, data);
};
