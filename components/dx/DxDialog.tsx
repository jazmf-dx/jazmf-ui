/**
 * DxDialog - 社内 UI ライブラリの汎用ダイアログコンポーネント
 *
 * shadcn/ui の Dialog をラップし、プロジェクト標準のダイアログ UI を提供します。
 * 画面側では DxDialog のみを使用し、shadcn/ui の Dialog を直接使用しないでください。
 */

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { DxButton } from "./DxButton"

export interface DxDialogProps {
  /**
   * ダイアログの開閉状態
   */
  open: boolean

  /**
   * ダイアログを閉じるコールバック
   */
  onOpenChange: (open: boolean) => void

  /**
   * ダイアログのタイトル
   */
  title: string

  /**
   * ダイアログの説明文（オプション）
   */
  description?: string

  /**
   * ダイアログのコンテンツ
   */
  children: React.ReactNode

  /**
   * フッターのカスタムコンテンツ
   * 指定しない場合は、confirmText / cancelText からボタンを自動生成
   */
  footer?: React.ReactNode

  /**
   * 確定ボタンのテキスト（footer 未指定時のみ有効）
   */
  confirmText?: string

  /**
   * キャンセルボタンのテキスト（footer 未指定時のみ有効）
   */
  cancelText?: string

  /**
   * 確定ボタンクリック時のコールバック（footer 未指定時のみ有効）
   */
  onConfirm?: () => void

  /**
   * キャンセルボタンクリック時のコールバック（footer 未指定時のみ有効）
   */
  onCancel?: () => void

  /**
   * 確定ボタンのバリアント（footer 未指定時のみ有効）
   */
  confirmVariant?: "primary" | "danger" | "success"

  /**
   * 確定ボタンのローディング状態（footer 未指定時のみ有効）
   *
   * true の間は以下を自動で行う:
   * - 確定・キャンセルボタンを無効化
   * - 右上の閉じるボタン（X）を非表示化
   * - ESC キー・背景クリックでの閉じる操作を無効化
   */
  confirmLoading?: boolean

  /**
   * ダイアログの最大幅
   * @default "lg" (32rem)
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
}

/**
 * DxDialog コンポーネント
 *
 * @example
 * ```tsx
 * // 基本的な使い方
 * const [open, setOpen] = useState(false)
 *
 * <DxDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="ユーザー情報"
 *   description="ユーザーの詳細情報を表示します。"
 * >
 *   <div>コンテンツ</div>
 * </DxDialog>
 *
 * // 確定・キャンセルボタン付き
 * <DxDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="保存しますか？"
 *   description="変更内容を保存します。"
 *   confirmText="保存"
 *   cancelText="キャンセル"
 *   onConfirm={handleSave}
 *   onCancel={() => setOpen(false)}
 * >
 *   <div>保存する内容...</div>
 * </DxDialog>
 *
 * // カスタムフッター
 * <DxDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="カスタムフッター"
 *   footer={
 *     <div className="flex gap-2">
 *       <DxButton variant="secondary">アクション1</DxButton>
 *       <DxButton variant="primary">アクション2</DxButton>
 *     </div>
 *   }
 * >
 *   <div>コンテンツ</div>
 * </DxDialog>
 * ```
 */
export const DxDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  confirmLoading = false,
  maxWidth = "lg",
}: DxDialogProps) => {
  // 最大幅のクラス名
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth]

  // デフォルトフッター（footer が指定されていない場合）
  const defaultFooter = (
    <>
      {cancelText && (
        <DxButton
          variant="secondary"
          onClick={onCancel || (() => onOpenChange(false))}
          disabled={confirmLoading}
        >
          {cancelText}
        </DxButton>
      )}
      {confirmText && (
        <DxButton
          variant={confirmVariant}
          onClick={onConfirm}
          loading={confirmLoading}
        >
          {confirmText}
        </DxButton>
      )}
    </>
  )

  // ローディング中はダイアログを閉じさせない
  // （Base UI の onOpenChange は ESC・背景クリック・閉じるボタンいずれの理由でも呼ばれるため、ここで一括ガードできる）
  const handleOpenChange = (next: boolean) => {
    if (confirmLoading && !next) return
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={maxWidthClass}
        hideCloseButton={confirmLoading}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {(footer || confirmText || cancelText) && (
          <DialogFooter>{footer || defaultFooter}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
