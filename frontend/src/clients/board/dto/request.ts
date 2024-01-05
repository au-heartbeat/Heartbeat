export interface BoardRequestDTO {
  token: string
  type: string
  site: string
  startTime: number | null
  endTime: number | null
  boardId: string
}
