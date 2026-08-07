#!/usr/bin/env python3
"""tokens/icons.generated.ts を icons_templatetag.py から生成する。

アイコンの SSOT は jazmf-platform submodule 内の
packages/django-shared/icons_templatetag.py。
Storybook の Foundations/Icons が一覧を描画するために TS 版が必要なので、
手で二重管理せずここで生成する。

使い方:
    npm run gen:icons
"""

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
PKG = HERE.parent
SRC = PKG / "jazmf-platform" / "packages" / "django-shared" / "icons_templatetag.py"
DEST = PKG / "tokens" / "icons.generated.ts"

HEADER = '''/**
 * アイコン一覧（Heroicons v2 outline）
 *
 * <important>
 * このファイルは自動生成物。手で編集しない。
 * SSOT は jazmf-platform submodule 内の packages/django-shared/icons_templatetag.py の ICONS。
 * アイコンを追加・変更したら icons_templatetag.py を直し、下記コマンドで再生成する。
 *
 *   npm run gen:icons
 * </important>
 *
 * Django テンプレートでは `{% icon "plus" size="sm" %}` を使う（このファイルは使わない）。
 * Storybook の Foundations/Icons が一覧を描画するために TS 版を持っている。
 */
'''


def main() -> None:
    src = SRC.read_text()

    start = src.index("ICONS = {")
    block = src[start : src.index("\n}", start)]
    icons = re.findall(r"^    \"([a-z0-9-]+)\": '(.*)',$", block, re.M)
    if not icons:
        raise SystemExit(f"アイコンを抽出できなかった: {SRC}")

    sizes = re.findall(
        r'^    "([a-z]+)": "([^"]+)",$', src[src.index("SIZE_CLASSES = {") :], re.M
    )

    lines = [HEADER]
    lines.append("/** アイコン名 → SVG の中身（path 要素） */")
    lines.append("export const ICON_PATHS: Record<string, string> = {")
    lines += [f"  {json.dumps(n)}: {json.dumps(p)}," for n, p in icons]
    lines.append("}")
    lines.append("")
    lines.append("/** 利用可能なアイコン名 */")
    lines.append("export type IconName = keyof typeof ICON_PATHS")
    lines.append("")
    lines.append(
        "/** size 引数 → Tailwind クラス（icons_templatetag.py の SIZE_CLASSES と同じ） */"
    )
    lines.append("export const ICON_SIZES = {")
    lines += [f"  {json.dumps(k)}: {json.dumps(v)}," for k, v in sizes]
    lines.append("} as const")
    lines.append("")
    lines.append("/** アイコン名の一覧（登録順） */")
    lines.append("export const ICON_NAMES: string[] = Object.keys(ICON_PATHS)")
    lines.append("")

    DEST.write_text("\n".join(lines))
    print(f"{DEST.relative_to(PKG)}: {len(icons)} icons, {len(sizes)} sizes")


if __name__ == "__main__":
    main()
