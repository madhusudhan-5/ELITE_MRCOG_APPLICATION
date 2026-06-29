#!/bin/bash
set -e

# Update and upgrade system packages
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Python, pip, virtualenv, Nginx, PostgreSQL, Git, Curl
echo "Installing dependencies..."
sudo apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib git curl supervisor certbot python3-certbot-nginx

# Install Node.js (v20) and PM2 for Uptime Kuma and Frontend build
echo "Installing Node.js and PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Install Netdata for monitoring
echo "Installing Netdata..."
bash <(curl -Ss https://my-netdata.io/kickstart.sh) --non-interactive

# Setup PostgreSQL Database
echo "Setting up PostgreSQL Database..."
sudo -u postgres psql -c "CREATE DATABASE elitemrcog;"
sudo -u postgres psql -c "CREATE USER elitemrcoguser WITH PASSWORD 'strongpassword123';"
sudo -u postgres psql -c "ALTER ROLE elitemrcoguser SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE elitemrcoguser SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE elitemrcoguser SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE elitemrcog TO elitemrcoguser;"

# Install Uptime Kuma
echo "Setting up Uptime Kuma..."
cd /opt
sudo git clone https://github.com/louislam/uptime-kuma.git
cd uptime-kuma
sudo npm run setup
sudo pm2 start server/server.js --name uptime-kuma
sudo pm2 save
sudo pm2 startup

# Create application directory
sudo mkdir -p /var/www/elitemrcog
sudo chown -R $USER:$USER /var/www/elitemrcog

echo "------------------------------------------------------"
echo "Server Initialization Complete!"
echo "Next Steps:"
echo "1. Clone your repository into /var/www/elitemrcog"
echo "2. Copy deployment configs from /deploy to /etc"
echo "3. Run deployment scripts."
echo "------------------------------------------------------"
