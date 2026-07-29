/**
 * DxButton - 社内 UI ライブラリのボタンコンポーネント
 *
 * shadcn/ui の Button をラップし、プロジェクト固有のバリアント・スタイルを提供します。
 * 画面側では DxButton のみを使用し、shadcn/ui の Button を直接使用しないでください。
 */

import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DxButtonProps extends Omit<ButtonProps, "variant"> {
  /**
   * ボタンのバリアント
   * - primary: メインアクション（作成・送信）- Blue
   * - secondary: 補助操作（キャンセル・戻る）- Gray
   * - danger: 削除・取り消し不可の操作 - Red
   * - success: 保存完了・承認・確定 - Emerald
   * - ghost: 背景なし、ホバーで表示
   * - link: テキストリンク風
   */
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "link"

  /**
   * ローディング状態（スピナーを表示）
   */
  loading?: boolean

  /**
   * 左側に表示するアイコン
   */
  leftIcon?: React.ReactNode

  /**
   * 右側に表示するアイコン
   */
  rightIcon?: React.ReactNode

  /**
   * 子要素
   */
  children?: React.ReactNode
}

/**
 * DxButton コンポーネント
 *
 * @example
 * ```tsx
 * // 基本的な使い方
 * <DxButton>保存</DxButton>
 *
 * // バリアント指定
 * <DxButton variant="primary">作成</DxButton>
 * <DxButton variant="danger">削除</DxButton>
 *
 * // ローディング状態
 * <DxButton loading>送信中...</DxButton>
 *
 * // アイコン付き
 * <DxButton leftIcon={<Plus className="w-4 h-4" />}>追加</DxButton>
 *
 * // サイズ指定
 * <DxButton size="sm">小さいボタン</DxButton>
 * <DxButton size="lg">大きいボタン</DxButton>
 *
 * // 無効化
 * <DxButton disabled>無効</DxButton>
 *
 * // フルワイド
 * <DxButton className="w-full">幅いっぱい</DxButton>
 * ```
 */
export const DxButton = React.forwardRef<HTMLButtonElement, DxButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // DX variant を shadcn/ui variant にマッピング
    const shadcnVariant = React.useMemo(() => {
      switch (variant) {
        case "primary":
          return "default"
        case "secondary":
          return "outline"
        case "danger":
          return "destructive"
        case "success":
          // success は shadcn/ui にないので、カスタムスタイルを適用
          return "default"
        case "ghost":
          return "ghost"
        case "link":
          return "link"
        default:
          return "default"
      }
    }, [variant])

    // success バリアントのカスタムスタイル
    // 色は input.css の --color-success トークン（btn-success と共通）に揃える
    const successClassName =
      variant === "success"
        ? "bg-success hover:bg-success-hover text-success-foreground shadow-sm"
        : ""

    return (
      <Button
        ref={ref}
        variant={shadcnVariant}
        disabled={disabled || loading}
        className={cn(successClassName, className)}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </Button>
    )
  }
)

DxButton.displayName = "DxButton"
