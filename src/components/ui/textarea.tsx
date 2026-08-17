import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "scroll-area flex min-h-[60px] w-full rounded-xl border-0 bg-white/12 px-3 py-2 text-sm backdrop-blur-xl placeholder:text-muted-foreground outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
