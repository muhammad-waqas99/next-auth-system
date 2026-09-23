import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = ({
  error = false,
  className = "",
  ...props
}: InputProps) => {
  const baseStyles =
    "w-full min-h-11 rounded-lg border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

  const stateStyles = error
    ? "border-error focus:border-error focus:ring-error/20"
    : "border-border focus:border-accent focus:ring-accent/20";

  return (
    <input
      className={`${baseStyles} ${stateStyles} ${className}`}
      {...props}
    />
  );
};

export default Input;

