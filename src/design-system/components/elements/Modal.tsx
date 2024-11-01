import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "design-system/utils/cn"
import { Stack } from "../layout/Stack"
import { Text } from "./Text"
import { Button } from "./Button"

const modalVariants = cva(
  "bg-background-overlay/80",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, isOpen, onClose, title, size, ...props }, ref) => {
    // Close on escape key
    React.useEffect(() => {
      if (!isOpen) return;
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
      }
      window.addEventListener("keydown", handleEscape)
      return () => window.removeEventListener("keydown", handleEscape)
    }, [isOpen, onClose])

    // Prevent body scroll when modal is open
    React.useEffect(() => {
      if (!isOpen) return;
      
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }, [isOpen])

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={cn(modalVariants({ size }), "absolute inset-0")}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal content */}
        <div
          className={cn(
            "relative bg-background-primary rounded-lg shadow-lg",
            size === "sm" && "w-full max-w-sm",
            size === "md" && "w-full max-w-md",
            size === "lg" && "w-full max-w-lg",
            size === "xl" && "w-full max-w-xl",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          ref={ref}
          {...props}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Text className="font-semibold">{title}</Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="relative">{children}</div>
        </div>
      </div>
    )
  }
)

Modal.displayName = "Modal"

export { Modal, modalVariants }