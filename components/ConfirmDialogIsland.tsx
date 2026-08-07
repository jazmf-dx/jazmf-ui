/**
 * ConfirmDialogIsland - Django Template から宣言的に使える確認ダイアログ
 *
 * Django Template に以下のように書くだけで使用できます:
 *
 * ```html
 * <div
 *   data-react="confirm-dialog"
 *   data-title="削除しますか？"
 *   data-message="この操作は取り消せません"
 *   data-type="danger"
 *   data-confirm-text="削除"
 *   data-url="/ideas/15/delete/"
 *   data-method="POST"
 * ></div>
 * ```
 *
 * トリガーボタンは別途用意し、JavaScript で以下を呼び出します:
 *
 * ```html
 * <button onclick="window.openConfirmDialog('confirm-dialog-id')">削除</button>
 * ```
 *
 * または Alpine.js から:
 *
 * ```html
 * <button @click="$dispatch('open-confirm-dialog', { id: 'confirm-dialog-id' })">削除</button>
 * ```
 */

import { useState, useEffect } from "react"
import { DxConfirmDialog, DxToast, DxToaster } from './dx'
import { getCsrfHeaders } from '../lib/csrf'

export interface ConfirmDialogIslandProps {
  /**
   * ダイアログのタイトル
   */
  title: string

  /**
   * 確認メッセージ
   */
  message: string

  /**
   * 詳細メッセージ（オプション）
   */
  detail?: string

  /**
   * ダイアログのタイプ
   * @default "info"
   */
  type?: "info" | "warning" | "danger" | "success"

  /**
   * 確定ボタンのテキスト
   * @default "OK"
   */
  confirmText?: string

  /**
   * キャンセルボタンのテキスト
   * @default "キャンセル"
   */
  cancelText?: string

  /**
   * 確定時にリクエストを送信する URL
   * 指定した場合は、確定時に fetch でリクエストを送信します
   */
  url?: string

  /**
   * HTTP メソッド（url が指定されている場合のみ有効）
   * @default "POST"
   */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

  /**
   * 送信するリクエストボディ（JSON）
   * url が指定されている場合のみ有効
   */
  body?: Record<string, unknown>

  /**
   * 成功時に表示するトーストメッセージ
   * 指定しない場合はトーストを表示しません
   */
  successMessage?: string

  /**
   * 成功時にページをリロードするか
   * @default false
   */
  reloadOnSuccess?: boolean

  /**
   * 成功時にリダイレクトする URL
   * 指定した場合は、成功後に window.location.href を変更します
   */
  redirectUrl?: string

  /**
   * 成功時に htmx イベントを発火するか
   * 指定した場合は、document.body に htmx:trigger イベントを発行します
   */
  htmxTrigger?: string

  /**
   * この Island の ID（複数のダイアログを区別するため）
   * data-react 要素の id 属性と一致させる必要があります
   */
  id?: string
}

export function ConfirmDialogIsland({
  title,
  message,
  detail,
  type = "info",
  confirmText = "OK",
  cancelText = "キャンセル",
  url,
  method = "POST",
  body,
  successMessage,
  reloadOnSuccess = false,
  redirectUrl,
  htmxTrigger,
  id,
}: ConfirmDialogIslandProps) {
  const [open, setOpen] = useState(false)

  // グローバル関数として登録（window.openConfirmDialog）
  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string }>
      // id が指定されている場合は一致する島のみ開く
      if (customEvent.detail?.id && customEvent.detail.id !== id) {
        return
      }
      setOpen(true)
    }

    // Alpine.js イベントリスナー
    document.addEventListener('open-confirm-dialog', handleOpen)

    // グローバル関数として登録
    if (id) {
      if (!window.openConfirmDialog) {
        window.openConfirmDialog = {} as Record<string, () => void>
      }
      (window.openConfirmDialog as Record<string, () => void>)[id] = () => setOpen(true)
    }

    return () => {
      document.removeEventListener('open-confirm-dialog', handleOpen)
      if (id && window.openConfirmDialog) {
        delete (window.openConfirmDialog as Record<string, () => void>)[id]
      }
    }
  }, [id])

  const handleConfirm = async () => {
    // URL が指定されていない場合は単に閉じる
    if (!url) {
      if (successMessage) {
        DxToast.success(successMessage)
      }
      return
    }

    // fetch でリクエストを送信
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `リクエストに失敗しました (${response.status})`)
    }

    // 成功時の処理
    if (successMessage) {
      DxToast.success(successMessage)
    }

    if (htmxTrigger) {
      // htmx イベントを発火
      if (typeof window.htmx !== 'undefined') {
        window.htmx.trigger(document.body, htmxTrigger)
      }
    }

    if (reloadOnSuccess) {
      window.location.reload()
    } else if (redirectUrl) {
      window.location.href = redirectUrl
    }
  }

  return (
    <>
      <DxConfirmDialog
        open={open}
        onOpenChange={setOpen}
        type={type}
        title={title}
        message={message}
        detail={detail}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={handleConfirm}
      />
      <DxToaster />
    </>
  )
}

// グローバル型定義
declare global {
  interface Window {
    openConfirmDialog?: Record<string, () => void>
    htmx?: {
      trigger: (element: HTMLElement, eventName: string) => void
      process: (element: HTMLElement) => void
      ajax: (
        verb: string,
        path: string,
        context: { target: HTMLElement; swap?: string }
      ) => Promise<void>
    }
  }
}
