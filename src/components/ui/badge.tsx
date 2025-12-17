import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[rgba(59,130,246,0.14)] text-[#93C5FD] hover:bg-[rgba(59,130,246,0.2)]",
                secondary:
                    "border-transparent bg-surface-2 text-text border-border hover:bg-surface",
                outline: "text-text border-border",
                success: "border-transparent bg-[rgba(34,197,94,0.14)] text-[#86EFAC] hover:bg-[rgba(34,197,94,0.2)]",
                danger: "border-transparent bg-[rgba(239,68,68,0.14)] text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.2)]",
                warning: "border-transparent bg-[rgba(245,158,11,0.14)] text-[#FCD34D] hover:bg-[rgba(245,158,11,0.2)]",
                gold: "border-transparent bg-[rgba(199,164,107,0.16)] text-[#E7D3A7] hover:bg-[rgba(199,164,107,0.25)]",
                neutral: "border-transparent bg-[rgba(255,255,255,0.06)] text-muted hover:bg-[rgba(255,255,255,0.1)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
