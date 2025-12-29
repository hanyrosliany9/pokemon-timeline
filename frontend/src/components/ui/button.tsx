import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ios-md text-sm font-semibold transition-all ease-ios-spring duration-ios-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-ios-1 hover:bg-primary/90 hover:shadow-ios-2 active:scale-[0.98]",
        destructive:
          "bg-ios-red text-white shadow-ios-1 hover:bg-ios-red/90 hover:shadow-ios-2 active:scale-[0.98]",
        outline:
          "border border-ios-separator bg-background shadow-ios-1 hover:bg-ios-background-secondary hover:border-ios-blue/50 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-ios-1 hover:bg-secondary/80 hover:shadow-ios-2 active:scale-[0.98]",
        ghost: "hover:bg-ios-background-secondary active:scale-[0.98]",
        link: "text-ios-blue underline-offset-4 hover:underline",
        glass:
          "bg-glass-light dark:bg-glass-dark backdrop-blur-ios-regular border border-ios-separator shadow-ios-elevated hover:bg-glass-elevated-light dark:hover:bg-glass-elevated-dark active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-9 rounded-ios-sm px-4 text-xs",
        lg: "h-12 rounded-ios-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
