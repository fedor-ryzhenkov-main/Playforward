import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "design-system/utils/cn"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background-primary px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-accent disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      error: {
        true: "border-error focus-visible:ring-error",
      },
    },
    defaultVariants: {
      error: false,
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ error }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }