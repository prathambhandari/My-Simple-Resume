import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-[15px] font-normal tracking-[-0.02em] text-foreground transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-white/40 focus-visible:border-[#0099ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,153,255,0.15)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-[15px]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
