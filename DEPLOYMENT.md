# Mitaq AI Deployment Guide

## Prerequisites

- Node.js 18+ 
- npm 8+
- PM2 (for process management)
- Nginx (for reverse proxy)

## Raspberry Pi 4 Deployment

### Step 1: Clone Repository

```bash
# Navigate to web directory
cd /var/www/html

# Clone the repository
sudo git clone https://github.com/theunknown2025/mitaq_ai.git

# Change ownership
sudo chown -R pi:pi mitaq_ai

# Navigate to project
cd mitaq_ai
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (root, frontend, backend)
npm run install:all
```

### Step 3: Build Applications

```bash
# Build both frontend and backend
npm run build:all
```

### Step 4: Install PM2 Globally

```bash
sudo npm install -g pm2
```

### Step 5: Start Applications with PM2

```bash
# Start both applications
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command provided by PM2
```

### Step 6: Configure Nginx

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/mitaq-ai
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP
    
    # Frontend + Next.js API routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Express Backend API routes
    location /backend/ {
        rewrite ^/backend(/.*)$ $1 break;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mitaq-ai /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 7: Create Logs Directory

```bash
mkdir -p logs
```

## Useful Commands

### Development
```bash
# Start development servers
npm run dev:all

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

### Production
```bash
# Build all
npm run build:all

# Start production
pm2 start ecosystem.config.js --env production

# Monitor applications
pm2 monit

# View logs
pm2 logs
```

### PM2 Management
```bash
# Status
pm2 status

# Restart
pm2 restart all

# Stop
pm2 stop all

# Delete
pm2 delete all

# Reload (zero downtime)
pm2 reload all
```

### Updates
```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm run install:all

# Rebuild
npm run build:all

# Restart services
pm2 restart all
```

## Troubleshooting

### Check Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check Ports
```bash
# Check if ports are in use
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001
```

### Memory Issues
```bash
# Increase Node.js memory for build
NODE_OPTIONS="--max-old-space-size=2048" npm run build:frontend
```

## Access

- Frontend: `http://your-raspberry-pi-ip/`
- Backend API: `http://your-raspberry-pi-ip/backend/`
- Next.js API: `http://your-raspberry-pi-ip/api/`

## Architecture

```
[Nginx :80] 
├── → Frontend + Next.js APIs [:3000]
└── → Express Backend [:3001] (via /backend/)
``` 