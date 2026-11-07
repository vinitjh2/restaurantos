# RestaurantOS — Production Installation & Deployment Guide

Welcome to **RestaurantOS**, an enterprise-grade Restaurant Operating System and Cloud Point of Sale (POS) engineered for independent restaurants, cafes, cloud kitchens, and multi-branch chains in the Indian hospitality market.

---

## 1. System Requirements

### Hardware Requirements
- **Server / Host Machine**:
  - Minimum: 2 CPU cores, 4 GB RAM, 20 GB SSD storage.
  - Recommended: 4 CPU cores, 8 GB RAM, NVMe SSD storage.
- **POS Billing Terminals**:
  - Touchscreen PC, Laptop, or Tablet (iPad, Android, ChromeOS, Windows).
  - Web browser: Chromium-based (Chrome, Edge) or Firefox.
- **Thermal Printers**:
  - 80mm or 58mm ESC/POS compatible thermal receipt printers (USB, Ethernet, or Bluetooth).
  - Recommended brands: Epson TM-T82, Star Micronics TSP143, TVS RP-3200, Posiflex.
- **Electronic Cash Drawer**: Standard RJ12 connector plugged directly into printer's kick port.
- **Barcode / Weigh Scale Scanners**: USB HID keyboard emulation scanners.

### Software Prerequisites
- **Docker Engine** (v24.0+) & **Docker Compose** (v2.20+) *(Recommended for containerized deployment)*
- Or Bare Metal:
  - **Node.js**: v20.x or v22.x LTS
  - **PostgreSQL**: v16.x
  - **Redis**: v7.x
  - **npm** or **pnpm**

---

## 2. Quick-Start Deployment via Docker Compose (Recommended)

1. **Clone or Extract the Repository**:
   ```bash
   git clone <repo-url> /opt/restaurantos
   cd /opt/restaurantos
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your production credentials
   nano .env
   ```

3. **Launch Containers**:
   ```bash
   docker compose up -d --build
   ```

4. **Initialize Database Schema & Seeds**:
   ```bash
   docker compose exec web npx prisma db push
   docker compose exec web npx tsx scripts/seed-inventory-data.ts
   docker compose exec web npx tsx scripts/seed-workforce-crm.ts
   docker compose exec web npx tsx scripts/seed-analytics-accounting.ts
   ```

5. **Verify Running Services**:
   ```bash
   docker compose ps
   ```
   Open `http://<server-ip>:3000` in your browser.

---

## 3. Bare-Metal Linux Installation (Ubuntu 22.04 / 24.04 LTS)

### Step 3.1: Install Node.js, PostgreSQL & Redis
```bash
# Update repositories
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3.2: Configure PostgreSQL
```bash
sudo -u postgres psql -c "CREATE USER restaurantos_user WITH ENCRYPTED PASSWORD 'SecurePassword123';"
sudo -u postgres psql -c "CREATE DATABASE restaurantos_prod OWNER restaurantos_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE restaurantos_prod TO restaurantos_user;"
```

### Step 3.3: Build RestaurantOS Application
```bash
cd /opt/restaurantos/apps/web
npm ci
cp .env.example .env
# Edit DATABASE_URL in .env to:
# DATABASE_URL="postgresql://restaurantos_user:SecurePassword123@localhost:5432/restaurantos_prod?schema=public"

npx prisma generate
npx prisma db push
npm run build
```

### Step 3.4: Configure PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 start npm --name "restaurantos-web" -- start
pm2 save
pm2 startup
```

### Step 3.5: Configure Nginx Reverse Proxy with SSL
Create `/etc/nginx/sites-available/restaurantos`:
```nginx
server {
    server_name pos.yourrestaurant.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site and provision SSL:
```bash
sudo ln -s /etc/nginx/sites-available/restaurantos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d pos.yourrestaurant.com
```

---

## 4. Hardware Integration Setup

### Thermal Receipt & Kitchen Station Printers
1. Connect printer to local restaurant LAN via Ethernet cable.
2. Configure static IP address on printer (e.g. `192.168.1.200` for Billing, `192.168.1.201` for Kitchen).
3. In **Settings -> Hardware Printers**, set Printer Model to `80mm ESC/POS` or `58mm ESC/POS` and assign station targets:
   - *Receipt Billing Printer* -> `192.168.1.200:9100`
   - *Main Kitchen Station* -> `192.168.1.201:9100`
   - *Bar / Beverage Counter* -> `192.168.1.202:9100`
   - *Bakery Station* -> `192.168.1.203:9100`

### Electronic Cash Drawer
- Plug RJ12 standard telephone jack from the bottom of the cash drawer into the back of your thermal receipt printer.
- RestaurantOS automatically pulses the solenoid pin (`ESC p 0 25 250`) whenever cash settlement is confirmed or when cashier presses **Kick Till**.

### Customer-Facing Display (CFD)
1. Connect secondary monitor or pole display to the POS computer.
2. In the POS header, click **CFD Screen** to launch `/cfd` on the customer display.
3. Live items, GST taxes, dynamic UPI QR code, and settlement change due will stream automatically via `BroadcastChannel`.

---

## 5. Automated Database Backups

RestaurantOS includes automated backup scripts with 30-day retention pruning:

### Cron Schedule (Linux)
Add to root crontab (`crontab -e`):
```cron
# Run backup daily at 2:00 AM
0 2 * * * /opt/restaurantos/scripts/db-backup.sh /opt/restaurantos/backups >> /var/log/restaurantos-backup.log 2>&1
```

### Manual Backup & Restore
- **Backup**:
  ```bash
  ./scripts/db-backup.sh
  ```
- **Restore**:
  ```bash
  ./scripts/db-restore.sh backups/restaurantos_pg_20261106_020000.dump
  ```
