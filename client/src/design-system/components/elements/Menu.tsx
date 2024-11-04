import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "design-system/utils/cn"

const menuVariants = cva(
  "bg-background-primary border border-border rounded-md shadow-lg overflow-hidden",
  {
    variants: {
      size: {
        sm: "w-32",
        md: "w-48",
        lg: "w-64",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface MenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof menuVariants> {}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(menuVariants({ size }), className)}
        {...props}
      />
    )
  }
)
Menu.displayName = "Menu"

const MenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-4 py-2 text-sm cursor-pointer hover:bg-background-accent",
      className
    )}
    {...props}
  />
))
MenuItem.displayName = "MenuItem"

export { Menu, MenuItem } 