import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inbox, Send, FileText, Settings } from 'lucide-react'
import { DxSidebarItem } from '../../components/dx'

const meta = {
  title: 'Components/DxSidebarItem',
  component: DxSidebarItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
React Island 内のサイドバー項目。選択中の項目を背景とテキストカラーで示す。

**何に使うか**: 動的に選択状態が変わるサイドバー（React Island 内のみ）
**何に使わないか**: Django テンプレートのナビ（\`sidebar.html\` / \`global_nav.html\` を使う）、単発のボタン（\`DxButton\`）

セマンティックトークン（\`text-primary\` / \`bg-accent\`）のみを使い、\`activeColor\` のような variant 発散を避ける。
        `,
      },
    },
  },
  args: {
    children: '受信トレイ',
    icon: <Inbox className="w-4 h-4" />,
    active: true,
    href: '#',
  },
} satisfies Meta<typeof DxSidebarItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Inactive: Story = {
  args: { active: false },
}

export const WithBadge: Story = {
  args: { badge: 5 },
}

export const NavigationGroup: Story = {
  render: () => {
    const items = [
      { value: 'inbox', label: '受信トレイ', icon: <Inbox className="w-4 h-4" />, badge: 5 },
      { value: 'sent', label: '送信済み', icon: <Send className="w-4 h-4" /> },
      { value: 'drafts', label: '下書き', icon: <FileText className="w-4 h-4" />, badge: 2 },
      { value: 'settings', label: '設定', icon: <Settings className="w-4 h-4" /> },
    ]

    return (
      <div className="w-56 space-y-1">
        {items.map((item) => (
          <DxSidebarItem
            key={item.value}
            active={item.value === 'inbox'}
            icon={item.icon}
            badge={item.badge}
            href="#"
          >
            {item.label}
          </DxSidebarItem>
        ))}
      </div>
    )
  },
}
