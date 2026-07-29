/**
 * DxDropdown - 社内 UI ライブラリのドロップダウンメニューコンポーネント
 *
 * 行アクション（編集・削除・複製など）や、テーブル・カード上のメニューボタンで使用します。
 * shadcn/ui の DropdownMenu をラップし、`items` 配列を渡すだけで構築できる簡潔な API を提供します。
 *
 * 画面側では DxDropdown のみを使用し、shadcn/ui の DropdownMenu を直接使用しないでください。
 */

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface DxDropdownItem {
  /**
   * メニュー項目の一意なキー
   */
  key: string

  /**
   * 表示ラベル
   */
  label: React.ReactNode

  /**
   * 左側に表示するアイコン
   */
  icon?: React.ReactNode

  /**
   * クリック時のコールバック
   */
  onSelect?: () => void

  /**
   * 危険な操作（削除など）を赤色で表示
   */
  danger?: boolean

  /**
   * 無効化
   */
  disabled?: boolean

  /**
   * この項目の直前に区切り線を表示
   */
  separatorBefore?: boolean
}

export interface DxDropdownProps {
  /**
   * メニューを開くトリガー要素（通常は DxButton や IconButton）
   */
  trigger: React.ReactNode

  /**
   * メニュー項目一覧
   */
  items: DxDropdownItem[]

  /**
   * メニュー上部に表示するラベル（オプション）
   */
  label?: React.ReactNode

  /**
   * メニューの配置位置
   * @default "end"
   */
  align?: "start" | "center" | "end"
}

/**
 * DxDropdown コンポーネント
 *
 * @example
 * ```tsx
 * // タスクカードの行アクション（編集・削除）
 * <DxDropdown
 *   trigger={
 *     <DxButton variant="ghost" size="icon">
 *       <MoreVertical className="w-4 h-4" />
 *     </DxButton>
 *   }
 *   items={[
 *     { key: "edit", label: "編集", icon: <Pencil className="w-4 h-4" />, onSelect: handleEdit },
 *     { key: "archive", label: "アーカイブ", icon: <Archive className="w-4 h-4" />, onSelect: handleArchive },
 *     {
 *       key: "delete",
 *       label: "削除",
 *       icon: <Trash className="w-4 h-4" />,
 *       danger: true,
 *       separatorBefore: true,
 *       onSelect: () => setDeleteConfirmOpen(true),
 *     },
 *   ]}
 * />
 * ```
 */
export const DxDropdown = ({
  trigger,
  items,
  label,
  align = "end",
}: DxDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger as React.ReactElement} />
      <DropdownMenuContent align={align}>
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {items.map((item) => (
          <React.Fragment key={item.key}>
            {item.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              disabled={item.disabled}
              onClick={item.onSelect}
              className={cn(
                item.danger &&
                  "text-red-600 data-highlighted:bg-red-50 data-highlighted:text-red-600"
              )}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
