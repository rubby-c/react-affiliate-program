import './index.css';

import AffiliatePortal from './components/AffiliatePortal.tsx';
import AffiliateTrackingProvider from './components/AffiliateTrackingProvider.tsx';

import {
    createAccount,
    getProfile,
    generateAffiliateLink,
    getCurrencySymbol,
    retrieveAuthToken,
    getPortalData,
    logout
} from './functions.ts'

export {
    AffiliateTrackingProvider, AffiliatePortal,
    createAccount, getProfile, generateAffiliateLink, getCurrencySymbol, retrieveAuthToken, getPortalData, logout
};