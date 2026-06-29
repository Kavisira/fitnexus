"use client";

import React from "react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  maxLength?: number;
  autoComplete?: string;
}

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  error,
  type = "text",
  disabled = false,
  maxLength,
  autoComplete,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <div
        className={`flex h-12 items-center rounded-xl border px-4 transition-all duration-200 ${
          error
            ? "border-red-500 focus-within:border-red-500"
            : "border-slate-200 focus-within:border-orange-500"
        }`}
      >
        {icon && <span className="mr-3 text-slate-500">{icon}</span>}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          disabled={disabled}
          className="w-full border-0 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}