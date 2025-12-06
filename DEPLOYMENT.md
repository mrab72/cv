# Docker Deployment Guide

This guide will help you deploy both the CV and Tech Notes applications using Docker Compose with Nginx reverse proxy for subdomain routing.

## Project Structure

```
.
├── cv/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ... (Next.js app files)
├── tech-notes/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ... (Next.js app files)
├── nginx/
│   ├── nginx.conf
│   ├── conf.d/
│   │   └── default.conf
│   └── ssl/
│       └── (place your SSL certificates here)
├── docker-compose.yml
└── DEPLOYMENT.md (this file)
```

## Prerequisites

1. Docker and Docker Compose installed on your VM
2. Domain configured in Cloudflare with DNS records pointing to your VM
3. SSL certificates from Cloudflare (or Let's Encrypt)

## Step 1: Configure Your Subdomains

### In Cloudflare DNS:

Add A records for your subdomains pointing to your VM's IP address:

- `cv.yourdomain.com` → `YOUR_VM_IP`
- `notes.yourdomain.com` → `YOUR_VM_IP`

## Step 2: SSL Certificates

### Option A: Cloudflare Origin Certificates (Recommended)

1. Log in to your Cloudflare dashboard
2. Go to SSL/TLS → Origin Server
3. Click "Create Certificate"
4. Generate the certificate (valid for 15 years)
5. Download both the certificate and private key
6. Save them in the `nginx/ssl/` directory:
   - `cv.yourdomain.com.crt` and `cv.yourdomain.com.key`
   - `notes.yourdomain.com.crt` and `notes.yourdomain.com.key`

### Option B: Let's Encrypt (Alternative)

If you prefer Let's Encrypt, you can use certbot. Add this service to `docker-compose.yml`:

```yaml
certbot:
  image: certbot/certbot
  container_name: certbot
  volumes:
    - ./certbot/conf:/etc/letsencrypt
    - ./certbot/www:/var/www/certbot
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

## Step 3: Update Configuration Files

### Update nginx/conf.d/default.conf:

Replace `cv.yourdomain.com` and `notes.yourdomain.com` with your actual subdomains.

Update SSL certificate paths if needed:
```nginx
ssl_certificate /etc/nginx/ssl/cv.yourdomain.com.crt;
ssl_certificate_key /etc/nginx/ssl/cv.yourdomain.com.key;
```

## Step 4: Deploy to Your VM

### 1. Transfer files to your VM:

```bash
# From your local machine
scp -r /path/to/cv user@your-vm-ip:/home/user/
```

Or use git:
```bash
# On your VM
git clone your-repository-url
cd cv
```

### 2. Ensure SSL certificates are in place:

```bash
ls -la nginx/ssl/
# Should show your .crt and .key files
```

### 3. Build and start the containers:

```bash
# Build and start all services
docker-compose up -d --build

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify the deployment:

```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# Check individual services
curl http://localhost:3001  # Should work if you exposed cv port
curl http://localhost:3002  # Should work if you exposed tech-notes port
```

## Step 5: Cloudflare Settings

### SSL/TLS Configuration:

1. Go to SSL/TLS → Overview
2. Set encryption mode to **Full (strict)** or **Full**
3. Enable "Always Use HTTPS"

### DNS Settings:

Make sure your DNS records have the orange cloud (proxied) enabled for DDoS protection and CDN benefits.

## Common Commands

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f cv
docker-compose logs -f tech-notes
docker-compose logs -f nginx
```

### Restart services:
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart cv
```

### Stop and remove containers:
```bash
docker-compose down

# Remove with volumes
docker-compose down -v
```

### Rebuild after code changes:
```bash
# Rebuild specific service
docker-compose up -d --build cv

# Rebuild all
docker-compose up -d --build
```

### Access container shell:
```bash
docker-compose exec cv sh
docker-compose exec tech-notes sh
docker-compose exec nginx sh
```

## Troubleshooting

### Containers won't start:

```bash
# Check logs
docker-compose logs

# Check if ports are already in use
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Nginx configuration errors:

```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx without restart
docker-compose exec nginx nginx -s reload
```

### SSL certificate issues:

```bash
# Verify certificate files exist
docker-compose exec nginx ls -la /etc/nginx/ssl/

# Check certificate details
openssl x509 -in nginx/ssl/cv.yourdomain.com.crt -text -noout
```

### Application not accessible:

1. Check if containers are running: `docker-compose ps`
2. Check nginx logs: `docker-compose logs nginx`
3. Check application logs: `docker-compose logs cv` or `docker-compose logs tech-notes`
4. Verify DNS records in Cloudflare
5. Check firewall rules on your VM:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### DNS not resolving:

1. Check Cloudflare DNS records
2. Wait for DNS propagation (can take up to 48 hours, usually much faster)
3. Test DNS resolution: `nslookup cv.yourdomain.com`

## Security Recommendations

1. **Firewall**: Only expose ports 80 and 443
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```

2. **Keep Docker images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

3. **Regular backups**: Set up automated backups of your application data

4. **Monitor logs**: Set up log monitoring and alerts

5. **Use secrets for sensitive data**: Consider using Docker secrets or environment files for sensitive configuration

## Performance Optimization

1. **Enable Cloudflare caching** for static assets
2. **Use Cloudflare Auto Minify** for HTML/CSS/JS
3. **Enable Brotli compression** in Cloudflare
4. **Monitor resource usage**:
   ```bash
   docker stats
   ```

## Updating Applications

When you make changes to your applications:

```bash
# Pull latest code
git pull

# Rebuild and restart specific service
docker-compose up -d --build cv

# Or rebuild all
docker-compose up -d --build
```

## Health Checks

Test the health endpoints:

```bash
curl https://cv.yourdomain.com/health
curl https://notes.yourdomain.com/health
```

## Backup Strategy

```bash
# Backup docker volumes (if you add any for data persistence)
docker-compose down
tar -czf backup-$(date +%Y%m%d).tar.gz ./nginx/ssl ./nginx/conf.d

# Restore
tar -xzf backup-YYYYMMDD.tar.gz
```

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify your configuration files
3. Ensure DNS records are correct
4. Check SSL certificates are valid
5. Verify firewall settings

## Additional Notes

- The applications run on internal port 3000 but are not exposed externally
- Nginx acts as a reverse proxy and handles all external traffic on ports 80/443
- All HTTP traffic is automatically redirected to HTTPS
- Each application runs in its own isolated container
- The containers are connected via a Docker network named `app-network`
