import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-ios-md border border-ios-separator bg-transparent px-4 py-3 text-base shadow-ios-1 transition-all ease-ios-spring duration-ios-fast placeholder:text-ios-secondary-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
