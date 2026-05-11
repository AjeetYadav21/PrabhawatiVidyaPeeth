# Prabhawati Vidyapeeth Deployment

Deploy `PrabhawatiVidyaPeeth` on the same Nexspire server using the existing `PM2 + Cloudflare Tunnel` pattern.

## Fit With Current Nexspire Hosting

- `PrabhawatiVidyaPeeth` is a server-rendered Next.js app.
- It uses MongoDB, admin auth, file uploads, and Razorpay webhooks.
- Because of that, it should run as a Node process on the server behind Cloudflare Tunnel.
- It should not be deployed like the static Vite apps that go to Cloudflare Pages.

## Recommended Runtime Shape

- App process: PM2-managed Next server
- Port: one dedicated localhost port, for example `3030`
- Public hostname:
  - `prabhawatividyapeeth.in`
  - `www.prabhawatividyapeeth.in`
- Reverse proxy: existing `cloudflared` tunnel on the same server
- Database: MongoDB reachable from the server

## Required Environment

Create `PrabhawatiVidyaPeeth/.env.local` on the server with real values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/pvp
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@prabhawatividyapeeth.in
ADMIN_PASSWORD=replace-this-password
NEXT_PUBLIC_SITE_URL=https://prabhawatividyapeeth.in

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_WEBHOOK_SECRET=...

SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Prabhawati Vidyapeeth <noreply@prabhawatividyapeeth.in>
ADMIN_NOTIFICATION_EMAIL=admin@prabhawatividyapeeth.in
```

## Server Steps

```bash
cd /var/www/html
git clone <repo-url> PrabhawatiVidyaPeeth
cd PrabhawatiVidyaPeeth
npm install
npm run seed
npm run build
```

Start it with PM2:

```bash
cd /var/www/html/PrabhawatiVidyaPeeth
PORT=3030 NODE_ENV=production pm2 start node_modules/next/dist/bin/next --name prabhawati-vidyapeeth -- start -p 3030 -H 0.0.0.0
pm2 save
```

Useful checks:

```bash
pm2 status
pm2 logs prabhawati-vidyapeeth --lines 200
curl -I http://127.0.0.1:3030
```

## Cloudflare Tunnel

Add both hostnames to the existing tunnel config on the server:

```yaml
ingress:
  - hostname: prabhawatividyapeeth.in
    service: http://localhost:3030
  - hostname: www.prabhawatividyapeeth.in
    service: http://localhost:3030
  - service: http_status:404
```

Then restart the tunnel service:

```bash
sudo systemctl restart cloudflared
```

## Cloudflare DNS

Point both records at the same tunnel:

- `prabhawatividyapeeth.in` -> proxied record to the tunnel target
- `www.prabhawatividyapeeth.in` -> proxied record to the tunnel target

In the current Nexspire model, the effective target is:

```text
<tunnel-id>.cfargotunnel.com
```

## Persistence Notes

This app writes files to disk. Keep these directories persistent and writable by the PM2 user:

- `public/images/uploads`
- `uploads/registrations`

Those files are used for:

- CMS image uploads
- registration photo uploads
- registration marksheet uploads

## External Callbacks

If Razorpay is enabled, configure the webhook URL as:

```text
https://prabhawatividyapeeth.in/api/razorpay/webhook
```

## Smoke Test Checklist

After deploy, verify:

1. `https://prabhawatividyapeeth.in/` loads.
2. `https://www.prabhawatividyapeeth.in/` resolves to the same app.
3. `/admin/login` works.
4. CMS image upload works.
5. registration form submits.
6. registration file uploads are visible in admin.
7. contact form stores submissions.
8. Razorpay create-order and verify flow works if payment is enabled.

## Current Workspace Verification

Local verification completed before writing this guide:

- `npm run build` passes in `PrabhawatiVidyaPeeth`
- upload routes use filesystem paths under the project root
- admin auth is cookie-based and works under HTTPS
- one non-blocking Turbopack NFT tracing warning still appears for `src/app/api/admin/upload/[filename]/route.ts`
