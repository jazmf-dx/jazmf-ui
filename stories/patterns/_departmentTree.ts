/**
 * 部署カスケードの Story 用ヘルパー。
 *
 * jazmf-directory の `/api/v1/organization-units/` が返す**フラットな**組織単位を、
 * カスケード表示用のネストツリーに組み替える。Story からしか使わないため
 * `stories/` に置く（`package.json` の `files` に `stories` は含まれないので配布されない）。
 *
 * 実データの取り込み方は DepartmentCascade.stories.tsx の Docs を参照。
 */

/** `/api/v1/organization-units/` の 1 レコード（この Story が使うフィールドのみ） */
export interface OrganizationUnit {
  id: string
  code: string
  name: string
  unit_type?: string
  unit_type_display?: string
  /** 部署長の氏名。UnitHead 由来（発令日つき）なので空のこともある */
  head_name?: string | null
  sort_order?: number | null
  established_on?: string | null
  /** 廃止日。過ぎていれば選択不可にする */
  abolished_on?: string | null
  /** 親の id。null ならルート */
  parent_id?: string | null
}

/** カスケードが受け取るノード（jazmf-directory の island の `Department` と同じ形） */
export interface Department {
  id: string
  name: string
  manager?: string
  disabled?: boolean
  children?: Department[]
}

/** 廃止日が今日以前なら廃止済みとみなす */
function isAbolished(unit: OrganizationUnit, today: string): boolean {
  return Boolean(unit.abolished_on && unit.abolished_on <= today)
}

/**
 * フラットな組織単位（`parent_id` でつながる）をネストツリーに組み替える。
 *
 * - `head_name` → `manager`（行の右端に出る）
 * - 廃止済み → `disabled`（選択不可だが、子の展開は許可される）
 * - 並び順は `sort_order` → `name` の順。API が既にこの順で返すが、
 *   ページングをまたいで結合した場合に崩れるため Story 側でも並べ直す
 *
 * 親が見つからないノード（権限で親が見えない等）はルート扱いにして必ず表示する。
 * 黙って消すと「あるはずの部署が出ない」という最悪の壊れ方になるため。
 */
export function toDepartmentTree(
  units: OrganizationUnit[],
  options: { today?: string } = {},
): Department[] {
  const today = options.today ?? new Date().toISOString().slice(0, 10)

  const nodes = new Map<string, Department>()
  for (const unit of units) {
    nodes.set(unit.id, {
      id: unit.id,
      name: unit.name,
      ...(unit.head_name ? { manager: unit.head_name } : {}),
      ...(isAbolished(unit, today) ? { disabled: true } : {}),
    })
  }

  const roots: Department[] = []
  for (const unit of units) {
    const node = nodes.get(unit.id)!
    const parent = unit.parent_id ? nodes.get(unit.parent_id) : undefined
    if (parent) {
      ;(parent.children ??= []).push(node)
    } else {
      roots.push(node)
    }
  }

  const order = new Map(units.map((u) => [u.id, u]))
  const sortLevel = (list: Department[]) => {
    list.sort((a, b) => {
      const ua = order.get(a.id)
      const ub = order.get(b.id)
      const sa = ua?.sort_order ?? Number.MAX_SAFE_INTEGER
      const sb = ub?.sort_order ?? Number.MAX_SAFE_INTEGER
      if (sa !== sb) return sa - sb
      return a.name.localeCompare(b.name, 'ja')
    })
    for (const node of list) if (node.children) sortLevel(node.children)
  }
  sortLevel(roots)

  return roots
}

/** ツリーの総ノード数と最大深さ（Story の表示用） */
export function treeStats(tree: Department[]): { count: number; depth: number } {
  let count = 0
  let depth = 0
  const walk = (list: Department[], level: number) => {
    depth = Math.max(depth, level)
    for (const node of list) {
      count++
      if (node.children?.length) walk(node.children, level + 1)
    }
  }
  walk(tree, 1)
  return { count, depth }
}

/**
 * 稼働中の jazmf-directory から実データを取得する。
 *
 * Storybook は静的ビルドなので、CI で焼いた Storybook からは基本的に届かない。
 * 手元で `npm run storybook` を動かし、ブラウザが directory に**ログイン済み**で
 * かつ CORS が許可されている場合にだけ成功する。失敗したら fixture に落とす。
 */
export async function fetchOrganizationUnits(baseUrl: string): Promise<OrganizationUnit[]> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/organization-units/?page_size=1000`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const data = await res.json()
  return Array.isArray(data) ? data : (data.results ?? [])
}
