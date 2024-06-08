import React, { ReactNode } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    leftIcon?: ReactNode,
    rightIcon?: ReactNode,
}

const Button = ({ children, leftIcon, rightIcon, ...props }: ButtonProps) => {
    return (
        <button className='af-h-9 af-px-4 af-py-2 af-border af-flex af-justify-center af-items-center af-font-medium af-rounded-md af-text-sm hover:af-bg-gray-100 disabled:af-pointer-events-none disabled:af-opacity-50 af-transition-colors' {...props}>
            {leftIcon && <div className='af-mr-3'>{leftIcon}</div>}
            {children}
            {rightIcon && <div className='af-ml-3'>{rightIcon}</div>}
        </button>
    );
};

export default Button;