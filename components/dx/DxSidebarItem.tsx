import * as React from "react"
import { cn } from "@/lib/utils"

export interface DxSidebarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  icon?: React.ReactNode
  badge?: React.ReactNode
  children?: React.ReactNode
}

export const DxSidebarItem = React.forwardRef<HTMLAnchorElement, DxSidebarItemProps>(
  ({ active = false, icon, badge, children, className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "group relative flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent select-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "text-primary bg-accent"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2.5">
        {icon}
        {children}
      </span>

      {badge !== undefined && badge !== null && (
        <span
          className={cn(
            "relative z-10 px-2 py-0.5 text-xs font-semibold rounded-full",
            active
              ? "bg-primary/20 text-primary"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          )}
        >
          {badge}
        </span>
      )}
    </a>
  )
)

DxSidebarItem.displayName = "DxSidebarItem"
