import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-foreground text-white hover:bg-black/85",
    secondary:
      "border border-border bg-surface text-foreground hover:bg-background",
    accent: "bg-accent text-white hover:bg-accent/90",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;