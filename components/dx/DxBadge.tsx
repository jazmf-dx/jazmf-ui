/**
 * DxBadge - 社内 UI ライブラリのバッジ（ステータス表示）コンポーネント
 *
 * 色の意味は design-system/colors.md の「ドメインステータスカラーの設計パターン」に揃えている。
 *
 * <important>
 * バッジは色だけに意味を持たせない。現状セマンティックカラーは WCAG AA 未達
 * （design-system/accessibility.md）のため、必ず文字（「完了」「未対応」等）で
 * 意味が読み取れるようにする。
 * </important>
 */

import * as React from "react"
import { cn } from '../../lib/utils'

export type DxBadgeTone =
  | "new"
  | "active"
  | "done"
  | "warning"
  | "danger"
  | "pending"
  | "neutral"

export interface DxBadgeProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * 意味に対応した色調
   * - new: 新規・未対応・要注意（Yellow）
   * - active: 進行中（Sky）
   * - done: 完了・解決・承認（Emerald）
   * - warning: 差戻し・警告（Orange）
   * - danger: 緊急・エラー・却下（Rose）
   * - pending: 検討中・保留（Purple）
   * - neutral: 終了・無効・アーカイブ（Gray）
   * @default "neutral"
   */
  tone?: DxBadgeTone

  /** 先頭に表示するアイコン */
  icon?: React.ReactNode

  className?: string
}

const TONE_CLASS: Record<DxBadgeTone, string> = {
  new: "bg-yellow-50 text-yellow-600",
  active: "bg-sky-50 text-sky-500",
  done: "bg-emerald-50 text-emerald-600",
  warning: "bg-orange-50 text-orange-600",
  danger: "bg-rose-50 text-rose-500",
  pending: "bg-purple-50 text-purple-600",
  neutral: "bg-gray-100 text-gray-500",
}

/**
 * DxBadge コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <DxBadge tone="active">対応中</DxBadge>
 *
 * // 一覧のステータス列
 * <DxBadge tone={statusToneMap[row.status]}>{row.statusLabel}</DxBadge>
 *
 * // アイコン付き
 * <DxBadge tone="danger" icon={<AlertCircle className="h-3 w-3" />}>エラー</DxBadge>
 * ```
 */
export const DxBadge = React.forwardRef<HTMLSpanElement, DxBadgeProps>(
  ({ tone = "neutral", icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          TONE_CLASS[tone]
        )}
        {...props}
      >
        {icon}
        {children}
      </span>
    )
  }
)

DxBadge.displayName = "DxBadge"
