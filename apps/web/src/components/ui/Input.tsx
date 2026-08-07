import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>}
        <input
          ref={ref}
          className={clsx(
            'premium-input',
            'placeholder:text-slate-400',
            error && 'border-danger-400 focus:border-danger-500 focus:ring-danger-100',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
        {helperText && <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
