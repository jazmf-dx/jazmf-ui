/**
 * DxFormDialogIsland - Django Template から宣言的に使えるフォームダイアログ
 *
 * このコンポーネントの責務は「ダイアログ（枠）」だけです。
 * フォームの中身は React では組み立てず、htmx が Django View から取得した
 * HTML（Django Template でレンダリングされたフォーム）をそのまま表示します。
 *
 * 構成:
 *   [ボタン click]
 *     → React が Dialog を開く
 *       → htmx が data-form-url を GET
 *         → Django View が Django Form を Django Template でレンダリング
 *           → 返ってきた HTML をそのまま Dialog 内に表示（JSON 化しない）
 *
 * フォーム送信も htmx（hx-post）で Django View に送り、
 *   - 成功: サーバが HX-Trigger / HX-Redirect などで通知 → ダイアログを閉じる
 *   - バリデーションエラー: サーバがエラー付きフォーム HTML を再レンダリング
 *                          → その HTML をそのまま差し替え表示
 *
 * Django Template での使い方:
 *
 * ```html
 * <div
 *   data-react="form-dialog"
 *   id="task-create-dialog"
 *   data-title="新規タスク作成"
 *   data-description="タスクの情報を入力してください。"
 *   data-form-url="{% url 'tasks:create_form' %}"
 * ></div>
 *
 * <button @click="$dispatch('open-form-dialog', { id: 'task-create-dialog' })">
 *   新規作成
 * </button>
 * ```
 *
 * Django View（フォーム取得・送信の両方を担当）:
 *
 * ```python
 * def create_form(request):
 *     if request.method == "POST":
 *         form = TaskForm(request.POST)
 *         if form.is_valid():
 *             form.save()
 *             # 成功: htmx にダイアログを閉じてリロードするよう通知
 *             resp = HttpResponse(status=204)
 *             resp["HX-Trigger"] = "dx-form-success"
 *             return resp
 *         # バリデーションエラー: フォーム HTML をそのまま返す（エラー表示付き）
 *         return render(request, "tasks/partials/task_form.html", {"form": form})
 *     # GET: 空のフォームを返す
 *     return render(request, "tasks/partials/task_form.html", {"form": TaskForm()})
 * ```
 */

import { useEffect, useRef, useState } from "react"
import { DxDialog, DxToast, DxToaster } from './dx'

export interface DxFormDialogIslandProps {
  /**
   * この Island の ID（複数のダイアログを区別するため）
   * data-react 要素の id 属性と一致させる必要があります
   */
  id?: string

  /**
   * ダイアログのタイトル
   */
  title: string

  /**
   * ダイアログの説明文（オプション）
   */
  description?: string

  /**
   * フォーム HTML を取得する URL（Django View）
   * ダイアログを開いたときに htmx でこの URL を GET し、
   * 返ってきた HTML をそのまま表示します。
   */
  formUrl: string

  /**
   * ダイアログの最大幅
   * @default "lg"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"

  /**
   * 送信成功時に発火する htmx イベント名。
   * Django View が HX-Trigger でこのイベント名を返すと、ダイアログを閉じます。
   * @default "dx-form-success"
   */
  successEvent?: string

  /**
   * 送信成功時に表示するトーストメッセージ（オプション）
   */
  successMessage?: string

  /**
   * 送信成功時にページをリロードするか
   * @default true
   */
  reloadOnSuccess?: boolean

  /**
   * 送信成功時にリダイレクトする URL（オプション）
   * 指定した場合は reloadOnSuccess より優先されます。
   */
  redirectUrl?: string
}

