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
    color="$1"
    bold="$2"
    msg="$3"
    if [ "$HAS_COLOR" = true ]; then
        # Use printf for maximum compatibility across shells (zsh/bash/sh)
        printf "${color}${bold}${msg}${NC}\n"
    else
        printf "${msg}\n"
    fi
}

# --- CONFIGURATION ---
GITHUB_USER="rayan4-dot"
REPO_NAME="Tifalang"
BRANCH="main"
# ---------------------

cecho "$GREEN" "$BOLD" "⛰️  ⵜⴰⵡⵓⵔⵉ ⴰⵙⵏⵉⵏ (Starting TifaLang Universal Setup)..."

printf "🌐 Fetching TifaLang from GitHub...\n"
curl -fsSL "https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}/tifa" -o tifa-install

chmod +x ./tifa-install

printf "🛡️  Establishing TifaLang in system paths...\n"
sudo ./tifa-install install

rm ./tifa-install

printf "\n"
cecho "$GREEN" "$BOLD" "✓ ⴰⵣⵓⵍ! TifaLang is now natively installed on this laptop."
printf "Run it anywhere by simply typing: tifa\n"
