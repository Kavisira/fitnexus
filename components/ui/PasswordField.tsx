"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder = "Enter password",
  error,
  disabled = false,
  autoComplete,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

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
        <Lock className="mr-3 text-slate-500" size={19} />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full border-0 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-slate-500 hover:text-orange-500 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}