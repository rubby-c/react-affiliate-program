import React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ ...props }, ref) => {
    return (
        <input ref={ref} className='af-h-9 af-w-full af-flex af-border af-px-3 af-py-1 af-text-sm af-shadow-sm af-rounded-md placeholder:text-muted-foreground focus-visible:af-outline-none disabled:af-cursor-not-allowed disabled:af-opacity-50' {...props} />
    );
});

export default Input;