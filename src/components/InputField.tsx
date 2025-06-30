import React from "react";
import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-1/4"}>
      <label className='text-gray-500 text-sm'>{label}</label>
      <input
        type={type}
        {...register(name)}
        defaultValue={defaultValue}
        {...inputProps}
        className='ring-[1.5px] ring-gray-300 rounded-md p-2 focus:outline-none text-sm w-full'
        {...inputProps}
      />
      {error?.message && <p className='text-red-500'>{error.message}</p>}
    </div>
  );
};

export default InputField;
