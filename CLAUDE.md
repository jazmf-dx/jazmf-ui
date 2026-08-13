# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **共通ルール**: このプロジェクトは開発Standard（`ai-dev-standards`）に準拠する。
> AI エージェントは最初に `../ai-dev-standards/ai/ONBOARDING.md` を読むこと。
> ここには **このプロジェクト固有の差分だけ** を書く。

## プロジェクト概要

社内標準 UI コンポーネントライブラリ + デザインシステム。
shadcn/ui（@base-ui/react ベース）をラップした React コンポーネント集、デザイントークン、
および Storybook による仕様書を提供する。

**画面側では DX UI コンポーネントのみを使用し、shadcn/ui（`components/ui/*`）を直接使用しない。**

詳細は [README.md](README.md) を参照。
