# n8n-nodes-catcaster

Community nodes for [CatCaster](https://www.catcaster.com) — call the public REST API (`/api/v1`) from n8n workflows.

**Canonical open-source repo:** [github.com/picaro/catcaster-n8n](https://github.com/picaro/catcaster-n8n) (this directory is a monorepo mirror).

## Credentials

Create an API key in **Settings → Developer** on CatCaster (or use a workspace-scoped key from your automation account).

| Field | Value |
| --- | --- |
| API Key | `cc_live_…` or `sk_live_…` bearer token |
| Base URL | `https://www.catcaster.com` (default) |

## Install (self-hosted n8n)

```bash
cd ~/.n8n/custom
npm install https://github.com/picaro/catcaster-n8n
npm run build --prefix node_modules/n8n-nodes-catcaster
# Restart n8n, then enable the node under Settings → Community nodes
```

Publish to npm (maintainers):

```bash
npm run build
npm publish --access public
```

Then in n8n:

```bash
npm install n8n-nodes-catcaster
```

## Outbound webhooks (post published / failed)

CatCaster **pushes** to your HTTPS URL — use n8n’s **Webhook** trigger node:

1. Add a Webhook trigger in n8n and copy the production URL.
2. In CatCaster **Settings → Developer → Outbound Webhooks**, register that URL.
3. Verify `CatCaster-Signature: t=…,v1=…` with your signing secret.

See [CatCaster n8n integration guide](https://www.catcaster.com/integrations/n8n).

## Node operations

**CatCaster** node (resource **Post**):

- List posts
- Get post
- Create draft
- Schedule post
- Publish post

**Project** resource:

- List projects (workspaces)

Build from source: `npm run build` in this directory.
