export type TCrews = string[];
export interface IBoard {
  crews: TCrews;
}
export interface IPipeline {
  crews: TCrews;
}

export interface IMetricsInitialValues {
  board: IBoard;
  pipeline: IPipeline;
}
