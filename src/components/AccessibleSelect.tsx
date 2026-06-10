import React from 'react';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const AccessibleSelect: React.FC<Props> = ({ label, error, id, children, ...props }) => {
  const describedBy =
    [props['aria-describedby'], error ? `${id}-error` : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={id} className="mb-1 text-sm font-semibold text-gray-800">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`
          w-full
          min-h-[48px]
          px-4
          py-3
          border-2
          rounded-xl
          bg-white
          text-sm
          text-gray-900
          placeholder:text-gray-500
          focus:outline-none
          transition-colors
          ${error ? "border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-blue-300"}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span id={`${id}-error`} className="mt-1 text-sm text-red-700 font-medium" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};