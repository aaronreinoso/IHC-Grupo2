import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  as = "input",
  required = false,
  minLength,
  maxLength,
  placeholder,
}) => {
  const errorId = `${name}-error`;
  const counterId = `${name}-counter`;
  const describedBy = [error ? errorId : null, maxLength ? counterId : null].filter(Boolean).join(" ");

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={name} style={{ fontWeight: "bold" }}>
        {label}
        {required && <span style={{ color: "red" }} aria-hidden="true"> *</span>}
      </label>
      <br />
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          style={{ width: "100%", minHeight: "60px", resize: "vertical" }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          style={{ width: "100%" }}
        />
      )}
      {error && (
        <div id={errorId} role="alert" style={{ color: "red", fontSize: "0.9em", marginTop: "4px" }}>
          {error}
        </div>
      )}
      {maxLength && (
        <div id={counterId} aria-live="polite" style={{ textAlign: "right", fontSize: "0.8em", color: value.toString().length > maxLength ? "red" : "#666", marginTop: "2px" }}>
          {value.toString().length} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default FormField;