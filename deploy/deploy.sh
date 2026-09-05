#!/bin/bash
set -e

APP_DIR="/var/www/elitemrcog"

echo "Starting Deployment..."

# 0. Automatic Database Backup
if [ -f "$APP_DIR/elitemrcog_backend/db.sqlite3" ]; then
    echo "Creating safety backup of database..."
    cp "$APP_DIR/elitemrcog_backend/db.sqlite3" "$APP_DIR/elitemrcog_backend/db_backup_$(date +%Y%m%d_%H%M%S).sqlite3"
fi

# 1. Pull Latest Code
cd $APP_DIR
git fetch origin main
git reset --hard origin/main

# 2. Build Frontend
echo "Building Frontend..."
cd $APP_DIR/elitemrcog_frontend
npm install
npm run build

# 3. Setup Backend
echo "Setting up Backend..."
cd $APP_DIR/elitemrcog_backend
if [ ! -d "../elitemrcog_backend_env" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv ../elitemrcog_backend_env
fi
source ../elitemrcog_backend_env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# 4. Restart Services
echo "Restarting Services..."
sudo cp $APP_DIR/deploy/gunicorn.service /etc/systemd/system/gunicorn.service
sudo systemctl daemon-reload
echo "Testing Nginx Configuration..."
sudo nginx -t
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "Deployment Successful!"
