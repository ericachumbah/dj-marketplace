# DJ Marketplace - Deployment Guide

## Deployment Options

### 1. Vercel (Recommended for Next.js)

**Advantages:**
- One-click deployment
- Automatic scaling
- Edge functions support
- Preview deployments

**Steps:**

1. Push your code to GitHub
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. Connect to Vercel
```bash
npm install -g vercel
vercel
```

3. Set environment variables in Vercel dashboard
4. Database will be connected to your PostgreSQL instance

**Environment Variables for Vercel:**
- `MONGODB_URI` - MongoDB connection string (Atlas or self-hosted)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production domain
- `S3_ENDPOINT` - S3 or MinIO endpoint
- `S3_ACCESS_KEY`, `S3_SECRET_KEY` - S3 credentials
- `EMAIL_SERVER_*` - SMTP configuration
- OAuth credentials if needed

### 2. Docker Deployment

**Build image:**
```bash
docker build -t dj-marketplace:latest .
```

**Run container:**
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e NEXTAUTH_SECRET="..." \
  -e S3_ENDPOINT="..." \
  dj-marketplace:latest
```

**Using docker-compose:**
```bash
docker-compose up -d
```

### 3. Self-Hosted (VPS/EC2)

**Prerequisites:**
- Node.js 18+
- MongoDB (local or Atlas)
- Nginx or Apache (reverse proxy)
- PM2 or systemd for process management

**Installation:**

1. Clone repository
```bash
git clone <your-repo> /var/www/dj-marketplace
cd /var/www/dj-marketplace
```

2. Install dependencies
```bash
npm install
```

3. Setup environment
```bash
cp .env.example .env.production
# Edit .env.production with production values
```

4. Build application
```bash
npm run build
```

5. Database seed (MongoDB)
```bash
# Ensure MONGODB_URI is set
npx ts-node --esm scripts/seed.ts
```

6. Start with PM2
```bash
npm install -g pm2
pm2 start "npm start" --name "dj-marketplace"
pm2 save
pm2 startup
```

7. Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. Setup SSL with Let's Encrypt
```bash
certbot --nginx -d yourdomain.com
```

### 4. DigitalOcean App Platform

**Steps:**

1. Connect GitHub repository
2. Configure build command:
```bash
npm run build
```

3. Configure run command:
```bash
npm start
```

4. Set environment variables in dashboard
5. Deploy

### 5. AWS (EC2 + RDS + S3)

**Setup:**

1. Launch EC2 instance (Ubuntu 22.04)
2. Create RDS PostgreSQL instance
3. Create S3 bucket for file storage

**Installation on EC2:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Clone and setup app
git clone <your-repo> /var/www/dj-marketplace
cd /var/www/dj-marketplace
npm install
npm run build
```

**Environment Variables:**
```bash
export DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/djmarketplace"
export S3_ENDPOINT="https://s3.amazonaws.com"
export S3_REGION="us-east-1"
export NEXTAUTH_URL="https://yourdomain.com"
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

## Database Setup

This project now uses MongoDB (via Mongoose). For development you can use a local MongoDB instance or MongoDB Atlas for production.

**Local (Development):**
```bash
# macOS with Homebrew (MongoDB Community)
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Create / Configure database:**
Create a database and set the connection string in your environment as `MONGODB_URI`.

**Remote (Production):**
Use managed services such as MongoDB Atlas and set `MONGODB_URI` in your deployment environment.

### Seed the database

This project uses a seed script that runs using `ts-node`. To seed your MongoDB database run:

```bash
# Ensure MONGODB_URI is set, then:
npx ts-node --esm scripts/seed.ts
```

There are no Prisma migrations for MongoDB; the seed script and Mongoose models initialise the collections as needed.

## Storage Setup

### S3 Configuration

**AWS S3:**
1. Create IAM user with S3 permissions
2. Get access key and secret key
3. Create S3 bucket
4. Configure CORS

**MinIO (Self-hosted):**
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /minio_data --console-address ":9001"
```

## Email Setup

### Using Gmail

1. Enable 2FA on Gmail account
2. Generate App Password
3. Use in environment variables:
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=app-password
```

### Using SendGrid

1. Create SendGrid account
2. Generate API key
3. Use SMTP credentials:
```
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-api-key
```

## Monitoring & Logging

### Application Logging
```bash
# With PM2
pm2 logs dj-marketplace

# With Docker
docker logs container-id
```

### Performance Monitoring
- **Vercel Analytics** - Built-in with Vercel
- **DataDog** - Full-stack monitoring
- **New Relic** - APM and monitoring
- **Sentry** - Error tracking

### Database Monitoring
- **AWS CloudWatch** - For RDS
- **pgAdmin** - PostgreSQL management
- **DataGrip** - Database IDE

## Backup & Restore

### MongoDB Backup
```bash
# Full backup using mongodump
mongodump --uri="$MONGODB_URI" --archive=backup.archive

# Restore
mongorestore --uri="$MONGODB_URI" --archive=backup.archive --drop
```

### S3 Backup
```bash
# AWS CLI backup
aws s3 sync s3://djmarketplace ./backup/

# Automated with cron
0 2 * * * aws s3 sync s3://djmarketplace s3://djmarketplace-backup/
```

## SSL/HTTPS

### Let's Encrypt (Free)
```bash
# Certbot with Nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Certbot with Apache
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Cloudflare SSL (Free)
1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL in Cloudflare dashboard

## Performance Optimization

### CDN Setup
- **Cloudflare** - Free CDN and DDoS protection
- **AWS CloudFront** - CloudFront for S3
- **Bunny CDN** - Developer-friendly CDN

### Database Optimization
Use MongoDB tools and indexes for optimization. Example:
```javascript
// Create an index in Mongo shell or via Mongoose
db.users.createIndex({ email: 1 })
```

### Caching
- Next.js built-in caching (ISR)
- Redis for session cache
- Service Worker for offline

## Scaling

### Horizontal Scaling
- Load balancer (nginx, HAProxy)
- Multiple app instances
- Shared database
- Shared storage (S3)

### Vertical Scaling
- Larger instance type
- More CPU/RAM
- Faster disk (SSD)

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] DDoS protection (Cloudflare)
- [ ] Database encryption at rest
- [ ] Firewall rules configured
- [ ] Regular security updates
- [ ] Email verification enabled
- [ ] Admin account secured

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :3000  # Find process
kill -9 <PID>   # Kill process
```

**Database connection failed:**
```bash
# Test connection
psql $DATABASE_URL
```

**S3 upload fails:**
```bash
# Test S3 credentials
aws s3 ls --profile default
```

**Email not sending:**
```bash
# Test SMTP
telnet smtp.gmail.com 587
```

## Support

- Documentation: See README.md
- Issues: GitHub Issues
- Email: support@djmarketplace.com

---

Last updated: November 2025
# Trigger Vercel rebuild
