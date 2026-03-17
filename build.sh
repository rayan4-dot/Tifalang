#!/bin/bash
# ⴰⵣⵓⵍ — TifaLang Stealth Build Script
# This bundles the engine into a 'tifa' binary without exposing the source as Python.

set -e

STAGING="build_staging"

echo "⛰️  Starting Stealth Build..."

# 1. Create staging area
rm -rf "$STAGING"
mkdir -p "$STAGING/tifalang_std"

# 2. Copy .tifa source files from .ⴰⵙⵏⵉⵏ and rename to .py in staging
echo "📦 Establishing source foundations..."
for f in .ⴰⵙⵏⵉⵏ/*.tifa; do
    base=$(basename "$f" .tifa)
    cp "$f" "$STAGING/${base}.py"
done

# 3. Copy standard libraries
cp tifalang_std/*.tifa "$STAGING/tifalang_std/"
touch "$STAGING/tifalang_std/__init__.py"

# --- BUNDLE ASSETS (Massive Ecosystem) ---
echo "💎 Bundling Ecosystem Assets (VSCode, Keyboard)..."
cp -r tifalang-vscode "$STAGING/"
cp TifaLang.keylayout "$STAGING/"
# -----------------------------------------

# 4. Create entry point
cat > "$STAGING/__main__.py" <<EOF
import tifa_engine
if __name__ == '__main__':
    tifa_engine.run_cli()
EOF

# 5. Bundle with zipapp
echo "🚀 Bundling Unified TifaLang binary..."
python3 -m zipapp "$STAGING" -o tifa -p "/usr/bin/env python3"
chmod +x tifa

# 6. Cleanup
rm -rf "$STAGING"

echo "✅ ⴰⵣⵓⵍ! Unified 'tifa' binary created successfully."
echo "Ecosystem is now self-contained within the binary."
