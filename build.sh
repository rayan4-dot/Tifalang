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

# --- BUNDLE MASSIVE ECOSYSTEM ASSETS ---
echo "💎 Bundling Ecosystem Assets..."
cp -r tifalang-vscode "$STAGING/"
cp TifaLang.keylayout "$STAGING/"
cp -r playground "$STAGING/"
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

echo "✅ ⴰⵣⵓⵍ! Unified 'tifa' binary created successfully (v1.8.0)."
echo "Includes: Engine, Libs, VSCode, Keyboard, and Web Playground."
