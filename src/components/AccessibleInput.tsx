import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AccessibleInput: React.FC<Props> = ({ label, error, id, ...props }) => {
  return (
    <div className="flex flex-col mb-4">
      {/* Label explícito conectado al input */}
      <label htmlFor={id} className="mb-1 text-sm font-semibold text-gray-800">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-shadow ${
          error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'
        }`}
        {...props}
      />
      {/* Feedback de error en tiempo real */}
      {error && (
        <span id={`${id}-error`} className="mt-1 text-sm text-red-600 font-medium" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};