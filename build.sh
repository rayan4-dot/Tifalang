#!/bin/bash
# ⴰⵣⵓⵍ — TifaLang Stealth Build Script
# This bundles the entire ecosystem into a unified 'tifa' binary.

set -e

STAGING="build_staging"

echo "⛰️  Starting Unified Stealth Build..."

# 1. Create staging area
rm -rf "$STAGING"
mkdir -p "$STAGING/tifalang_std"

# 2. Copy .tifa engine files
echo "📦 Establishing engine foundations..."
for f in .ⴰⵙⵏⵉⵏ/*.tifa; do
    base=$(basename "$f" .tifa)
    cp "$f" "$STAGING/${base}.py"
done

# 3. Copy standard libraries
cp tifalang_std/*.tifa "$STAGING/tifalang_std/"
touch "$STAGING/tifalang_std/__init__.py"

# 3.5 Sync engine files to playground/engine for Pyodide integration
echo "📦 Syncing playground engine..."
mkdir -p playground/engine
for f in .ⴰⵙⵏⵉⵏ/*.tifa; do
    base=$(basename "$f" .tifa)
    cp "$f" "playground/engine/${base}.py"
done
cp tifalang_std/*.tifa playground/engine/

# 3.6 Run the playground packager
echo "⚙️ Packaging playground assets..."
python3 playground/bundle.py


# --- BUNDLE MASSIVE ECOSYSTEM ASSETS ---
echo "💎 Bundling Ecosystem Assets..."
cp -r tifalang-vscode "$STAGING/"
cp TifaLang.keylayout "$STAGING/"
cp -r playground "$STAGING/"
# -----------------------------------------

# 4. Create entry point
cat > "$STAGING/__main__.py" <<EOF