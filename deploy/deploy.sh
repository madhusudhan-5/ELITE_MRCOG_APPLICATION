#!/bin/bash
set -e

APP_DIR="/var/www/elitemrcog"

echo "Starting Deployment..."

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
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "Deployment Successful!"
