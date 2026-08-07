#!/usr/bin/env bash
# jazmf-ui の npm パッケージが templates/django-app に配布可能かを検証する。
#
# npm の依存巻き上げ（hoisting）は「宣言していない依存が import できる」ことを
# 隠してしまう。pnpm や yarn PnP、`npm install --install-strategy=nested` では
# 巻き上げが起こらず、phantom dependency（import しているが package.json に
# 宣言していない依存）がビルド時に露見する。
# 2026-08-07 に date-fns（dx-ui 側）・tw-animate-css（テンプレート側）の
# 宣言漏れがこの経路で実際に発生した（1.0.2 → 1.0.3 の修正、当時は jazmf-platform 内）。
#
# 使い方:
#   ./scripts/verify-package.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$UI_DIR/jazmf-platform/templates/django-app"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "▶ jazmf-ui を tarball 化"
TARBALL="$(cd "$UI_DIR" && npm pack --silent)"
TARBALL_PATH="$UI_DIR/$TARBALL"

echo "▶ テンプレートを検証用ディレクトリにコピー: $WORKDIR"
cp -R "$TEMPLATE_DIR"/. "$WORKDIR"/
rm -f "$WORKDIR/.npmrc"

python3 - "$WORKDIR/package.json" "$TARBALL_PATH" <<'PY'
import json, sys
pkg_path, tarball_path = sys.argv[1], sys.argv[2]
with open(pkg_path) as f:
    pkg = json.load(f)
pkg["name"] = "verify-dx-ui-package"
pkg["dependencies"]["@jazmf-dx/dx-ui"] = f"file:{tarball_path}"
with open(pkg_path, "w") as f:
    json.dump(pkg, f, indent=2)
PY

cd "$WORKDIR"

echo "▶ 非巻き上げレイアウトで npm install（phantom dependency を露見させる）"
npm install --install-strategy=nested --no-audit --no-fund

echo "▶ npm run build:css"
npm run build:css

echo "▶ npm run build:islands"
npm run build:islands

OUTPUT_CSS="backend/static/css/output.css"

check() {
    local label="$1" pattern="$2"
    if grep -q -- "$pattern" "$OUTPUT_CSS"; then
        echo "✅ $label"
    else
        echo "❌ $label"
        exit 1
    fi
}

echo "▶ 出力 CSS の内容を確認"
check "theme.css が届いている（btn-primary）" "btn-primary"
check "motion.css が届いている（--motion-duration-base）" "\-\-motion-duration-base"
check "ダークモード対応（var(--color-card)）" "var(--color-card)"

rm -f "$TARBALL_PATH"

echo ""
echo "✅ dx-ui パッケージ配布の検証に成功しました"
