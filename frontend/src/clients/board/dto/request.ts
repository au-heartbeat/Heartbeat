import { TDateRange } from '@src/context/config/configSlice';

export interface BoardRequestDTO {
  token: string;
  type: string;
  site: string;
  email: string;
  boardId: string;
}

export interface BoardInfoRequestDTO {
  token: string;
  type: string;
  site: string;
  email: string;
  startTime: string | null;
  endTime: string | null;
  boardId: string;
  projectKey: string;
}

export interface BoardInfoConfigDTO {
  token: string;
  type: string;
  site: string;
  email: string;
  dateRange: TDateRange;
  boardId: string;
  projectKey: string;
}
