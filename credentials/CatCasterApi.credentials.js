class CatCasterApi {
  name = 'catCasterApi';

  displayName = 'CatCaster API';

  documentationUrl = 'https://www.catcaster.com/developers';

  properties = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://www.catcaster.com',
      description: 'CatCaster origin (no trailing slash)',
    },
  ];
}

module.exports = { CatCasterApi };
