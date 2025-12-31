# Deploying Lumina Gallery to Hostinger

## Prerequisites
- Hostinger Business or Premium plan (Node.js support required)
- SSH access enabled in Hostinger control panel
- Domain configured

## Step 1: Prepare Your Local Project

1. **Build the project locally to test:**
   ```bash
   npm run build
   ```

2. **Update the JWT secret** in `.env.production`:
   ```
   JWT_SECRET=your-very-secure-random-string-here
   ```
   Generate a secure secret: `openssl rand -base64 32`

3. **Create a `.gitignore`** (if not exists):
   ```
   node_modules/
   dist/
   database.sqlite
   uploads/
   .env
   .env.production
   ```

## Step 2: Connect to Hostinger via SSH

1. **Get SSH credentials:**
   - Log into Hostinger
   - Go to **Hosting** → **Advanced** → **SSH Access**
   - Enable SSH and note your credentials

2. **Connect via SSH:**
   ```bash
   ssh username@your-domain.com -p 65002
   ```
   (Port might be different, check Hostinger dashboard)

## Step 3: Upload Your Project

### Option A: Using Git (Recommended)

1. **Initialize Git locally** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/your-username/lumina-gallery.git
   git branch -M main
   git push -u origin main
   ```

3. **Clone on Hostinger** (via SSH):
   ```bash
   cd ~/domains/your-domain.com/public_html
   git clone https://github.com/your-username/lumina-gallery.git
   cd lumina-gallery
   ```

### Option B: Using FTP/SFTP

1. Use FileZilla or similar FTP client
2. Upload all project files to `~/domains/your-domain.com/public_html/lumina-gallery/`
3. **Exclude:** `node_modules/`, `dist/`, `database.sqlite`, `uploads/`

## Step 4: Install Dependencies on Server

```bash
cd ~/domains/your-domain.com/public_html/lumina-gallery
npm install --production
```

## Step 5: Build the Project

```bash
npm run build
```

## Step 6: Configure Environment

Create `.env.production` on the server:

```bash
nano .env.production
```

Add:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secure-secret-from-step1
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

## Step 7: Setup Process Manager (PM2)

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file:**
   ```bash
   nano ecosystem.config.cjs
   ```

   Add:
   ```javascript
   module.exports = {
     apps: [{
       name: 'lumina-gallery',
       script: './dist/index.cjs',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       },
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
     }]
   };
   ```

3. **Start the application:**
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

4. **Check status:**
   ```bash
   pm2 status
   pm2 logs lumina-gallery
   ```

## Step 8: Configure Reverse Proxy (Apache/Nginx)

### For Apache (Most common on Hostinger):

1. **Create/edit .htaccess** in public_html:
   ```bash
   cd ~/domains/your-domain.com/public_html
   nano .htaccess
   ```

2. **Add proxy rules:**
   ```apache
   RewriteEngine On
   RewriteCond %{HTTP:Upgrade} websocket [NC]
   RewriteCond %{HTTP:Connection} upgrade [NC]
   RewriteRule ^(.*)$ "http://127.0.0.1:3001/$1" [P,L]

   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

   # Ensure proper headers
   Header always set Access-Control-Allow-Origin "*"
   Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"
   Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
   ```

## Step 9: Set Correct Permissions

```bash
cd ~/domains/your-domain.com/public_html/lumina-gallery
chmod -R 755 .
mkdir -p uploads
chmod -R 777 uploads
chmod 666 database.sqlite
```

## Step 10: Test Your Deployment

1. Visit `https://your-domain.com`
2. Login with: `admin` / `admin`
3. **Important:** Change the admin password immediately!

## Updating Your Site

When you make changes:

```bash
# On your local machine
git add .
git commit -m "Your update message"
git push

# On Hostinger via SSH
cd ~/domains/your-domain.com/public_html/lumina-gallery
git pull
npm install
npm run build
pm2 restart lumina-gallery
```

## Troubleshooting

### App not starting:
```bash
pm2 logs lumina-gallery --lines 100
```

### Check if port 3001 is listening:
```bash
netstat -tuln | grep 3001
```

### Restart the app:
```bash
pm2 restart lumina-gallery
```

### Clear PM2 logs:
```bash
pm2 flush
```

### Database locked error:
```bash
chmod 666 database.sqlite
chmod 777 .
```

## Security Checklist

- [ ] Changed default admin password
- [ ] Updated JWT_SECRET in .env.production
- [ ] Added .gitignore to exclude sensitive files
- [ ] Set correct file permissions (755 for directories, 644 for files)
- [ ] Uploads directory has write permissions (777)
- [ ] SSL certificate installed (Hostinger provides free SSL)

## Backup Strategy

### Backup uploads and database:
```bash
cd ~/domains/your-domain.com/public_html/lumina-gallery
tar -czf backup-$(date +%Y%m%d).tar.gz uploads/ database.sqlite
```

### Download backup:
```bash
scp -P 65002 username@your-domain.com:~/domains/your-domain.com/public_html/lumina-gallery/backup-*.tar.gz ~/Downloads/
```

## Support

For Hostinger-specific issues:
- Contact Hostinger support (they're very helpful!)
- Check Hostinger knowledge base for Node.js setup

For app issues:
- Check PM2 logs: `pm2 logs lumina-gallery`
- Check Apache error logs: `tail -f ~/logs/error.log`
