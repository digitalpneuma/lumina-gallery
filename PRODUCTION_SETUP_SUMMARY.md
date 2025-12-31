# Production Setup Summary

This document summarizes all production deployment preparations made to the Photo Gallery application.

## Files Created/Modified

### New Files Created

1. **PRODUCTION_DEPLOYMENT.md**
   - Complete step-by-step VPS deployment guide
   - Covers server setup, nginx configuration, SSL, and monitoring
   - Includes troubleshooting and backup strategies

2. **DEPLOYMENT_CHECKLIST.md**
   - Quick checklist for deployments
   - Pre-deployment, deployment, and post-deployment steps
   - Success criteria and rollback plan

3. **ecosystem.config.cjs**
   - PM2 process manager configuration
   - Includes logging, auto-restart, and environment settings
   - Ready to use with `npm run pm2:start`

4. **nginx.conf.example**
   - nginx reverse proxy configuration template
   - Includes SSL/HTTPS setup comments
   - Security headers and caching rules

### Modified Files

1. **.env.production**
   - Added HOST environment variable (0.0.0.0 for VPS)
   - Added comprehensive comments
   - Added DATABASE_PATH and UPLOADS_DIR variables
   - Added MAX_FILE_SIZE configuration

2. **.env.example**
   - Updated to match production environment variables
   - Added helpful comments for each variable
   - Serves as template for both development and production

3. **server/index.ts**
   - Updated to use HOST environment variable
   - Defaults to 0.0.0.0 in production (accepts external connections)
   - Defaults to localhost in development (secure)
   - Better logging shows host:port

4. **package.json**
   - Added PM2 convenience scripts:
     - `npm run pm2:start` - Start with PM2
     - `npm run pm2:stop` - Stop application
     - `npm run pm2:restart` - Restart application
     - `npm run pm2:logs` - View logs
     - `npm run pm2:status` - Check status
   - Added `npm run start:prod` alias

5. **.gitignore**
   - Added database files (*.sqlite, *.db)
   - Added logs/ directory
   - Added PM2 files
   - Ensures sensitive data not committed

## Environment Variables

### Production Environment Variables (.env.production)

```env
NODE_ENV=production          # Run in production mode
PORT=3001                    # Application port
HOST=0.0.0.0                # Accept external connections
JWT_SECRET=<secure-random>  # Must be changed!
DATABASE_PATH=./database.sqlite
UPLOADS_DIR=./uploads
MAX_FILE_SIZE=52428800      # 50MB in bytes
```

### Key Changes from Development

| Variable | Development | Production |
|----------|-------------|------------|
| HOST | localhost | 0.0.0.0 |
| NODE_ENV | development | production |
| JWT_SECRET | (default) | Must be unique & secure |

## Security Improvements

1. **Host Binding**
   - Development: Binds to localhost only (secure)
   - Production: Binds to 0.0.0.0 (allows external access)
   - Configurable via HOST environment variable

2. **JWT Secret**
   - Must be changed in production
   - Generate with: `openssl rand -base64 32`
   - Never commit to git

3. **File Permissions**
   - Uploads directory: 777 (writable)
   - Database: 666 (readable/writable)
   - Application files: 755 (default)

4. **nginx Security Headers**
   - X-Frame-Options: SAMEORIGIN
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection enabled
   - Referrer-Policy configured

## Deployment Workflow

### Quick Start
```bash
# 1. Build application
npm run build

# 2. Start with PM2
npm run pm2:start

# 3. Check status
npm run pm2:status

# 4. View logs
npm run pm2:logs
```

### Full Deployment
See **PRODUCTION_DEPLOYMENT.md** for complete instructions.

### Using Checklist
Follow **DEPLOYMENT_CHECKLIST.md** step-by-step for foolproof deployment.

## PM2 Process Management

### Configuration
- **Name**: photo-gallery
- **Script**: ./dist/index.cjs
- **Instances**: 1
- **Auto-restart**: Yes
- **Max Memory**: 1GB
- **Logs**: logs/output.log, logs/error.log

### Common Commands
```bash
npm run pm2:start      # Start application
npm run pm2:stop       # Stop application
npm run pm2:restart    # Restart application
npm run pm2:logs       # View logs
npm run pm2:status     # Check status
pm2 save              # Save PM2 configuration
pm2 startup           # Enable startup on boot
```

## nginx Reverse Proxy

### Purpose
- Routes traffic from port 80/443 to application on port 3001
- Handles SSL/TLS termination
- Provides caching and compression
- Adds security headers

### Setup
```bash
# 1. Copy configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/photo-gallery

# 2. Edit with your domain
sudo nano /etc/nginx/sites-available/photo-gallery

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/photo-gallery /etc/nginx/sites-enabled/

# 4. Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate (automatically configures nginx)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal: sudo certbot renew --dry-run
```

## Backup Strategy

### What to Backup
1. Database: `database.sqlite`
2. Uploaded photos: `uploads/` directory
3. Environment configuration: `.env.production` (securely)

### Automated Backups
- Script provided in PRODUCTION_DEPLOYMENT.md
- Recommended: Daily at 2 AM via cron
- Retention: 7 days of backups
- Location: `/home/photoapp/backups/`

### Manual Backup
```bash
tar -czf backup-$(date +%Y%m%d).tar.gz database.sqlite uploads/
```

## Monitoring & Logs

### Application Logs
```bash
npm run pm2:logs              # Live logs
pm2 logs photo-gallery --lines 100  # Last 100 lines
```

### nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Logs
```bash
sudo journalctl -xe
```

## Performance Considerations

1. **PM2 Configuration**
   - Single instance (can scale to multiple if needed)
   - Auto-restart on crashes
   - Memory limit: 1GB (adjust based on usage)

2. **nginx Optimizations**
   - gzip compression enabled
   - Static asset caching (1 year)
   - Connection keep-alive

3. **Database**
   - SQLite suitable for small to medium deployments
   - Consider PostgreSQL for high traffic

## Troubleshooting

### Application Won't Start
```bash
npm run pm2:logs              # Check logs
sudo lsof -i :3001           # Check if port in use
npm run pm2:restart          # Restart
```

### Upload Errors
```bash
chmod -R 777 uploads         # Fix permissions
df -h                        # Check disk space
```

### Database Locked
```bash
chmod 666 database.sqlite    # Fix permissions
chmod 777 .                  # Parent directory writable
```

## Next Steps After Deployment

1. ✅ Change default admin password (admin/admin)
2. ✅ Verify uploads work
3. ✅ Test all features
4. ✅ Set up automated backups
5. ✅ Configure monitoring (optional)
6. ✅ Document any custom configurations

## Additional Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/
- **nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

## Support

For deployment issues:
1. Check PRODUCTION_DEPLOYMENT.md troubleshooting section
2. Review application logs: `npm run pm2:logs`
3. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify environment variables: `cat .env.production`

## Version History

- **v1.0.0** - Initial production setup
  - Environment configuration
  - PM2 integration
  - nginx reverse proxy
  - SSL/HTTPS support
  - Automated backups
  - Comprehensive documentation
