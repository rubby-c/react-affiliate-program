import React from 'react';

type AfficoneProviderProps = {
    children: React.ReactNode,
    token: string,
    options?: {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        nextScript?: any
    }
};

const AffiliateTrackingProvider = (props: AfficoneProviderProps) => {
    const url = `https://afficone.com/scripts/sdk.js?token=${props.token}`;
    
    return (
        <>
            {props.children}

            {props?.options?.nextScript ?
                <props.options.nextScript async src={url} strategy='lazyOnload'/>
                : <script async src={url}/>
            }
        </>
    );
};

export default AffiliateTrackingProvider;