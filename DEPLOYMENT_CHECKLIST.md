# Deployment Checklist

Use this checklist when deploying to production.

## Pre-Deployment

- [ ] Generate secure JWT_SECRET: `openssl rand -base64 32`
- [ ] Update `.env.production` with production values
- [ ] Verify all environment variables are set correctly
- [ ] Run local build test: `npm run build`
- [ ] Commit all changes to git
- [ ] Tag release: `git tag v1.0.0 && git push --tags`

## Server Setup

- [ ] Node.js 20+ installed
- [ ] nginx installed and configured
- [ ] PM2 installed globally: `sudo npm install -g pm2`
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Domain DNS pointed to server IP
- [ ] SSL certificate obtained (Let's Encrypt)

## Deployment

- [ ] Clone/upload code to server
- [ ] Install dependencies: `npm ci --production=false`
- [ ] Build application: `npm run build`
- [ ] Configure `.env.production` on server
- [ ] Create logs directory: `mkdir -p logs`
- [ ] Set file permissions:
  ```bash
  chmod -R 755 .
  mkdir -p uploads
  chmod -R 777 uploads
  ```
- [ ] Start with PM2: `npm run pm2:start`
- [ ] Save PM2 configuration: `pm2 save`
- [ ] Enable PM2 startup: `pm2 startup` (follow instructions)
- [ ] Configure nginx reverse proxy
- [ ] Test nginx config: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx`

## Post-Deployment

- [ ] Access application via domain
- [ ] Login with admin/admin
- [ ] **IMMEDIATELY change admin password**
- [ ] Upload test photo
- [ ] Create test album
- [ ] Verify photo upload/download works
- [ ] Test dark mode toggle
- [ ] Test album cover selection
- [ ] Check PM2 status: `npm run pm2:status`
- [ ] Review logs: `npm run pm2:logs`

## Monitoring

- [ ] Set up automated backups (cron job)
- [ ] Configure monitoring (optional: UptimeRobot, etc.)
- [ ] Set up log rotation
- [ ] Document backup restoration process

## Security

- [ ] JWT_SECRET is secure and unique
- [ ] Default admin password changed
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] File permissions correct (755 for dirs, 644 for files, 777 for uploads)
- [ ] Server OS updated: `sudo apt update && sudo apt upgrade`

## Quick Commands Reference

```bash
# Build
npm run build

# Start with PM2
npm run pm2:start

# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Check status
npm run pm2:status

# Stop
npm run pm2:stop
```

## Troubleshooting

If something goes wrong:

1. Check PM2 logs: `npm run pm2:logs`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables: `cat .env.production`
4. Check file permissions: `ls -la`
5. Restart application: `npm run pm2:restart`
6. Test port availability: `sudo lsof -i :3001`

## Rollback Plan

If deployment fails:

1. Stop current version: `npm run pm2:stop`
2. Checkout previous tag: `git checkout v1.0.0-previous`
3. Rebuild: `npm run build`
4. Restart: `npm run pm2:restart`

## Success Criteria

✅ Application accessible via HTTPS
✅ Can login and change password
✅ Can create albums
✅ Can upload photos
✅ Can download photos
✅ Can set album covers
✅ Dark mode works
✅ PM2 shows app as "online"
✅ No errors in logs
