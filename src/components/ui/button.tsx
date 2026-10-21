import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

// shadcn/ui Button, restyled to the app tokens.
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[5px] px-4 py-2.5 font-semibold leading-snug no-underline disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-ink text-bg",
        ghost: "border border-line bg-transparent text-ink",
        link: "p-0 text-sm font-normal text-accent underline underline-offset-[3px]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, className }))} {...props} />;
}

export { Button, buttonVariants };
