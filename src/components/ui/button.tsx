import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-[15px] font-medium tracking-[-0.02em] whitespace-nowrap transition-colors outline-none select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0099ff] focus-visible:outline-offset-[3px] disabled:pointer-events-none disabled:opacity-50 aria-invalid:focus-visible:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-none hover:bg-primary/92 [a]:hover:bg-primary/92",
        outline:
          "border-transparent bg-white/10 text-white hover:bg-white/[0.14] aria-expanded:bg-white/[0.14]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-white/[0.16] aria-expanded:bg-secondary",
        ghost:
          "text-white hover:bg-white/10 aria-expanded:bg-white/10 rounded-full",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive/25 dark:bg-destructive/20 dark:hover:bg-destructive/35",
        link: "rounded-none px-0 py-0 font-normal text-[#0099ff] underline decoration-1 underline-offset-4 shadow-none hover:text-[#0099ff]/85 h-auto hover:underline focus-visible:outline-none focus-visible:shadow-none",
      },
      size: {
        default:
          "h-11 min-h-[44px] gap-2 px-[18px] py-2.5 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        xs: "h-8 gap-1 px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 text-[0.8125rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 py-3 text-base has-data-[icon=inline-end]:pr-7 has-data-[icon=inline-start]:pl-7",
        icon: "size-11 rounded-full",
        "icon-xs":
          "size-8 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
