import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[4.5rem] w-full rounded-lg border border-input bg-card px-3 py-2 text-[15px] font-normal tracking-[-0.02em] text-foreground transition-colors outline-none placeholder:text-white/40 focus-visible:border-[#0099ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,153,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
