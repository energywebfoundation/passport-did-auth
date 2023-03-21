module.exports = {
  branches: [
    {
      name: 'master',
      channel: 'latest',
    },
    {
      name: 'develop',
      prerelease: 'alpha',
      channel: 'canary',
    },
  ],
  repositoryUrl: 'git@github.com:energywebfoundation/passport-did-auth.git',
  extends: '@energyweb/semantic-release-config',
};
