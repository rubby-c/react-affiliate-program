const ApprovedBadge = ({ status }: { status: boolean | null }) => {
    if (status === null) {
        return (
            <div className='af-bg-gray-200 text-green-950 af-rounded-full af-px-2 af-py-1 af-text-xs af-font-medium'>
                Not Approved Yet
            </div>
        );
    }

    if (status) {
        return (
            <div className='af-bg-green-300 text-green-950 af-rounded-full af-px-2 af-py-1 af-text-xs af-font-medium'>
                Active
            </div>
        );
    }

    if (!status) {
        return (
            <div className='af-bg-red-300 text-green-950 af-rounded-full af-px-2 af-py-1 af-text-xs af-font-medium'>
                Rejected
            </div>
        );
    }
};

export default ApprovedBadge;