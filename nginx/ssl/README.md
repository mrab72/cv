# SSL Certificates Directory

Place your SSL certificates in this directory.

## Required Files

For each subdomain, you need:
- Certificate file: `subdomain.yourdomain.com.crt`
- Private key file: `subdomain.yourdomain.com.key`

## Example Structure

```
ssl/
├── cv.yourdomain.com.crt
├── cv.yourdomain.com.key
├── notes.yourdomain.com.crt
└── notes.yourdomain.com.key
```

## Getting Certificates from Cloudflare

1. Log in to Cloudflare Dashboard
2. Select your domain
3. Go to SSL/TLS → Origin Server
4. Click "Create Certificate"
5. Select "Generate private key and CSR with Cloudflare"
6. Choose the hostnames (or use wildcard *.yourdomain.com)
7. Select validity period (15 years recommended)
8. Click "Create"
9. Copy the "Origin Certificate" and save as `.crt` file
10. Copy the "Private Key" and save as `.key` file

## File Permissions

Ensure proper permissions for security:

```bash
chmod 644 *.crt
chmod 600 *.key
```

## Wildcard Certificate (Alternative)

Instead of individual certificates, you can use a wildcard certificate:
- `*.yourdomain.com.crt`
- `*.yourdomain.com.key`

Then update `nginx/conf.d/default.conf` to reference these files:

```nginx
ssl_certificate /etc/nginx/ssl/*.yourdomain.com.crt;
ssl_certificate_key /etc/nginx/ssl/*.yourdomain.com.key;
```

## Security Note

⚠️ Never commit these files to version control!

Add to your `.gitignore`:
```
nginx/ssl/*.crt
nginx/ssl/*.key
nginx/ssl/*.pem
```
