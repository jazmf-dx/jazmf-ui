# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **共通ルール**: このプロジェクトは開発Standard（`ai-dev-standards`）に準拠する。
> AI エージェントは最初に `../ai-dev-standards/ai/ONBOARDING.md` を読むこと。
> ここには **このプロジェクト固有の差分だけ** を書く。

## プロジェクト概要

Django テンプレートと React Island で見た目と操作を揃えるための**最小限の共有物**。
デザイントークン（`tokens/theme.css` が SSOT）、Django 連携 Island、
および Storybook による仕様書を提供する。汎用 UI ライブラリではない。

**基本 UI のラッパーを増やさない。** shadcn/ui で足りるものは各プロジェクトで
shadcn/ui を直接使う。ここに置くのは次のどちらかを満たすものだけ。

1. Django テンプレート側の CSS クラス（`btn-*` / `input-field` / `badge` / `card` /
   `data-table`）と React の見た目パリティが必要なもの
2. 繰り返し踏むロジック・ポリシーを内包するもの（空状態必須 API、htmx 接続など）

**業務ドメイン固有の UI（`UserPicker` / `DepartmentPicker` 等）は置かない。**
そのドメインを所有するプロジェクトに置く。人・組織・拠点は `jazmf-directory` が所有する。

判断基準の正は [Application UI Standard](../ai-dev-standards/standards/application-ui/README.md) §1 / §5。
詳細は [README.md](README.md) を参照。
