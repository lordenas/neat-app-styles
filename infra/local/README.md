# Local subdomains

This folder contains local reverse proxy configurations for running all Numlix apps on one domain family:

- `numlix.local` -> `numlix-main` (`localhost:3000`)
- `panel.numlix.local` -> `numlix-panel` (`localhost:8081`)
- `admin.numlix.local` -> `numlix-admin` (`localhost:8082`)
- `api.numlix.local` -> `calc-hub-back` (`localhost:3001`)

## Prerequisites

1. Add hosts:

```txt
127.0.0.1 numlix.local panel.numlix.local admin.numlix.local api.numlix.local
```

2. Copy env files:

```bash
cp apps/numlix-main/.env.example apps/numlix-main/.env.local
cp apps/numlix-panel/.env.example apps/numlix-panel/.env
cp apps/numlix-admin/.env.example apps/numlix-admin/.env
cp apps/calc-hub-back/.env.example apps/calc-hub-back/.env
```

3. Run apps:

```bash
npm run dev:numlix-main
npm run dev:numlix-panel
npm run dev:numlix-admin
cd apps/calc-hub-back && npm run start:dev
```

4. Start a reverse proxy:

- Caddy: use `infra/local/Caddyfile`.
- Nginx: use `infra/local/nginx.conf`.
