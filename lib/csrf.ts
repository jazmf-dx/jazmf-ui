/**
 * CSRF トークン取得ユーティリティ
 *
 * Django の CSRF cookie からトークンを取得します。
 * Cookie 名はプロジェクトの CSRF_COOKIE_NAME（例: `{{PROJECT_NAME}}_csrftoken`）に合わせて変更してください。
 */

const CSRF_COOKIE_NAME = '{{PROJECT_NAME}}_csrftoken'

/**
 * Cookie から CSRF トークンを取得
 *
 * @param cookieName - Cookie名（デフォルト: CSRF_COOKIE_NAME）
 * @returns CSRF トークン文字列、見つからない場合は空文字列
 */
export function getCsrfToken(cookieName: string = CSRF_COOKIE_NAME): string {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(cookieName + '=')) {
      return trimmed.substring(cookieName.length + 1)
    }
  }
  return ''
}

/**
 * fetch リクエスト用の CSRF ヘッダーを取得
 *
 * @example
 * ```ts
 * const headers = {
 *   'Content-Type': 'application/json',
 *   ...getCsrfHeaders(),
 * }
 * ```
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken()
  return token ? { 'X-CSRFToken': token } : {}
}
