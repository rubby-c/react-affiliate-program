export type PortalData = {
    id: string,
    active: boolean,
    prefix: string,
    name: string,
    url: string,
    trackingParameter: string,
    description: string,
    customDomain: string | null,
    minimumBalance: number,
    currency: string,
    callouts: string[],
    useWatermark: boolean,
    commissions: {
        amount: number,
        type: number,
        applyIndividual: boolean
    },
    media: {
        logo: string | null,
        header: string | null,
        background: {
            useImage: boolean,
            image?: string,
            backgroundRepeat: string,
            backgroundSize: string,
            color: string
        }
    }
};

export type AffiliateProfile = {
    id: string,
    websiteToken: string,
    email: string,
    name: string,
    coupon: string,
    approved: boolean | null,
    commissions: {
        amount: number,
        type: number,
        applyIndividual: boolean
    },
    payouts: {
        id: string;
        paymentMethod: string;
        custom?: boolean;
        paid?: boolean;
        orders?: string[];
        createdAt: number;
        updatedAt?: number | null;
        amount: number;
        details: string;
    }[],
    stats: {
        orders: number,
        balance: number,
        total: number,
        clicks: number
    }
};