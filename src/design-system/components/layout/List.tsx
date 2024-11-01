import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "design-system/utils/cn"

const listVariants = cva("", {
  variants: {
    gap: {
      xs: "space-y-1",
      sm: "space-y-2",
      md: "space-y-4",
      lg: "space-y-6",
      xl: "space-y-8",
    },
  },
  defaultVariants: {
    gap: "md",
  },
})

export interface ListProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listVariants> {}

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, gap, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(listVariants({ gap }), className)}
        {...props}
      />
    )
  }
)
List.displayName = "List"

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  interactive?: boolean
}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, interactive, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          "rounded-md",
          interactive && "cursor-pointer hover:bg-background-accent",
          className
        )}
        {...props}
      />
    )
  }
)
ListItem.displayName = "ListItem"

export { List, ListItem }