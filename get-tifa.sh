#!/bin/bash
# ⴰⵣⵓⵍ — TifaLang Global Bootstrap Installer
# This script installs TifaLang on ANY machine via GitHub.

set -e

GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

# --- CONFIGURATION ---
GITHUB_USER="rayan4-dot"
REPO_NAME="Tifalang"
BRANCH="main"
# ---------------------

echo -e "${GREEN}${BOLD}⛰️  ⵜⴰⵡⵓⵔⵉ ⴰⵙⵏⵉⵏ (Starting TifaLang Universal Setup)...${NC}"

# 1. Download the latest binary from GitHub
echo "🌐 Fetching TifaLang from GitHub..."
curl -fsSL "https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}/tifa" -o tifa-install

chmod +x ./tifa-install

# 2. Run the internal installer
echo "🛡️  Establishing TifaLang in system paths..."
sudo ./tifa-install install

rm ./tifa-install

echo -e "\n${GREEN}${BOLD}✓ ⴰⵣⵓⵍ! TifaLang is now natively installed on this laptop.${NC}"
echo "Run it anywhere by simply typing: ${BOLD}tifa${NC}"
