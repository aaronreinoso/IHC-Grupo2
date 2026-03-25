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
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={name} style={{ fontWeight: "bold" }}>
        {label}
        {required && <span style={{ color: "red" }}> *</span>}
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
          style={{ width: "100%" }}
        />
      )}
      {error && <div style={{ color: "red", fontSize: "0.9em" }}>{error}</div>}
    </div>
  );
};

export default FormField;