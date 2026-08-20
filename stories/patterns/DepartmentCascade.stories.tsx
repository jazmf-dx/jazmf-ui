import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DxButton, DxFormField } from '../../components/dx'
import {
  fetchOrganizationUnits,
  toDepartmentTree,
  treeStats,
  type Department,
  type OrganizationUnit,
} from './_departmentTree'
import UNITS from '../fixtures/organization-units.json'

/**
 * 階層部署を「1段=1列」のカスケードでたどって 1 件選ぶパターン。
 *
 * <important>
 * このコンポーネントは `@jazmf-dx/dx-ui` には**入っていない**。
 * 人・組織・拠点の UI は `jazmf-directory` が所有する規約（README「置かないもの」
 * / Application UI Standard §5）に従い、実装は jazmf-directory 側にある。
 * ここにあるのは仕様を見るためのデモ実装で、`stories/` 配下なので配布物には含まれない。
 * </important>
 */

/* ------------------------------------------------------------------ *
 * デモ実装
 * 実装の正は jazmf-directory の
 * `backend/islands/src/islands/department-select/DepartmentSelect.tsx`。
 * ここでは props と挙動だけを同じにしてある（hidden input と change の
 * dispatch は Django フォーム連携の話なので Story では省く）。
 * ------------------------------------------------------------------ */

interface CascadeProps {
  departments: Department[]
  value?: string | null
  onValueChange?: (id: string) => void
  placeholder?: string
  leafOnly?: boolean
  showPath?: boolean
  maxLevels?: number
  error?: boolean
  disabled?: boolean
  className?: string
}

function findPath(nodes: Department[], id: string): Department[] | null {
  for (const node of nodes) {
    if (node.id === id) return [node]
    const found = node.children?.length ? findPath(node.children, id) : null
    if (found) return [node, ...found]
  }
  return null
}

function levelItems(nodes: Department[], activePath: number[], depth: number): Department[] {
  let items = nodes
  for (let i = 0; i < depth; i++) {
    const index = activePath[i]
    if (index === undefined || !items[index]) return []
    items = items[index].children ?? []
  }
  return items
}

