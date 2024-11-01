import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "design-system/utils/cn"

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-bold leading-tight text-text-primary",
      h2: "text-3xl font-bold leading-tight text-text-primary",
      h3: "text-2xl font-bold leading-tight text-text-primary",
      h4: "text-xl font-bold leading-tight text-text-primary",
      body: "text-base font-normal leading-normal text-text-primary",
      caption: "text-sm font-normal leading-tight text-text-primary",
      link: "text-text-accent no-underline cursor-pointer hover:underline",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

type TextVariant = VariantProps<typeof textVariants>["variant"]

interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4
}

export const Header = React.forwardRef<HTMLHeadingElement, HeaderProps>(
  ({ className, level = 1, ...props }, ref) => {
    const Tag = `h${level}` as const
    const variant = `h${level}` as TextVariant

    return (
      <Tag ref={ref} className={cn(textVariants({ variant }), className)} {...props} />
    )
  }
)
Header.displayName = "Header"

export const Text = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn(textVariants({ variant: "body" }), className)} {...props} />
  )
)
Text.displayName = "Text"

export const Paragraph = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn(textVariants({ variant: "body" }), className)} {...props} />
  )
)
Paragraph.displayName = "Paragraph"

export const Caption = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <small ref={ref} className={cn(textVariants({ variant: "caption" }), className)} {...props} />
  )
)
Caption.displayName = "Caption"

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, external, ...props }, ref) => (
    <a 
      ref={ref} 
      className={cn(textVariants({ variant: "link" }), className)} 
      {...props}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    />
  )
)
Link.displayName = "Link"

export { textVariants }