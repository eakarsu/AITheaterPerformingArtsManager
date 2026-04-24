#!/bin/bash

# ═══════════════════════════════════════════════════════════
#   AI Theater & Performing Arts Manager - Start Script
# ═══════════════════════════════════════════════════════════

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=4000
FRONTEND_PORT=3001

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🎭  AI Theater & Performing Arts Manager  🎭      ║"
echo "║       Starting Application...                        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Step 1: Clean up used ports ────────────────────────────
echo -e "${BLUE}[1/6] Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${GOLD}  Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "${GREEN}  Port $port is free.${NC}"
    fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ─── Step 2: Check PostgreSQL ────────────────────────────────
echo -e "${BLUE}[2/6] Checking PostgreSQL...${NC}"

if command -v pg_isready &>/dev/null; then
    if pg_isready -q 2>/dev/null; then
        echo -e "${GREEN}  PostgreSQL is running.${NC}"
    else
        echo -e "${GOLD}  Starting PostgreSQL...${NC}"
        if command -v brew &>/dev/null; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        fi
        sleep 2
    fi
else
    echo -e "${GOLD}  pg_isready not found. Assuming PostgreSQL is running.${NC}"
fi

# ─── Step 3: Setup Database ──────────────────────────────────
echo -e "${BLUE}[3/6] Setting up database...${NC}"

# Load DB credentials from .env
DB_USER="theater_admin"
DB_PASS="theater_pass_2024"
DB_NAME="theater_arts_db"

# Create user if not exists
psql -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null | grep -q 1 || \
    psql -U postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" 2>/dev/null || \
    echo -e "${GOLD}  User may already exist or using different superuser.${NC}"

# Create database if not exists
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null | grep -q 1 || \
    psql -U postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || \
    echo -e "${GOLD}  Database may already exist.${NC}"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" 2>/dev/null || true
psql -U postgres -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};" 2>/dev/null || true

echo -e "${GREEN}  Database '${DB_NAME}' ready.${NC}"

# ─── Step 4: Install Dependencies ────────────────────────────
echo -e "${BLUE}[4/6] Installing dependencies...${NC}"

cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
    echo -e "${GOLD}  Installing backend dependencies...${NC}"
    npm install --silent 2>/dev/null
else
    echo -e "${GREEN}  Backend dependencies up to date.${NC}"
fi

cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
    echo -e "${GOLD}  Installing frontend dependencies...${NC}"
    npm install --silent 2>/dev/null
else
    echo -e "${GREEN}  Frontend dependencies up to date.${NC}"
fi

cd "$PROJECT_DIR"

# ─── Step 5: Schema & Seed Data ──────────────────────────────
echo -e "${BLUE}[5/6] Running schema and seeding data...${NC}"

cd "$PROJECT_DIR/backend"
node schema.js
node seed.js
cd "$PROJECT_DIR"

echo -e "${GREEN}  Database seeded with sample data for all features.${NC}"

# ─── Step 6: Start Application ───────────────────────────────
echo -e "${BLUE}[6/6] Starting services with hot reload...${NC}"

# Start backend with nodemon for hot reload
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend with hot reload (built-in with react-scripts)
cd "$PROJECT_DIR/frontend"
PORT=$FRONTEND_PORT BROWSER=none npm start &
FRONTEND_PID=$!

cd "$PROJECT_DIR"

# Wait for services to start
echo ""
echo -e "${GOLD}  Waiting for services to start...${NC}"
sleep 5

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  Application is running!                        ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  🎭  Frontend:  http://localhost:${FRONTEND_PORT}               ║${NC}"
echo -e "${GREEN}║  🔧  Backend:   http://localhost:${BACKEND_PORT}               ║${NC}"
echo -e "${GREEN}║  📊  API Health: http://localhost:${BACKEND_PORT}/api/health   ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  📧  Login: admin@theater.com / password123          ║${NC}"
echo -e "${GREEN}║  💡  Or click 'Quick Login (Demo)' button            ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  🔄  Hot reload enabled - changes auto-refresh       ║${NC}"
echo -e "${GREEN}║  🛑  Press Ctrl+C to stop all services               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Handle graceful shutdown
cleanup() {
    echo ""
    echo -e "${GOLD}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    cleanup_port $BACKEND_PORT
    cleanup_port $FRONTEND_PORT
    echo -e "${GREEN}All services stopped. Goodbye! 🎭${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
