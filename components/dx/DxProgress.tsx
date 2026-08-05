/**
 * DxProgress - 社内 UI ライブラリのプログレスバー
 *
 * ファイルアップロード・複数ステップの処理の進捗表示に使う。
 * 完了までの見込みが分からない処理には使わない（`DxSpinner` を使う）。
 */

import * as React from "react"
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface DxProgressProps {
  /** 現在値。0〜max の範囲。 */
  value: number

  /**
   * 最大値
   * @default 100
   */
  max?: number

  /** プログレスバー上部に表示するラベル */
  label?: React.ReactNode

  /** 右側に「50%」のような数値表示を出す */
  showValue?: boolean

  className?: string
}

/**
 * DxProgress コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <DxProgress value={40} />
 *
 * // ラベル + 数値表示
 * <DxProgress value={progress} label="アップロード中" showValue />
 *
 * // 最大値を変える（3ステップ中2ステップ完了 等）
 * <DxProgress value={2} max={3} label="申請ステップ" />
 * ```
 */
export const DxProgress = React.forwardRef<HTMLDivElement, DxProgressProps>(
  ({ value, max = 100, label, showValue = false, className }, ref) => {
    const percent = Math.round((value / max) * 100)

    return (
      <Progress ref={ref} value={value} max={max} className={cn("w-full", className)}>
        {(label || showValue) && (
          <div className="mb-1.5 flex items-center justify-between gap-2">
            {label && <span className="text-sm text-foreground">{label}</span>}
            {showValue && (
              <span className="text-sm text-muted-foreground">{percent}%</span>
            )}
          </div>
        )}
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    )
  }
)

DxProgress.displayName = "DxProgress"
