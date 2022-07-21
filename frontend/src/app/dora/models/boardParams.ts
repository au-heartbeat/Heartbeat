import { TargetField } from '../types/board';
import { BOARD_TYPE } from '../utils/constant';

export class BoardParams {
  type: string;
  token: string;
  site: string;
  projectKey: string;
  teamName: string;
  teamId: string;
  doneColumn: string[];
  treatFlagCardAsBlock: boolean;
  boardColumns: {
    name: string;
    value: string;
  };
  users: string[];
  targetFields: TargetField[];
  boardId: string;

  constructor({
    type,
    token,
    site,
    projectKey,
    teamName,
    teamId,
    email,
    boardId,
  }: {
    type: string;
    token: string;
    site: string;
    projectKey: string;
    teamName: string;
    teamId: string;
    email: string;
    boardId: string;
  }) {
<<<<<<< HEAD
    this.type = type.toLocaleLowerCase();
    this.token = type.toLocaleLowerCase() === BOARD_TYPE.JIRA ? this.generateBasicToken(token, email) : token;
=======
    this.type = type.toLowerCase();
    this.token = type.toLowerCase() === BOARD_TYPE.JIRA ? this.generateBasicToken(token, email) : token;
>>>>>>> 272265c (fix: add toLowerCase() to get rid of 401 error)
    this.site = site;
    this.projectKey = projectKey;
    this.teamName = teamName;
    this.teamId = teamId;
    this.boardId = boardId;
  }

  generateBasicToken(token: string, email: string) {
    return `Basic ${btoa(`${email}:${token}`)}`;
  }
}
