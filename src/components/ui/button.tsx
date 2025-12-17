import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20",
                secondary: "bg-surface-2 border border-border-strong text-text hover:bg-surface hover:border-border shadow-sm",
                ghost: "hover:bg-[rgba(255,255,255,0.06)] text-muted hover:text-text",
                danger: "bg-[rgba(239,68,68,0.12)] text-danger border border-[rgba(239,68,68,0.25)] hover:bg-[rgba(239,68,68,0.2)]",
                outline: "border border-border bg-transparent hover:bg-surface-2 hover:text-text",
            },
            size: {
                default: "h-11 px-5 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-12 rounded-xl px-8",
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
