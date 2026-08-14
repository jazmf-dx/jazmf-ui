/**
 * DX UI Library - 社内 UI コンポーネントライブラリ
 *
 * <important>
 * ここに置くのは、**次のどちらかを満たすものだけ**。
 * 満たさない基本 UI は shadcn/ui を各プロジェクトで直接使う（ラッパーを作らない）。
 *
 * 1. Django テンプレート側の CSS クラス（`btn-*` / `input-field` / `badge` /
 *    `card` / `data-table`）と React の見た目パリティが必要なもの
 * 2. 繰り返し踏むロジック・ポリシーを内包するもの
 *    （DxTable の空状態必須 API、DxConfirmDialog の loading/error 内包、
 *      DxFormField の必須表示とエラー配置、DxDatePicker の ja locale など）
 *
 * 判断の根拠は ai-dev-standards の Application UI Standard §1 / §5。
 * </important>
 *
 * 各コンポーネントの仕様・使用例・使わない場面は Storybook を参照してください。
 *   npm run storybook
 */

export { DxButton } from "./DxButton"
export type { DxButtonProps } from "./DxButton"

export { DxDialog } from "./DxDialog"
export type { DxDialogProps } from "./DxDialog"

export { DxConfirmDialog } from "./DxConfirmDialog"
export type { DxConfirmDialogProps } from "./DxConfirmDialog"

export { DxFormDialog } from "./DxFormDialog"
export type { DxFormDialogProps } from "./DxFormDialog"

export { DxToast, DxToaster, registerGlobalDxToast } from "./DxToast"
export type { DxToastOptions, DxToastType } from "./DxToast"

export { DxDropdown } from "./DxDropdown"
export type { DxDropdownProps, DxDropdownItem } from "./DxDropdown"

export { DxDatePicker } from "./DxDatePicker"
export type {
  DxDatePickerProps,
  DxDatePickerMode,
  DxDatePickerValue,
} from "./DxDatePicker"

export { DxInput } from "./DxInput"
export type { DxInputProps } from "./DxInput"

export { DxButtonGroup } from "./DxButtonGroup"
export type { DxButtonGroupProps, DxButtonGroupItem } from "./DxButtonGroup"

export { DxCard } from "./DxCard"
export type { DxCardProps, DxCardPadding } from "./DxCard"

export { DxTable } from "./DxTable"
export type { DxTableProps, DxTableColumn } from "./DxTable"

export { DxFormField } from "./DxFormField"
export type { DxFormFieldProps } from "./DxFormField"

export { DxTabs } from "./DxTabs"
export type { DxTabsProps, DxTabItem } from "./DxTabs"

export { DxPagination } from "./DxPagination"
export type { DxPaginationProps } from "./DxPagination"

export { DxBadge } from "./DxBadge"
export type { DxBadgeProps, DxBadgeTone } from "./DxBadge"

export { DxSearchInput } from "./DxSearchInput"
export type { DxSearchInputProps } from "./DxSearchInput"