function DepartmentCascade({
  departments,
  value = null,
  onValueChange,
  placeholder = '部署を選択',
  leafOnly = false,
  showPath = true,
  maxLevels = 4,
  error = false,
  disabled = false,
  className,
}: CascadeProps) {
  const [open, setOpen] = React.useState(false)
  const [activePath, setActivePath] = React.useState<number[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const selectedPath = React.useMemo(
    () => (value ? findPath(departments, value) : null),
    [departments, value],
  )

  const selectedIndices = React.useMemo(() => {
    if (!selectedPath) return []
    const indices: number[] = []
    let items = departments
    for (const node of selectedPath) {
      const index = items.findIndex((n) => n.id === node.id)
      if (index < 0) break
      indices.push(index)
      items = items[index].children ?? []
    }
    return indices
  }, [selectedPath, departments])

  // 開いた瞬間は選択済み部署の階層まで開いた状態にする
  React.useEffect(() => {
    if (open) setActivePath(selectedIndices)
  }, [open, selectedIndices])

  const columns = React.useMemo(() => {
    const result: Department[][] = []
    for (let depth = 0; depth < maxLevels; depth++) {
      const items = levelItems(departments, activePath, depth)
      if (!items.length) break
      result.push(items)
    }
    return result
  }, [departments, activePath, maxLevels])

  const label = selectedPath
    ? showPath
      ? selectedPath.map((n) => n.name).join(' / ')
      : selectedPath[selectedPath.length - 1].name
    : null

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return
    const target = event.target as HTMLElement
    const depth = Number(target.dataset.depth)
    const index = Number(target.dataset.index)
    if (Number.isNaN(depth) || Number.isNaN(index)) return
    const go = (d: number, i: number) => {
      const next = panelRef.current?.querySelector<HTMLButtonElement>(
        `[data-depth="${d}"][data-index="${i}"]`,
      )
      if (next) {
        event.preventDefault()
        next.focus()
      }
    }
    if (event.key === 'ArrowDown') go(depth, index + 1)
    else if (event.key === 'ArrowUp') go(depth, index - 1)
    else if (event.key === 'ArrowRight') go(depth + 1, 0)
    else if (event.key === 'ArrowLeft' && depth > 0) go(depth - 1, activePath[depth - 1] ?? 0)
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-invalid={error || undefined}
        onClick={() => setOpen((o) => !o)}
        className={[
          'input-field inline-flex items-center justify-between gap-2 text-left',
          !label ? 'text-gray-400' : '',
          error ? 'border-red-500' : '',
          disabled ? 'cursor-not-allowed bg-gray-50 text-gray-500' : '',
        ].join(' ')}
      >
        <span className="truncate">{label ?? placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <div
          ref={panelRef}
          onKeyDown={onKeyDown}
          className="absolute z-20 mt-1 flex max-w-[calc(100vw-3rem)] overflow-x-auto rounded-lg border border-border bg-popover shadow-lg"
        >
          {columns.map((items, depth) => (
            <ul
              key={depth}
              className={`max-h-64 w-56 shrink-0 overflow-y-auto py-1 ${
                depth < columns.length - 1 ? 'border-r border-border' : ''
              }`}
            >
              {items.map((node, index) => {
                const hasChildren = Boolean(node.children?.length) && depth + 1 < maxLevels
                const selectable = !node.disabled && !(leafOnly && Boolean(node.children?.length))
                const isSelected = node.id === value
                const isActive = activePath[depth] === index
                return (
                  <li key={node.id}>
                    <button
                      type="button"
                      data-depth={depth}
                      data-index={index}
                      disabled={!selectable && !hasChildren}
                      aria-current={isSelected ? 'true' : undefined}
                      onMouseEnter={() => setActivePath((p) => [...p.slice(0, depth), index])}
                      onFocus={() => setActivePath((p) => [...p.slice(0, depth), index])}
                      onClick={() => {
                        if (!selectable) return
                        onValueChange?.(node.id)
                        setOpen(false)
                      }}
                      className={[
                        'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm',
                        selectable ? 'hover:bg-gray-50' : 'cursor-default text-gray-400',
                        (isActive || isSelected) && selectable ? 'bg-gray-100' : '',
                        isSelected ? 'font-semibold text-primary' : '',
                      ].join(' ')}
                    >
                      <span className="truncate">{node.name}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {node.manager && (
                          <span className="text-[0.6875rem] text-gray-400">{node.manager}</span>
                        )}
                        {hasChildren && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

const FIXTURE_UNITS = UNITS as OrganizationUnit[]
const FIXTURE_TREE = toDepartmentTree(FIXTURE_UNITS)

const meta = {
  title: 'Patterns/部署カスケード選択',
  component: DepartmentCascade,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## これはどこの実装か

**\`@jazmf-dx/dx-ui\` には入っていない。** 人・組織・拠点の UI は \`jazmf-directory\` が
所有する規約（README の「置かないもの」／Application UI Standard §5）に従い、
実装は jazmf-directory の \`department-select\` island にある。

| | 場所 |
|---|---|
| 実装の正 | \`jazmf-directory\` \`backend/islands/src/islands/department-select/DepartmentSelect.tsx\` |
| 利用例 | \`dx-portal\` \`/ideas/create/\` の部署欄 |
| このページ | 仕様を見るためのデモ実装（\`stories/\` 配下なので npm パッケージには含まれない） |

## 使う場面

平坦な \`<select>\` は階層を表現できず、インデントした \`<option>\` は数十件を超えると破綻する。
**組織図の位置関係を見ながら選ばせたいとき**にこのパターンを使う。

同じ「部署を選ぶ」でも、目的の名前が分かっていて数百件から絞りたいなら
jazmf-directory の \`entity-picker\`（検索付き・API 往復あり）のほうが速い。置き換え関係ではない。

## 実データで見る

このページの既定データは \`stories/fixtures/organization-units.json\`
（**実データではなく、実 API と同じ形をしたサンプル**）。実際の組織で見るには次のどちらか。

**A. fixture を実データで差し替える**（Storybook を静的ビルドしても残る）

\`\`\`bash
curl -s -b "sessionid=<your-session>" \\
  "https://<directory-host>/api/v1/organization-units/?page_size=1000" \\
| jq '[.results[] | {id, code, name, unit_type, head_name, sort_order, abolished_on, parent_id}]' \\
> stories/fixtures/organization-units.json
\`\`\`

**B. 起動中の directory から直接読む**（\`Live\` ストーリー）

\`npm run storybook\` を手元で動かし、同じブラウザで directory にログイン済みなら
\`Live\` ストーリーが \`/api/v1/organization-units/\` を叩く。CORS とセッションが要るので、
CI で焼いた静的 Storybook からは基本的に届かない。失敗時は fixture に自動で落ちる。

## API の形とマッピング

\`/api/v1/organization-units/\` は **フラットな配列**（\`parent_id\` でつながる）を返す。
\`_departmentTree.ts\` の \`toDepartmentTree()\` が次の変換をしている。

| API | カスケード | 備考 |
|---|---|---|
| \`parent_id\` | ネスト構造 | \`null\` がルート |
| \`head_name\` | \`manager\` | 行の右端に小さく出る。UnitHead 由来なので空のこともある |
| \`abolished_on\` が今日以前 | \`disabled\` | 選択不可。ただし**子の展開は許可**する |
| \`sort_order\` → \`name\` | 並び順 | ページングをまたいで結合しても崩れないよう再ソートする |

親が見つからないノード（権限で親が見えない等）は**ルート扱いにして必ず表示する**。
黙って消すと「あるはずの部署が出ない」という最悪の壊れ方になるため。

## 注意事項

- **\`value\` は id であって経路ではない。** 同名の部署が別の親の下にあっても id が違えば別物
- **\`showPath\` の既定は \`true\`。** 欄が狭い画面（dx-portal の投稿フォーム右ペインなど）では \`false\`
- **中間ノードも既定で選択できる。** 課・係だけ選ばせるなら \`leafOnly\`
- **深さは \`maxLevels\`（既定 4）で頭打ち。** 実組織が 5 階層以上なら上げるか木を浅くする
- キーボードは ↑↓ で列内、→ で子の列、← で親の列、Enter で選択、Esc で閉じる
- **サーバー側の検証は別途必須。** \`leafOnly\` も廃止部署の除外も入力補助にすぎない
        `,
      },
    },
  },
  argTypes: {
    departments: { table: { disable: true } },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    placeholder: { control: 'text' },
    leafOnly: { control: 'boolean' },
    showPath: { control: 'boolean' },
    maxLevels: { control: { type: 'number', min: 1, max: 6 } },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    departments: FIXTURE_TREE,
    placeholder: '部署を選択',
  },
  decorators: [
    (Story) => (
      <div className="min-h-96 max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DepartmentCascade>

export default meta
type Story = StoryObj<typeof meta>

/** ツリーの規模を出す小さな見出し（実データに差し替えたとき効いてくる） */
function TreeSummary({ tree, source }: { tree: Department[]; source: string }) {
  const { count, depth } = treeStats(tree)
  return (
    <p className="mb-3 text-xs text-muted-foreground">
      {source} — {count} 部署 / 最大 {depth} 階層
    </p>
  )
}

/**
 * 既定。fixture（実 API と同じ形のサンプル）で表示する。
 *
 * 「管理本部 → 総務部」は `abolished_on` が過ぎているため選択できない。
 */
export const Default: Story = {
  render: (args) => {
    const [dept, setDept] = React.useState<string | undefined>(undefined)
    const path = dept ? findPath(args.departments, dept) : null
    return (
      <div className="space-y-3">
        <TreeSummary tree={args.departments} source="fixtures/organization-units.json" />
        <DepartmentCascade
          {...args}
          value={dept}
          onValueChange={(id) => setDept(id)}
          className="w-80"
        />
        <dl className="space-y-1 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <dt className="w-24">選択値（id）</dt>
            <dd className="font-mono text-xs">{dept ?? '（未選択）'}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24">経路</dt>
            <dd>{path ? path.map((n) => n.name).join(' / ') : '—'}</dd>
          </div>
        </dl>
      </div>
    )
  },
}

/**
 * 稼働中の jazmf-directory から**実データ**を読む。
 *
 * 同じブラウザで directory にログイン済みで、CORS が許可されている場合だけ成功する。
 * 失敗したら fixture に落として、その理由を出す。
 */
export const Live: Story = {
  argTypes: {
    // Live だけ接続先を変えられるようにする
    placeholder: { table: { disable: true } },
  },
  render: (args) => {
    const [baseUrl, setBaseUrl] = React.useState('http://localhost:8000')
    const [tree, setTree] = React.useState<Department[]>(args.departments)
    const [source, setSource] = React.useState('fixtures/organization-units.json（未接続）')
    const [loading, setLoading] = React.useState(false)
    const [dept, setDept] = React.useState<string | undefined>(undefined)

    const load = async () => {
      setLoading(true)
      try {
        const units = await fetchOrganizationUnits(baseUrl)
        setTree(toDepartmentTree(units))
        setSource(`${baseUrl}/api/v1/organization-units/`)
        setDept(undefined)
      } catch (e) {
        setSource(`取得できませんでした（${(e as Error).message}）— fixture を表示中`)
        setTree(FIXTURE_TREE)
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            directory のベース URL
            <input
              className="input-field w-72"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </label>
          <DxButton variant="secondary" onClick={load} loading={loading}>
            実データを読む
          </DxButton>
        </div>
        <TreeSummary tree={tree} source={source} />
        <DepartmentCascade
          {...args}
          departments={tree}
          value={dept}
          onValueChange={(id) => setDept(id)}
          className="w-96"
        />
      </div>
    )
  },
}

/**
 * 末端のみ選択可（`leafOnly`）。
 *
 * 子を持つノードは列を開くだけで選択されない。配属先の課・係のように、
 * 末端でなければ意味を持たない項目で使う。
 */
export const LeafOnly: Story = {
  render: (args) => {
    const [dept, setDept] = React.useState<string | undefined>(undefined)
    return (
      <DxFormField label="配属先" required helpText="課・係のみ選択できます">
        <DxDepartmentCascadeControlled args={args} value={dept} onChange={setDept} leafOnly />
      </DxFormField>
    )
  },
}

/** 経路表示の有無。欄が狭い画面では `showPath={false}` にする。 */
export const PathDisplay: Story = {
  render: (args) => {
    const [a, setA] = React.useState<string | undefined>(FIXTURE_TREE[0]?.children?.[0]?.children?.[0]?.id)
    const [b, setB] = React.useState<string | undefined>(a)
    return (
      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">showPath（既定）</p>
          <DepartmentCascade {...args} value={a} onValueChange={setA} className="w-72" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">showPath=false</p>
          <DepartmentCascade {...args} value={b} onValueChange={setB} showPath={false} className="w-72" />
        </div>
      </div>
    )
  },
}

/** エラー表示と無効化。 */
export const ErrorAndDisabled: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">error</p>
        <DepartmentCascade {...args} error className="w-72" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">disabled</p>
        <DepartmentCascade {...args} value={FIXTURE_TREE[0]?.id} disabled className="w-72" />
      </div>
    </div>
  ),
}

/** LeafOnly ストーリー用の小さなラッパー（Story 内で state を持つため） */
function DxDepartmentCascadeControlled({
  args,
  value,
  onChange,
  leafOnly,
}: {
  args: CascadeProps
  value?: string
  onChange: (id: string) => void
  leafOnly?: boolean
}) {
  return (
    <DepartmentCascade
      {...args}
      value={value}
      onValueChange={onChange}
      leafOnly={leafOnly}
      className="w-80"
    />
  )
}
