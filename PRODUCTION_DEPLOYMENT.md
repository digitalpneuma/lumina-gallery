# Production Deployment Guide for VPS

This guide covers deploying Photo Gallery to a Linux VPS (Ubuntu/Debian).

## Prerequisites

- Ubuntu/Debian VPS with root or sudo access
- Node.js 20+ installed
- nginx installed (for reverse proxy)
- Domain name pointed to your VPS
- SSH access to your server

## Step 1: Prepare Your Server

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install nginx
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Create Application User (Optional but Recommended)
```bash
sudo useradd -m -s /bin/bash photoapp
sudo su - photoapp
```

## Step 2: Deploy Application Code

### Option A: Using Git (Recommended)
```bash
cd ~
git clone https://github.com/your-username/lumina-gallery.git photo-gallery
cd photo-gallery
```

### Option B: Upload via SCP
```bash
# On your local machine
scp -r /path/to/lumina-gallery user@your-vps-ip:~/photo-gallery
```

## Step 3: Configure Environment

### Create Production Environment File
```bash
cd ~/photo-gallery
cp .env.example .env.production
nano .env.production
```

Update with your production values:
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
JWT_SECRET=<generate-secure-random-string>
DATABASE_PATH=./database.sqlite
UPLOADS_DIR=./uploads
MAX_FILE_SIZE=52428800
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

## Step 4: Build Application

### Install Dependencies
```bash
npm ci --production=false
```

### Build for Production
```bash
npm run build
```

This will:
- Build the React frontend
- Bundle the Express backend
- Create optimized production files in `dist/`

## Step 5: Configure PM2

Create PM2 ecosystem file:
```bash
nano ecosystem.config.cjs
```

Add the following:
```javascript
module.exports = {
  apps: [{
    name: 'photo-gallery',
    script: './dist/index.cjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '.env.production',
    error_file: 'logs/error.log',
    out_file: 'logs/output.log',
    time: true,
  }]
};
```

### Create logs directory
```bash
mkdir -p logs
```

### Start Application
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Follow the PM2 startup command instructions to enable auto-start on reboot.

## Step 6: Configure nginx Reverse Proxy

### Create nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/photo-gallery
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/photo-gallery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: Setup SSL with Let's Encrypt

### Install Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically update your nginx configuration for HTTPS.

## Step 8: Configure Firewall

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

## Step 9: Set File Permissions

```bash
cd ~/photo-gallery
chmod -R 755 .
mkdir -p uploads
chmod -R 777 uploads
chmod 666 database.sqlite  # If it exists
```

## Step 10: First Login & Security

1. Visit `https://yourdomain.com`
2. Login with default credentials: `admin` / `admin`
3. **IMMEDIATELY change the admin password!**

## Monitoring & Maintenance

### View Application Logs
```bash
pm2 logs photo-gallery
```

### Check Application Status
```bash
pm2 status
```

### Restart Application
```bash
pm2 restart photo-gallery
```

### Update Application
```bash
cd ~/photo-gallery
git pull
npm ci --production=false
npm run build
pm2 restart photo-gallery
```

## Backup Strategy

### Automated Backup Script
Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/photoapp/backups"
APP_DIR="/home/photoapp/photo-gallery"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database and uploads
tar -czf $BACKUP_DIR/photo-gallery-$DATE.tar.gz \
  -C $APP_DIR database.sqlite uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "photo-gallery-*.tar.gz" -mtime +7 -delete

echo "Backup completed: photo-gallery-$DATE.tar.gz"
```

Make executable and add to crontab:
```bash
chmod +x backup.sh
crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /home/photoapp/backup.sh
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs photo-gallery --lines 50

# Check if port is in use
sudo lsof -i :3001

# Restart application
pm2 restart photo-gallery
```

### Database Locked Error
```bash
cd ~/photo-gallery
chmod 666 database.sqlite
chmod 777 .
```

### Upload Errors
```bash
# Ensure uploads directory has correct permissions
chmod -R 777 ~/photo-gallery/uploads
```

### nginx Errors
```bash
# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Performance Optimization

### Enable gzip Compression in nginx
Add to nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### Add Caching Headers
Add to nginx location block:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Checklist

- [ ] Changed default admin password
- [ ] Generated secure JWT_SECRET
- [ ] Configured firewall (UFW)
- [ ] SSL certificate installed
- [ ] Regular backups configured
- [ ] Application running as non-root user
- [ ] File permissions properly set
- [ ] Server OS updated regularly

## Support

For issues specific to this application, check the logs:
- Application: `pm2 logs photo-gallery`
- nginx: `sudo tail -f /var/log/nginx/error.log`
- System: `sudo journalctl -xe`
