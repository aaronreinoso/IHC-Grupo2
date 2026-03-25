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
  min?: number | string; // <-- Propiedad añadida
  max?: number | string; // <-- Propiedad añadida
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
  min, 
}) => {
  const errorId = `${name}-error`;
  const counterId = `${name}-counter`;
  const describedBy = [error ? errorId : null, maxLength ? counterId : null].filter(Boolean).join(" ");

  const baseInputStyles = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${error ? "red" : "#d1d5db"}`,
    outline: "none",
    fontSize: "16px",
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={name} style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
        {label}
        {required && <span style={{ color: "red" }} aria-hidden="true"> *</span>}
      </label>
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
          style={{ ...baseInputStyles, minHeight: "80px", resize: "vertical" }}
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
          min={min} 
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          style={baseInputStyles}
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