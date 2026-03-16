#!/bin/bash
# ⴰⵣⵓⵍ — TifaLang Global Bootstrap Installer

set -e

# Define colors safely
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

# Check if terminal supports color
if [ -t 1 ]; then
    HAS_COLOR=true
else
    HAS_COLOR=false
fi

cecho() {
    if [ "$HAS_COLOR" = true ]; then
        echo -e "${1}${2}${NC}"
    else
        echo "$2"
    fi
}

# --- CONFIGURATION ---
GITHUB_USER="rayan4-dot"
REPO_NAME="Tifalang"
BRANCH="main"
# ---------------------

cecho "$GREEN" "$BOLD⛰️  ⵜⴰⵡⵓⵔⵉ ⴰⵙⵏⵉⵏ (Starting TifaLang Universal Setup)..."

echo "🌐 Fetching TifaLang from GitHub..."
curl -fsSL "https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}/tifa" -o tifa-install

chmod +x ./tifa-install

echo "🛡️  Establishing TifaLang in system paths..."
sudo ./tifa-install install

rm ./tifa-install

echo ""
cecho "$GREEN" "$BOLD✓ ⴰⵣⵓⵍ! TifaLang is now natively installed on this laptop."
echo "Run it anywhere by simply typing: tifa"
