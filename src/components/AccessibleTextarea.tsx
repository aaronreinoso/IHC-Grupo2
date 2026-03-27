import React from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const AccessibleTextarea: React.FC<Props> = ({ label, error, helperText, id, ...props }) => {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={id} className="mb-1 text-sm font-semibold text-gray-800">
        {label}
      </label>
      {/* Texto de ayuda para guiar al usuario sin saturar la etiqueta principal */}
      {helperText && <span className="mb-2 text-xs text-gray-500">{helperText}</span>}
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        rows={4}
        className={`px-4 py-3 border rounded-md focus:outline-none focus:ring-2 transition-shadow resize-y ${
          error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'
        }`}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="mt-1 text-sm text-red-600 font-medium" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};