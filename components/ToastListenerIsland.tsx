/**
 * ToastListenerIsland - 全ページ共通のトースト通知ハブ（Django Template 用）
 *
 * このコンポーネントを base.html に 1 つだけ置くことで、プロジェクト全体の通知が
 * DxToast に一本化されます。責務は次の 3 つ:
 *
 * 1. DxToaster（トーストの表示領域）をマウントする
 * 2. window.DxToast / window.showToast をグローバル登録する
 *    → 素の JS・Alpine.js・htmx から window.DxToast.success(...) で呼べる
 *    → 既存の window.showToast(text, type) も DxToast に転送される
 * 3. Django messages を初期表示する
 *    → data-messages に渡された messages.success()/error() をトースト化
 *
 * Django Template（base.html）での使い方:
 *
 * ```html
 * <div
 *   data-react="toast-listener"
 *   data-messages='[{"text": "保存しました", "type": "success"}]'
 * ></div>
 * ```
 *
 * data-messages は Django の messages を JSON 化したもの。空なら省略可。
 */

import { useEffect } from "react"
import { DxToast, DxToaster, registerGlobalDxToast } from './dx'
import type { DxToastType } from './dx/DxToast'

interface DjangoMessage {
  text: string
  type: DxToastType
}

export interface ToastListenerIslandProps {
  /** Django messages を JSON 化した配列（オプション） */
  messages?: DjangoMessage[]
}

export function ToastListenerIsland({ messages }: ToastListenerIslandProps) {
  // グローバル関数を登録（一度だけ）
  useEffect(() => {
    registerGlobalDxToast()
  }, [])

  // Django messages を初期表示（複数は少しずつずらして表示）
  useEffect(() => {
    if (!messages || messages.length === 0) return
    const timers = messages.map((msg, index) =>
      window.setTimeout(() => {
        const type: DxToastType =
          msg.type === "success" ||
          msg.type === "error" ||
          msg.type === "warning" ||
          msg.type === "info"
            ? msg.type
            : "info"
        DxToast[type](msg.text)
      }, index * 200)
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [messages])

  return <DxToaster />
}
