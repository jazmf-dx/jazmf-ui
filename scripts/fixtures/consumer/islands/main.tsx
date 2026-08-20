/* パッケージの export 面をすべて触る。非巻き上げレイアウトでは、
 * dx-ui が package.json に宣言していない依存（phantom dependency）を
 * ここで解決できずビルドが落ちる。 */
import {
  DxBadge, DxButton, DxButtonGroup, DxCard, DxConfirmDialog, DxDatePicker,
  DxDialog, DxDropdown, DxFormDialog, DxFormField, DxInput, DxPagination,
  DxSearchInput, DxTable, DxTabs, DxToast, DxToaster, registerGlobalDxToast,
} from '@jazmf-dx/dx-ui'
import {
  ConfirmDialogIsland, DxDatePickerIsland, DxFormDialogIsland, ToastListenerIsland,
} from '@jazmf-dx/dx-ui/islands'

// rollup が未使用 import を落とさないよう、実体を副作用のある形で参照する。
const registry = {
  DxBadge, DxButton, DxButtonGroup, DxCard, DxConfirmDialog, DxDatePicker,
  DxDialog, DxDropdown, DxFormDialog, DxFormField, DxInput, DxPagination,
  DxSearchInput, DxTable, DxTabs, DxToast, DxToaster, registerGlobalDxToast,
  ConfirmDialogIsland, DxDatePickerIsland, DxFormDialogIsland, ToastListenerIsland,
}

const missing = Object.entries(registry)
  .filter(([, value]) => value === undefined)
  .map(([name]) => name)

if (missing.length > 0) {
  throw new Error(`dx-ui の export が欠けています: ${missing.join(', ')}`)
}

;(globalThis as Record<string, unknown>).__dxUiVerify = registry
