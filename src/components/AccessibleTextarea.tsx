import React from "react";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  inputClassName?: string;
  hideLabel?: boolean;
  hideError?: boolean;
}

export const AccessibleTextarea: React.FC<Props> = ({
  label,
  error,
  helperText,
  id,
  inputClassName = "",
  hideLabel = false,
  hideError = false,
  ...props
}) => {
  const describedBy =
    [props["aria-describedby"], !hideError && error ? `${id}-error` : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col mb-2">
      {!hideLabel && (
        <label htmlFor={id} className="mb-1 text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}

      {helperText && (
        <span className="mb-2 text-xs text-gray-600">{helperText}</span>
      )}

      <textarea
        id={id}
        aria-label={hideLabel ? label : undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        rows={4}
        className={`
          w-full
          min-h-[96px]
          px-4
          py-3
          border-2
          rounded-xl
          bg-white
          text-sm
          leading-relaxed
          text-gray-900
          placeholder:text-gray-500
          focus:outline-none
          resize-y
          transition-colors
          ${error ? "border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50" : inputClassName}
        `}
        {...props}
      />

      {!hideError && error && (
        <span
          id={`${id}-error`}
          className="mt-1 text-sm text-red-700 font-medium"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};