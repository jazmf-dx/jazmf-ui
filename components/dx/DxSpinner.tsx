/**
 * DxSpinner - 社内 UI ライブラリのローディングインジケーター
 *
 * ボタン内のローディングは DxButton の `loading` prop を使う。
 * DxSpinner はページ・カード・セクション単位の読み込み中表示で使う。
 */

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type DxSpinnerSize = "xs" | "sm" | "md" | "lg"

export interface DxSpinnerProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * サイズ
   * @default "md"
   */
  size?: DxSpinnerSize

  /**
   * 読み上げ用のラベル。スクリーンリーダーに「読み込み中」であることを伝える。
   * @default "読み込み中"
   */
  label?: string
}

const SIZE_CLASS: Record<DxSpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

/**
 * DxSpinner コンポーネント
 *
 * @example
 * ```tsx
 * // 基本（カード内の読み込み中）
 * <DxCard>
 *   <div className="flex justify-center py-8">
 *     <DxSpinner />
 *   </div>
 * </DxCard>
 *
 * // サイズ指定
 * <DxSpinner size="lg" />
 *
 * // ラベル付きで文脈を伝える
 * <DxSpinner label="申請一覧を読み込み中" />
 * ```
 */
export const DxSpinner = React.forwardRef<HTMLDivElement, DxSpinnerProps>(
  ({ size = "md", label = "読み込み中", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        className={cn("inline-flex items-center justify-center", className)}
        {...props}
      >
        <Loader2 className={cn("animate-spin text-muted-foreground", SIZE_CLASS[size])} />
        <span className="sr-only">{label}</span>
      </div>
    )
  }
)

DxSpinner.displayName = "DxSpinner"
