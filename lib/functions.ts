import { AffiliateProfile, PortalData } from './types.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
function isJson(str: any) {
    let value = typeof str !== 'string' ? JSON.stringify(str) : str;

    try {
        value = JSON.parse(value);
    } catch (e) {
        return false;
    }

    return typeof value === 'object' && value !== null;
}

export function generateAffiliateLink(url: string, parameter: string, coupon: string) {
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }

        if (!url.includes('.')) {
            throw new Error();
        }

        const uri = new URL(url);
        if (uri.searchParams.has(parameter)) {
            return url;
        }

        uri.searchParams.append(parameter, coupon);
        return uri.href;
    } catch {
        return 'Please enter a valid URL!';
    }
}

export function getCurrencySymbol(currency: string) {
    return (0).toLocaleString(
        'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).replace(/\d/g, '').trim()
}

export async function getPortalData(token: string): Promise<PortalData> {
    const res = await fetch(`https://api.afficone.com/v1/public/portal/${token}`);
    if (res.status === 200) {
        return await res.json();
    }

    throw new Error(await res.text());
}

export async function getProfile(authToken: string): Promise<AffiliateProfile> {
    if (!authToken) {
        throw new Error('useAfficone\'s authToken property is undefined.');
    }

    const res = await fetch(`https://api.afficone.com/affiliate/profile`, {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });

    if (res.status === 200) {
        return await res.json();
    }

    throw new Error(await res.text());
}

export function logout() {
    localStorage.removeItem('afficoneAuthToken');
}

export async function createAccount({ token, name, email, password, turnstileToken }: {
    token: string,
    name: string,
    email: string,
    password: string,
    turnstileToken: string | null
}): Promise<{ type: 'verification' | 'success' | 'error', value: string }> {
    if (!token) {
        return { type: 'error', value: 'No website token supplied.' };
    }

    if (turnstileToken === null) {
        return { type: 'error', value: 'Captcha didn\'t initialize properly. Please try again.' };
    }

    if (!name || !email || !password || name.length === 0 || email.length === 0 || password.length === 0) {
        return { type: 'error', value: 'Please enter your name, email and password.' };
    }

    const res = await fetch(`https://api.afficone.com/affiliate/signup`, {
        method: 'post',
        body: JSON.stringify({
            websiteToken: token,
            name,
            email,
            password,
            promos: false,
            token: turnstileToken
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (res.status === 202) {
        // Email verification.
        const result = await res.text();
        console.log(result)

        return { type: 'verification', value: 'Please verify your email.' };
    }

    if (res.status === 200) {
        const result = await res.text();
        return { type: 'success', value: result };
    }

    const err = await res.text();

    if (isJson(err)) {
        const json = JSON.parse(err);
        return { type: 'error', value: json.status };
    }

    return { type: 'error', value: err };
}

export async function retrieveAuthToken({ token, email, password, turnstileToken }: {
    token: string,
    email: string,
    password: string,
    turnstileToken: string | null
}): Promise<{ type: 'error' | 'success', value: string }> {
    if (!token) {
        return { type: 'error', value: 'Captcha didn\'t initialize properly. Try reloading your browser.' };
    }

    if (turnstileToken === null) {
        return { type: 'error', value: 'Captcha didn\'t initialize properly. Try reloading your browser.' };
    }

    if (!email || !password || email.length === 0 || password.length === 0) {
        return { type: 'error', value: 'Please enter your email and password.' };
    }

    const res = await fetch(`https://api.afficone.com/affiliate/signin`, {
        method: 'post',
        body: JSON.stringify({
            websiteToken: token,
            email,
            password,
            token: turnstileToken
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (res.status === 200) {
        const result = await res.text();
        localStorage.setItem('afficoneAuthToken', result);
        return { type: 'success', value: result };
    }

    const err = await res.text();

    if (isJson(err)) {
        const json = JSON.parse(err);
        return { type: 'error', value: json.status };
    }

    return { type: 'error', value: err };
}