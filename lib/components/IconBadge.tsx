import React from 'react';

const IconBadge = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string | number }) => {
    return (
        <div className='af-flex af-items-center af-space-x-3 af-bg-gray-100 af-px-4 af-py-2 af-rounded-md'>
            {icon}

            <div className='af-flex af-flex-col af-items-start'>
                <p className='af-text-sm af-text-gray-700 af-font-medium'>{title}</p>
                <span className='af-font-semibold af-text-lg af-text-gray-700 af-break-all'>{text}</span>
            </div>
        </div>
    );
};

export default IconBadge;