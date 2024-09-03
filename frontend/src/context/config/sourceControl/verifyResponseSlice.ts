export interface ISourceControlVerifyResponse {
  repoList: ISourceControlTree;
}

export interface ISourceControlTree {
  name: string;
  value: string;
  children: ISourceControlTree[];
}
export interface ISourceControlLeaf {
  parents: {
    name: string;
    value: string;
  }[];
  names: string[];
}

export const initSourceControlVerifyResponseState: ISourceControlVerifyResponse = {
  repoList: { name: 'root', value: '-1', children: [] },
};
