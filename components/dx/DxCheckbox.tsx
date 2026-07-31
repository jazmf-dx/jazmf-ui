/**
 * DxCheckbox - 社内 UI ライブラリのチェックボックス
 *
 * ラベルとチェックボックスを紐づけた状態で提供する。
 * ラベルのクリックでもトグルできる（クリック領域が小さいと押しにくいため）。
 */

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface DxCheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Checkbox>, "children"> {
  /** ラベル。クリックでトグルできる */
  label?: React.ReactNode

  /** ラベル下の補足説明 */
  description?: React.ReactNode

  /** ラッパー要素に付けるクラス（チェックボックス本体は className） */
  wrapperClassName?: string
}

/**
 * DxCheckbox コンポーネント
 *
 * @example
 * ```tsx
 * // 基本
 * <DxCheckbox label="利用規約に同意する" />
 *
 * // 制御付き
 * <DxCheckbox label="公開する" checked={open} onCheckedChange={setOpen} />
 *
 * // 説明付き
 * <DxCheckbox
 *   label="メール通知を受け取る"
 *   description="重要な更新のみ送信されます"
 * />
 *
 * // 全選択（一部選択状態）
 * <DxCheckbox label="すべて選択" indeterminate={someSelected} />
 * ```
 */
export const DxCheckbox = React.forwardRef<
  HTMLButtonElement,
  DxCheckboxProps
>(({ label, description, className, wrapperClassName, id, ...props }, ref) => {
  const autoId = React.useId()
  const inputId = id ?? autoId
  const descId = description ? `${inputId}-desc` : undefined

  if (!label && !description) {
    return <Checkbox ref={ref} id={inputId} className={className} {...props} />
  }

  return (
    <div className={cn("flex items-start gap-2", wrapperClassName)}>
      <Checkbox
        ref={ref}
        id={inputId}
        aria-describedby={descId}
        // ラベル1行目と視覚的に揃える
        className={cn("mt-0.5", className)}
        {...props}
      />
      <div className="min-w-0">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block cursor-pointer text-sm text-foreground",
              props.disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {label}
          </label>
        )}
        {description && (
          <p id={descId} className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
})

DxCheckbox.displayName = "DxCheckbox"
