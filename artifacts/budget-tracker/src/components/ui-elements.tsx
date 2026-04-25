import React from "react";
import { cn } from "@/lib/utils";

// --- CARD ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}
export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-6 shadow-sm border border-border/60 transition-all duration-300",
        hoverEffect && "hover:shadow-md hover:border-primary/20 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
      outline: "border-2 border-input bg-transparent hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
      ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
      danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
      success: "bg-success text-success-foreground shadow-sm hover:bg-success/90 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-11 px-5 py-2 font-medium",
      lg: "h-14 px-8 text-lg font-semibold rounded-xl",
      icon: "h-10 w-10 flex items-center justify-center rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-xl border-2 border-input bg-transparent px-4 py-2 text-sm shadow-sm transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// --- SELECT (Native styled) ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "flex h-12 w-full appearance-none rounded-xl border-2 border-input bg-card px-4 py-2 text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
            className
          )}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

// --- BADGE ---
export function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "danger" | "warning", className?: string }) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/10 text-success border border-success/20",
    danger: "bg-destructive/10 text-destructive border border-destructive/20",
    warning: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  };
  
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
}

// --- ANIMATED PAGE WRAPPER ---
export function PageTransition({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("w-full max-w-7xl mx-auto space-y-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
