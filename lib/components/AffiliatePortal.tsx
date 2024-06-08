'use client';

import React from 'react';

import { AffiliateProfile, PortalData } from '../types';
import {
    BiCart,
    BiCopy,
    BiDollar, BiDotsHorizontalRounded,
    BiPointer,
    BiX
} from 'react-icons/bi';

import Button from './Button.tsx';
import Input from './Input.tsx';
import IconBadge from './IconBadge.tsx';
import ApprovedBadge from './ApprovedBadge.tsx';

import { FaArrowRight, FaCheck, FaChevronLeft, FaClock, FaPercentage } from 'react-icons/fa';
import { GiTicket } from 'react-icons/gi';

import {
    createAccount,
    generateAffiliateLink,
    getCurrencySymbol,
    getPortalData,
    getProfile,
    logout,
    retrieveAuthToken
} from '../functions.ts';

export type PortalState = {
    loaded: boolean,
    msg: string | null,
    authToken?: string,
    portal: PortalData | null,
    profile: AffiliateProfile | null
};

const AffiliatePortal =
    ({
         authToken,
         token,
         options = {
             containerShadow: true,
             showLogoInHeader: true,
             showDescription: true,
             showCallous: true,
             showInfoCards: true
         }
     }: {
        authToken?: string,
        token: string,
        options?: {
            defaultLogin?: { email: string, password: string },
            customContent?: React.ReactNode,
            containerShadow?: boolean,
            showLogoInHeader?: boolean
            showDescription?: boolean,
            showInfoCards?: boolean,
            showCallous?: boolean,
            loadingAnimation?: React.ReactNode
        }
    }) => {
        function Logout() {
            logout();

            setState({
                ...state,
                loaded: true,
                authToken: undefined,
                profile: null
            });

            setInput({
                ...input,
                type: 'choice'
            })
        }

        const [state, setState] = React.useState<PortalState>({
            loaded: false,
            msg: null,
            authToken: authToken,
            portal: null,
            profile: null
        });

        const [input, setInput] = React.useState<{
            type: 'choice' | 'signin' | 'signup' | 'dashboard' | 'payouts',
            name: string,
            email: string,
            password: string,
            promos: boolean,
            tos: boolean,
            turnstile: string | null,
            error: string | null,
            affLink: string
        }>({
            type: 'choice',
            name: '',
            email: options.defaultLogin?.email ?? '',
            password: options.defaultLogin?.password ?? '',
            promos: true,
            tos: false,
            turnstile: null,
            error: null,
            affLink: ''
        });

        React.useEffect(() => {
            const func = (msg: MessageEvent) => {
                const data = msg.data as string;
                if (data.startsWith('affi_')) {
                    const turnstile = data.replace('affi_', '');
                    setInput({ ...input, turnstile });
                }
            }

            window.addEventListener('message', (msg) => func(msg));
            return () => window.removeEventListener('message', func);
        }, [input]);

        React.useEffect(() => {
            if (state.loaded) {
                return;
            }

            async function Init() {
                let profile: AffiliateProfile | null = null;

                if (state.authToken) {
                    profile = await getProfile(state.authToken);
                } else {
                    const authToken = localStorage.getItem('afficoneAuthToken');

                    if (authToken !== null) {
                        profile = await getProfile(authToken);
                    }
                }

                const portalData = await getPortalData(token);

                setState({
                    ...state,
                    loaded: true,
                    portal: portalData,
                    profile: profile
                });

                if (profile !== null) {
                    setInput({
                        ...input,
                        type: 'dashboard',
                        name: '',
                        email: '',
                        password: '',
                        turnstile: null,
                        error: null,
                        affLink: portalData.url.includes(window.location.host)
                            ? `https://${window.location.host}` : portalData.url
                    });
                }
            }

            Init();
        }, []);

        const linkRef = React.useRef<HTMLInputElement>(null);

        if (!state.loaded || state.portal === null) {
            return (
                <div className={`af-flex af-justify-center af-text-black af-items-center af-bg-white af-w-96 af-h-128 af-rounded-lg${options.containerShadow ? ' af-shadow': ''}`}>
                    {options?.loadingAnimation ?? <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width={32}
                        height={32}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='af-animate-spin'
                    >
                        <path d='M21 12a9 9 0 1 1-6.219-8.56'/>
                    </svg>}
                </div>
            );
        }

        if (!state.portal.active && !state.portal.demo) {
            return (
                <div className={`af-bg-white af-text-black af-w-96 af-h-128 af-rounded-lg${options.containerShadow ? ' af-shadow': ''}`}>
                    <div className='af-flex af-flex-col af-h-full af-justify-center af-items-center'>
                        <BiX className='af-text-4xl af-mb-4'/>
                        <p className='af-text-center af-text-lg af-px-16'>We are currently not accepting new applications</p>
                    </div>
                </div>
            );
        }

        if (state.msg !== null) {
            return (
                <div className={`af-bg-white af-text-black af-w-96 af-h-128 af-rounded-lg${options.containerShadow ? ' af-shadow': ''}`}>
                    <div className='af-flex af-flex-col af-space-y-4 af-h-full af-justify-center af-items-center'>
                        <BiDotsHorizontalRounded className='af-text-4xl'/>
                        <p className='af-text-center af-text-lg af-px-16'>{state.msg}</p>
                        <Button leftIcon={<FaChevronLeft/>} onClick={() => {
                            setInput({ ...input, type: 'signin' });
                            setState({ ...state, msg: null });
                        }}>Back to login</Button>
                    </div>
                </div>
            );
        }

        async function RetrieveToken() {
            setState({ ...state, loaded: false });

            const status = await retrieveAuthToken({
                token,
                email: input.email,
                password: input.password,
                turnstileToken: input.turnstile
            });

            if (status.type === 'error') {
                setInput({ ...input, error: status.value });
                setState({ ...state, loaded: true });
                return;
            }

            setState({
                ...state,
                authToken,
                loaded: true,
                profile: await getProfile(status.value)
            });

            setInput({
                ...input,
                type: 'dashboard',
                affLink: state.portal!.url.includes(window.location.host)
                    ? `https://${window.location.host}` : state.portal!.url,
                name: '',
                email: '',
                password: '',
                tos: false,
                promos: true,
                turnstile: null,
                error: null,
            });
        }

        async function SignUp() {
            setState({ ...state, loaded: false });

            const status = await createAccount({
                token,
                name: input.name,
                email: input.email,
                password: input.password,
                turnstileToken: input.turnstile
            });

            if (status.type === 'error') {
                setInput({ ...input, error: status.value });
                setState({ ...state, loaded: true });
                return;
            }

            if (status.type === 'verification') {
                setState({ ...state, msg: status.value });
                return;
            }

            setState({
                ...state,
                authToken,
                loaded: true,
                profile: await getProfile(status.value)
            });

            setInput({
                ...input,
                type: 'dashboard',
                affLink: state.portal!.url.includes(window.location.host)
                    ? `https://${window.location.host}` : state.portal!.url,
                name: '',
                email: '',
                password: '',
                tos: false,
                promos: true,
                turnstile: null,
                error: null,
            });
        }

        if (state.profile === null) {
            return (
                <div className={`af-bg-white af-text-black af-w-96 af-h-128 af-rounded-lg af-overflow-hidden${options.containerShadow ? ' af-shadow': ''}`}>
                    {input.type === 'choice' ?
                        <div className='af-relative af-flex af-flex-col af-h-full'>
                            <div style={{
                                background: state.portal.media.background.useImage ? `url(${state.portal.media.background.image})` : state.portal.media.background.color,
                                backgroundRepeat: state.portal.media.background.backgroundRepeat,
                                backgroundSize: state.portal.media.background.backgroundSize
                            }} className='af-h-1/4'/>

                            <div className='af-h-3/4 af-p-4 af-flex af-flex-col af-space-y-2 af-items-center af-text-center'>
                                <div className='af-flex af-items-center af-space-x-2'>
                                    {state.portal.media.logo &&
                                        <img alt='' src={state.portal.media.logo} className='af-rounded-md' width={32}
                                             height={32}/>
                                    }
                                    <p className='af-text-2xl af-font-semibold'>{state.portal.name}</p>
                                </div>

                                <div className='af-flex af-flex-col af-w-full af-h-full'>
                                    <div className='af-flex af-flex-col af-space-y-4 af-flex-1'>
                                        {options.showDescription !== false &&
                                            <p className='af-text-lg af-font-medium'>{state.portal.description}</p>
                                        }

                                        {options.customContent}

                                        {options.showInfoCards !== false &&
                                            <div className='af-grid af-grid-cols-2 af-gap-4'>
                                                <IconBadge icon={<BiDollar/>}
                                                           title='Minimum Payout'
                                                           text={state.portal.minimumBalance}
                                                />

                                                <IconBadge icon={<FaPercentage/>}
                                                           title='Commission'
                                                           text={state.portal.commissions.type === 0 ?
                                                               `${state.portal.commissions.amount}%`
                                                               : state.portal.commissions.applyIndividual
                                                                   ? `${state.portal.commissions.amount} / item`
                                                                   : `${getCurrencySymbol(state.portal.currency)}${state.portal.commissions.amount}`
                                                           }
                                                />
                                            </div>
                                        }

                                        {options.showCallous !== false &&
                                            <div className='af-flex af-flex-col af-items-start text-start af-space-y-1'>
                                                {state.portal.callouts.map((item, idx) => <li key={idx}>{item}</li>)}
                                            </div>
                                        }
                                    </div>

                                    {state.portal.useWatermark ? <div className='af-flex af-items-end af-justify-between'>
                                        <div className='af-flex af-flex-col af-items-start af-space-y-1'>
                                            <span className='af-text-xs af-font-semibold'>Powered by</span>
                                            <img alt='Afficone logo'
                                                 src='https://api.afficone.com/cdn/static/header.png'
                                                 className='af-h-5'/>
                                        </div>

                                        <Button onClick={() => setInput({ ...input, type: 'signin' })}
                                                rightIcon={<FaArrowRight/>}>Continue</Button>
                                    </div> : <div className='af-flex af-items-end af-justify-end'>
                                        <Button onClick={() => setInput({ ...input, type: 'signin' })}
                                                rightIcon={<FaArrowRight/>}>Continue</Button>
                                    </div>}
                                </div>
                            </div>
                        </div>
                        : <div className='af-flex af-flex-col af-items-stretch af-h-full'>
                            <div className='affi-header af-w-full af-flex af-items-center af-justify-between af-p-4'>
                                <div className='af-flex af-items-center af-space-x-2'>
                                    <Button onClick={() => setInput({ ...input, type: 'choice', error: null })}
                                            className='hover:af-bg-gray-100 af-rounded-md af-p-1 af-border-none af-transition-colors me-2'>
                                        <FaChevronLeft className='af-text-sm'/>
                                    </Button>

                                    {options.showLogoInHeader !== false && state.portal.media.logo &&
                                        <img alt='' src={state.portal.media.logo} width={26} height={26}/>}
                                    <p className='af-text-xl af-font-semibold'>{input.type === 'signin' ? 'Welcome back' : 'Create an account'}</p>
                                </div>

                                <div className='af-bg-green-300 text-green-950 af-rounded-full af-px-2 af-py-1 af-text-xs af-font-medium'>
                                    Active
                                </div>
                            </div>

                            <div className='affi-main af-flex af-flex-col af-space-y-3 af-flex-1 af-px-4 af-overflow-auto'>
                                {input.type === 'signup' && <div className='af-flex af-flex-col af-space-y-2'>
                                    <p className='af-text-sm'>Name</p>
                                    <Input placeholder='Name' value={input.name}
                                           onChange={(e) => setInput({ ...input, name: e.target.value })}/>
                                </div>}

                                <div className='af-flex af-flex-col af-space-y-2'>
                                    <p className='af-text-sm'>Email</p>
                                    <Input placeholder='Email' value={input.email}
                                           onChange={(e) => setInput({ ...input, email: e.target.value })}/>
                                </div>

                                <div className='af-flex af-flex-col af-space-y-2'>
                                    <p className='af-text-sm'>Password</p>
                                    <Input placeholder='••••••••' type='password' value={input.password}
                                           onChange={(e) => setInput({ ...input, password: e.target.value })}/>
                                </div>

                                {input.type === 'signup' && <div className='af-flex af-space-x-2'>
                                    <Input id='tos' className='' type='checkbox' value={input.email}
                                           onChange={(e) => setInput({ ...input, tos: e.target.checked })}/>
                                    <label htmlFor='tos' className='af-text-sm af-select-none'>
                                        I agree to the Terms of Service
                                    </label>
                                </div>}

                                {input.error && <p className='af-font-medium af-text-red-500'>{input.error}</p>}

                                <iframe width={300} height={65} src='https://afficone.com/turnstile-iframe'/>
                            </div>

                            <div className='affi-footer af-w-full af-flex af-items-center af-justify-between af-p-4'>
                                <button onClick={() => setInput({
                                    ...input,
                                    type: input.type === 'signin' ? 'signup' : 'signin',
                                    error: null
                                })} className='text-md af-font-medium'>
                                    {input.type === 'signin' ? 'Don\'t have an account?' : 'Have an account?'}
                                </button>

                                <Button disabled={
                                    (input.type === 'signup' && (input.name.length === 0 || !input.tos)) || input.password.length === 0 || !/^([\w.-]+)@([\w-]+)((\.(\w){2,})+)$/.test(input.email)
                                } onClick={input.type === 'signin' ? RetrieveToken : SignUp}
                                        rightIcon={<FaArrowRight/>}>
                                    Continue
                                </Button>
                            </div>
                        </div>
                    }
                </div>
            );
        }

        async function GenerateAffiliateLink() {
            const link = generateAffiliateLink(input.affLink, state.portal!.trackingParameter, state.profile!.coupon);
            await navigator.clipboard.writeText(link);
            linkRef.current!.focus();
            setInput({ ...input, affLink: link });
            linkRef.current!.select();
        }

        return (
            <div className={`af-bg-white af-text-black af-w-96 af-h-128 af-rounded-lg af-overflow-hidden${options.containerShadow ? ' af-shadow': ''}`}>
                <div className='af-flex af-flex-col af-items-stretch af-h-full'>
                    <div className='affi-header af-w-full af-flex af-items-center af-justify-between af-p-4'>
                        <Button
                            onClick={input.type === 'dashboard' ? Logout : () => setInput({
                                ...input,
                                type: 'dashboard'
                            })}
                            className='hover:af-bg-gray-100 af-rounded-md af-p-1 af-border-none af-transition-colors'>
                            <FaChevronLeft className='af-text-sm'/>
                        </Button>

                        <div className='af-flex af-items-center af-space-x-2'>
                            {options.showLogoInHeader !== false && state.portal.media.logo &&
                                <img alt='' src={state.portal.media.logo} width={26} height={26}/>}
                            <p className='af-text-xl af-font-semibold'>{state.profile.name}</p>
                        </div>

                        <ApprovedBadge status={state.profile.approved}/>
                    </div>

                    {input.type === 'dashboard' ? <div className='affi-main af-flex-1 af-flex af-flex-col af-space-y-3 af-px-4'>
                            <div className='af-grid af-grid-cols-2 af-gap-4'>
                                <IconBadge icon={<BiDollar/>}
                                           title='Balance'
                                           text={`${getCurrencySymbol(state.portal.currency)}${state.profile.stats.balance}`}
                                />

                                <IconBadge icon={<BiCart/>}
                                           title='Orders'
                                           text={state.profile.stats.orders}
                                />

                                <IconBadge icon={<BiPointer/>}
                                           title='Clicks'
                                           text={state.profile.stats.clicks}
                                />

                                <IconBadge icon={<GiTicket/>}
                                           title='Coupon'
                                           text={state.profile.coupon}
                                />
                            </div>

                            <div className='af-flex af-flex-col af-space-y-1'>
                                <p className='af-font-medium'>Affiliate link:</p>

                                <div className='af-flex af-space-x-2'>
                                    <Input ref={linkRef} value={input.affLink}
                                           onChange={(e) => setInput({ ...input, affLink: e.target.value })}/>

                                    <Button onClick={GenerateAffiliateLink}>
                                        Generate
                                    </Button>
                                </div>
                            </div>

                            <div className='af-flex af-flex-col af-space-y-1'>
                                <p className='af-font-medium'>
                                    Commission: {state.profile.commissions.type === 0 ?
                                    `${state.profile.commissions.amount}% per order`
                                    : state.profile.commissions.applyIndividual
                                        ? `${state.profile.commissions.amount} per item`
                                        : `${getCurrencySymbol(state.portal.currency)}${state.profile.commissions.amount} per order`}
                                </p>
                            </div>
                        </div>
                        : <div className='affi-main af-flex-1 af-flex af-flex-col af-space-y-3 af-px-4 af-overflow-y-auto'>
                            {state.profile.payouts.length > 0 ? state.profile.payouts.map(item => <div
                                className='af-bg-gray-100 af-p-4 af-flex af-justify-between af-rounded-md' key={item.id}>
                                <div className='af-flex af-items-center af-space-x-4'>
                                    {item.paid ? <FaCheck className='af-text-green-500'/> :
                                        <FaClock className='af-text-gray-500'/>}

                                    <div className='af-flex af-flex-col af-space-y-1'>
                                        <p>{item.orders?.length} orders</p>
                                        <p className='af-text-sm af-text-gray-700'>{new Date(item.updatedAt ? item.updatedAt : item.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <span
                                    className='af-text-2xl'>{getCurrencySymbol(state.portal!.currency)}{item.amount}</span>
                            </div>) : <p className='af-text-center af-py-16'>You don&apos;t have any payouts.</p>}
                        </div>
                    }

                    {input.type === 'dashboard' &&
                        <div className={`affi-footer af-w-full af-flex af-items-center af-p-4 af-justify-between`}>
                            <Button onClick={() => setInput({ ...input, type: 'payouts' })}
                                    leftIcon={input.type === 'dashboard' ? <BiDollar/> : <FaChevronLeft/>}>
                                Payouts
                            </Button>
                            <Button onClick={() => navigator.clipboard.writeText(input.affLink)}
                                    disabled={input.affLink.length > 0 && !input.affLink.includes(`${state.portal.trackingParameter}=${state.profile.coupon}`)}
                                    leftIcon={<BiCopy/>}>
                                Copy Link
                            </Button>
                        </div>
                    }
                </div>
            </div>
        );
    };

export default AffiliatePortal;