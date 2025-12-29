import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-ios-md border border-ios-separator bg-transparent px-4 py-3 text-base shadow-ios-1 transition-all ease-ios-spring duration-ios-fast file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ios-secondary-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
