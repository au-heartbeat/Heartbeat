import { sourceControlSchema } from '@src/containers/ConfigStep/Form/schema';
import { SourceControlTypes } from '@src/constants/resources';

describe('sourceControlSchema', () => {
  it('should validate regular github token with regex pattern', async () => {
    const validGitHubData = {
      type: SourceControlTypes.GitHub,
      token: 'ghp_' + 'a'.repeat(36), // Matches GITHUB_TOKEN regex: ghp_ + 36 alphanumeric chars
    };

    await expect(sourceControlSchema.validate(validGitHubData)).resolves.toEqual(validGitHubData);
  });

  it('should reject invalid github token format', async () => {
    const invalidGitHubData = {
      type: SourceControlTypes.GitHub,
      token: 'invalid-token',
    };

    await expect(sourceControlSchema.validate(invalidGitHubData)).rejects.toThrow();
  });

  it('should validate github enterprise without token regex requirement', async () => {
    const validGitHubEnterpriseData = {
      type: SourceControlTypes.GitHubEnterprise,
      site: 'https://github.mycompany.com',
      token: 'any-enterprise-token', // Doesn't need to match GitHub regex
    };

    await expect(sourceControlSchema.validate(validGitHubEnterpriseData)).resolves.toEqual(validGitHubEnterpriseData);
  });

  it('should require site field for github enterprise', async () => {
    const invalidGitHubEnterpriseData = {
      type: SourceControlTypes.GitHubEnterprise,
      token: 'any-enterprise-token',
      // Missing site field
    };

    await expect(sourceControlSchema.validate(invalidGitHubEnterpriseData)).rejects.toThrow();
  });

  it('should not require site field for regular github', async () => {
    const validGitHubData = {
      type: SourceControlTypes.GitHub,
      token: 'ghp_' + 'a'.repeat(36), // Matches GITHUB_TOKEN regex
      // site field is optional for regular GitHub
    };

    await expect(sourceControlSchema.validate(validGitHubData)).resolves.toEqual(validGitHubData);
  });
});
