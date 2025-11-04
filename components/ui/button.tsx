'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'primary',
                                                  size = 'md',
                                                  loading = false,
                                                  className = '',
                                                  disabled,
                                                  ...props
                                              }) => {
    // استایل پایه
    const base =
        'rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ';

    // رنگ‌ها
    let variantClass = '';
    if (variant === 'primary')
        variantClass = 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
    else if (variant === 'secondary')
        variantClass = 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400';
    else if (variant === 'danger')
        variantClass = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500';

    // سایزها
    let sizeClass = '';
    if (size === 'sm') sizeClass = 'px-3 py-2 text-sm';
    else if (size === 'md') sizeClass = 'px-5 py-2.5 text-base';
    else if (size === 'lg') sizeClass = 'px-7 py-3 text-lg';

    const combined = `${base} ${variantClass} ${sizeClass} ${className}`;

    return (
        <button
            {...props}
            className={combined}
            disabled={loading || disabled}
        >
            {loading && (
                <svg
                    className="w-4 h-4 animate-spin text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    />
                </svg>
            )}
                {children}
        </button>
    );
};
