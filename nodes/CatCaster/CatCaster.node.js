async function catcasterRequest(credentials, method, path, body, extraHeaders = {}) {
  const baseUrl = (credentials.baseUrl || 'https://www.catcaster.com').replace(/\/$/, '');
  const headers = {
    Authorization: `Bearer ${credentials.apiKey}`,
    Accept: 'application/json',
    ...extraHeaders,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.error?.message || json?.error || res.statusText;
    throw new Error(`CatCaster API ${res.status}: ${message}`);
  }
  return json;
}

class CatCaster {
  description = {
    displayName: 'CatCaster',
    name: 'catCaster',
    icon: 'fa:share-alt',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the CatCaster public API',
    defaults: { name: 'CatCaster' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'catCasterApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Project', value: 'project' },
          { name: 'Post', value: 'post' },
        ],
        default: 'post',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['project'] } },
        options: [{ name: 'List', value: 'list' }],
        default: 'list',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['post'] } },
        options: [
          { name: 'List', value: 'list' },
          { name: 'Get', value: 'get' },
          { name: 'Create Draft', value: 'createDraft' },
          { name: 'Schedule', value: 'schedule' },
          { name: 'Publish', value: 'publish' },
        ],
        default: 'list',
      },
      {
        displayName: 'Project ID',
        name: 'projectId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['list', 'createDraft'],
          },
        },
        description: 'Workspace / project UUID',
      },
      {
        displayName: 'Post ID',
        name: 'postId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['get', 'schedule', 'publish'],
          },
        },
      },
      {
        displayName: 'Draft Body (JSON)',
        name: 'draftJson',
        type: 'json',
        default: '{\n  "projectId": "",\n  "content": "Hello from n8n"\n}',
        displayOptions: {
          show: { resource: ['post'], operation: ['createDraft'] },
        },
      },
      {
        displayName: 'Schedule Body (JSON)',
        name: 'scheduleJson',
        type: 'json',
        default: '{\n  "scheduledAt": "2026-12-01T12:00:00.000Z"\n}',
        displayOptions: {
          show: { resource: ['post'], operation: ['schedule'] },
        },
      },
      {
        displayName: 'Publish Body (JSON)',
        name: 'publishJson',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: { resource: ['post'], operation: ['publish'] },
        },
      },
      {
        displayName: 'Idempotency Key',
        name: 'idempotencyKey',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['createDraft', 'schedule', 'publish'],
          },
        },
      },
    ],
  };

  async execute() {
    const items = this.getInputData();
    const returnData = [];
    const credentials = await this.getCredentials('catCasterApi');

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i);
      const operation = this.getNodeParameter('operation', i);
      let response;

      if (resource === 'project' && operation === 'list') {
        response = await catcasterRequest(credentials, 'GET', '/api/v1/projects');
      } else if (resource === 'post') {
        if (operation === 'list') {
          const projectId = this.getNodeParameter('projectId', i);
          const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
          response = await catcasterRequest(credentials, 'GET', `/api/v1/posts${qs}`);
        } else if (operation === 'get') {
          const postId = this.getNodeParameter('postId', i);
          response = await catcasterRequest(credentials, 'GET', `/api/v1/posts/${postId}`);
        } else if (operation === 'createDraft') {
          const body = this.getNodeParameter('draftJson', i);
          const idempotencyKey = this.getNodeParameter('idempotencyKey', i);
          const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
          response = await catcasterRequest(credentials, 'POST', '/api/v1/drafts', body, headers);
        } else if (operation === 'schedule') {
          const postId = this.getNodeParameter('postId', i);
          const body = this.getNodeParameter('scheduleJson', i);
          const idempotencyKey = this.getNodeParameter('idempotencyKey', i);
          const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
          response = await catcasterRequest(
            credentials,
            'POST',
            `/api/v1/posts/${postId}/schedule`,
            body,
            headers
          );
        } else if (operation === 'publish') {
          const postId = this.getNodeParameter('postId', i);
          const body = this.getNodeParameter('publishJson', i);
          const idempotencyKey = this.getNodeParameter('idempotencyKey', i);
          const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
          response = await catcasterRequest(
            credentials,
            'POST',
            `/api/v1/posts/${postId}/publish`,
            body,
            headers
          );
        } else {
          throw new Error(`Unknown post operation: ${operation}`);
        }
      } else {
        throw new Error(`Unknown resource/operation: ${resource}/${operation}`);
      }

      returnData.push({ json: response, pairedItem: { item: i } });
    }

    return [returnData];
  }
}

module.exports = { CatCaster };
