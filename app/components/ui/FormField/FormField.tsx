import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
}

const FormField = ({
  label,
  id,
  error,
  children,
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