export function DxFormDialogIsland({
  id,
  title,
  description,
  formUrl,
  maxWidth = "lg",
  successEvent = "dx-form-success",
  successMessage,
  reloadOnSuccess = true,
  redirectUrl,
}: DxFormDialogIslandProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  // htmx が取得した Django Template の HTML を差し込むコンテナ
  const bodyRef = useRef<HTMLDivElement>(null)

  // ダイアログを開くトリガー（Alpine.js イベント / グローバル関数）
  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string }>
      if (customEvent.detail?.id && customEvent.detail.id !== id) {
        return
      }
      setOpen(true)
    }

    document.addEventListener("open-form-dialog", handleOpen)

    if (id) {
      if (!window.openFormDialog) {
        window.openFormDialog = {} as Record<string, () => void>
      }
      window.openFormDialog[id] = () => setOpen(true)
    }

    return () => {
      document.removeEventListener("open-form-dialog", handleOpen)
      if (id && window.openFormDialog) {
        delete window.openFormDialog[id]
      }
    }
  }, [id])

  // ダイアログを開いたら htmx で Django からフォーム HTML を取得して差し込む
  useEffect(() => {
    if (!open) return
    const container = bodyRef.current
    const htmx = window.htmx
    if (!container || !htmx) return

    setLoading(true)

    // htmx.ajax: GET でフォーム HTML を取得し、コンテナにそのまま挿入する。
    // レスポンスは Django Template がレンダリングした HTML そのもの（JSON ではない）。
    htmx
      .ajax("GET", formUrl, { target: container, swap: "innerHTML" })
      .then(() => {
        // 挿入した HTML 内の htmx 属性（hx-post 等）を有効化する
        htmx.process(container)
        setLoading(false)
      })
      .catch(() => {
        container.innerHTML =
          '<p class="text-sm text-red-600">フォームの読み込みに失敗しました。</p>'
        setLoading(false)
      })
  }, [open, formUrl])

  // フォーム送信の成否を htmx イベントで受け取る
  useEffect(() => {
    if (!open) return
    const container = bodyRef.current
    if (!container) return

    // 成功イベント（Django View が HX-Trigger で返す）
    const handleSuccess = () => {
      if (successMessage) {
        DxToast.success(successMessage)
      }
      setOpen(false)
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else if (reloadOnSuccess) {
        window.location.reload()
      }
    }

    // 送信後の HTML 差し替え（バリデーションエラー時）でも htmx 属性を有効化
    const handleAfterSwap = (event: Event) => {
      const target = (event as CustomEvent).target as HTMLElement
      if (container.contains(target) || target === container) {
        window.htmx?.process(container)
      }
    }

    // 送信中のローディング表示
    const handleBeforeRequest = (event: Event) => {
      const target = (event as CustomEvent).target as HTMLElement
      if (container.contains(target)) setLoading(true)
    }
    const handleAfterRequest = (event: Event) => {
      const target = (event as CustomEvent).target as HTMLElement
      if (container.contains(target)) setLoading(false)
    }

    document.body.addEventListener(successEvent, handleSuccess)
    document.body.addEventListener("htmx:afterSwap", handleAfterSwap)
    document.body.addEventListener("htmx:beforeRequest", handleBeforeRequest)
    document.body.addEventListener("htmx:afterRequest", handleAfterRequest)

    return () => {
      document.body.removeEventListener(successEvent, handleSuccess)
      document.body.removeEventListener("htmx:afterSwap", handleAfterSwap)
      document.body.removeEventListener("htmx:beforeRequest", handleBeforeRequest)
      document.body.removeEventListener("htmx:afterRequest", handleAfterRequest)
    }
  }, [open, successEvent, successMessage, reloadOnSuccess, redirectUrl])

  return (
    <>
      <DxDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        maxWidth={maxWidth}
      >
        {/* React は枠だけ。中身は htmx が Django から取得した HTML をそのまま表示する */}
        <div ref={bodyRef} className="dx-form-dialog-body">
          {loading && (
            <p className="text-sm text-gray-500">読み込み中...</p>
          )}
        </div>
      </DxDialog>
      <DxToaster />
    </>
  )
}

// グローバル型定義
declare global {
  interface Window {
    openFormDialog?: Record<string, () => void>
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
