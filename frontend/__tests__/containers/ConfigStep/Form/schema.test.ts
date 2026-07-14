import { sourceControlSchema } from '@src/containers/ConfigStep/Form/schema';
import { SourceControlTypes } from '@src/constants/resources';

const GitHub_MOCK_TOKEN = 'GITHUB TOKEN';
describe('sourceControlSchema', () => {
  it('should require site when type is GitHubEnterprise', async () => {
    const result = await sourceControlSchema
      .validate({ type: SourceControlTypes.GitHubEnterprise, token: GitHub_MOCK_TOKEN }, { abortEarly: false })
      .catch((e) => e);

    expect(result.errors).toContain('GitHub host is required!');
  });

  it('should not require site when type is GitHub', async () => {
    const result = await sourceControlSchema.validate(
      { type: SourceControlTypes.GitHub, token: GitHub_MOCK_TOKEN },
      { abortEarly: false },
    );

    expect(result.token).toBe(GitHub_MOCK_TOKEN);
  });

  it('should not validate token with GitHub regex when type is GitHubEnterprise', async () => {
    const result = await sourceControlSchema.validate(
      { type: SourceControlTypes.GitHubEnterprise, site: 'https://github.internal.com', token: 'any-token-value' },
      { abortEarly: false },
    );

    expect(result.token).toBe('any-token-value');
  });

  it('should reject token not matching GitHub regex when type is GitHub', async () => {
    const result = await sourceControlSchema
      .validate({ type: SourceControlTypes.GitHub, token: 'invalid-token' }, { abortEarly: false })
      .catch((e) => e);

    expect(result.errors).toContain('Token is invalid!');
  });
});
