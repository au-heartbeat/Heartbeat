import sourceControlReducer, {
  updateSourceControl,
  updateSourceControlVerifiedResponse,
} from '@src/context/config/configSlice';
import { MOCK_GITHUB_ORGANIZATION, MOCK_GITHUB_REPO } from '../fixtures';
import initialConfigState from '../initialConfigState';

describe('sourceControl reducer', () => {
  it('should update sourceControl fields when change sourceControl fields input', () => {
    const sourceControl = sourceControlReducer(initialConfigState, updateSourceControl({ token: 'token' }));

    expect(sourceControl.sourceControl.config.token).toEqual('token');
  });

  describe('sourceControlVerifyResponse reducer', () => {
    it('should show empty array when handle initial state', () => {
      const sourceControlVerifyResponse = sourceControlReducer(undefined, { type: 'unknown' });

      expect(sourceControlVerifyResponse.sourceControl.verifiedResponse.repoList).toEqual({
        children: [],
        name: 'root',
        value: '-1',
      });
    });

    it('should store sourceControl data when get network sourceControl verify response', () => {
      let sourceControlResponse = sourceControlReducer(
        initialConfigState,
        updateSourceControlVerifiedResponse(MOCK_GITHUB_ORGANIZATION),
      );

      expect(sourceControlResponse.sourceControl.verifiedResponse.repoList).toEqual({
        name: 'root',
        value: '-1',
        children: [
          { name: 'organization', value: 'test-org1', children: [] },
          { name: 'organization', value: 'test-org2', children: [] },
        ],
      });

      sourceControlResponse = sourceControlReducer(
        sourceControlResponse,
        updateSourceControlVerifiedResponse(MOCK_GITHUB_REPO),
      );
      expect(sourceControlResponse.sourceControl.verifiedResponse.repoList).toEqual({
        name: 'root',
        value: '-1',
        children: [
          {
            name: 'organization',
            value: 'test-org1',
            children: [
              {
                name: 'repo',
                value: 'test-repo',
                children: [],
              },
            ],
          },
          { name: 'organization', value: 'test-org2', children: [] },
        ],
      });
    });
  });
});
