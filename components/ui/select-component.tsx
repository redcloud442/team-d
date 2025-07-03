"use client";

import clsx from "clsx";
import { Triangle } from "lucide-react";
import { Control, useController } from "react-hook-form";

type Option = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  name: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  options: Option[];
  onChange?: (value: string) => void;
};

const SelectField = ({
  name,
  label,
  control,
  options,
  onChange,
}: SelectFieldProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const selected = options.find((opt) => opt.value === field.value);

  return (
    <div className="relative w-full">
      <div
        className={clsx(
          "rounded-md border-2 px-4 pt-2 pb-3 transition-colors",
          {
            "border-bg-primary-blue": !error,
            "border-red-500": !!error,
          }
        )}
      >
        {/* Label */}
        <label className="block text-lg text-white font-normal mb-1">
          {label}
        </label>

        {/* Displayed value (styled like your screenshot) */}
        <div className="flex items-center justify-between">
          <span
            className={clsx("text-lg font-normal", {
              "text-bg-primary-blue": selected,
              "text-white": !selected,
            })}
          >
            {selected ? selected.label : "Select Mode of Payment"}
          </span>

          <Triangle className="w-4 h-4 text-cyan-400 rotate-180" fill="cyan" />
        </div>

        {/* Actual hidden <select> */}
        <select
          {...field}
          onChange={(e) => {
            field.onChange(e);
            onChange?.(e.target.value);
          }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer bg-bg-primary p-4"
        >
          <option value="" disabled hidden></option>
          {options.map((opt) => (
            <option className="text-white" key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

export default SelectField;
