import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: Label primitive forwardRef designed to wrap or bind with htmlFor
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold tracking-wide text-foreground/90 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  ),
);
Label.displayName = "Label";

export { Label };
