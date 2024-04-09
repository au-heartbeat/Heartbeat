import { IBoardConfigData } from '@src/containers/ConfigStep/Form/schema';

export const defaultValues: IBoardConfigData = {
  board: {
    type: 'jira',
    boardId: '',
    email: '',
    site: '',
    token: '',
  },
};
