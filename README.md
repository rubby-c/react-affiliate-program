# react-affiliate-program

An extension widget for [Afficone](https://afficone.com) to quickly deploy affiliate programs on React-based apps.

> All the data this widget uses is stored internally (and securely) on Afficone servers.

<img alt='' src="https://i.imgur.com/Q9HWzbP.png" width="300">

## Features

- Made with Typescript ⭐
- SSR support (Next.js) ⚡
- Reusable logic to create your own UI 🎨
- Secured by Cloudflare Turnstile captcha 🔒

## Supported payment providers
- Stripe (extended support for coupons)
- Paddle
- Shopify
- WooCommerce

Want to see it in action? We have a [live demo](https://afficone.com)!

## Install
- `npm install react-affiliate-program`
- [Sign up](https://afficone.com/signup) to Afficone and choose your payment provider.
- Grab your website token and wrap your app at the root layout with `AffiliateTrackingProvider`:

```tsx
const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <AffiliateTrackingProvider token='[your token]' options={{ nextScript: Script /* optional */ }}>
            {children}
        </AffiliateTrackingProvider>
    );
};
```
If you're using **Next.js**, you can specify the nextScript parameter to use next/script.

> **That's it 🚀** You can now share your portal link and track affiliates from the Afficone dashboard.

## Using the widget

If you'd like to also use the mini widget, you can do so by using the `AffiliatePortal` component.

```tsx
<AffiliatePortal token='[your token]' options={{
    // These are all optional.
    defaultLogin: { email: '', password: '' },
    customContent: <div />,
    containerShadow: true,
    showLogoInHeader: true,
    showDescription: true,
    showInfoCards: true,
    showCallous: true,
    loadingAnimation: <div />,
}}/>
```

### Available options
The widget has a few optional options.

| Parameter        | Type                                | Description                                                                                                                   |
|------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| defaultLogin     | { email: string, password: string } | Credentials filled in by default (mostly for demonstration purposes).                                                         |
| loadingAnimation | ReactNode                           | Use your own custom loading spinner or animation.                                                                             |
| customContent    | ReactNode                           | Custom content on the introduction page. Best used with `showDescription`, `showInfoCards` and `showCalllous` set to `false`. |
| containerShadow  | boolean                             | Toggles the shadow effect for the main container.                                                                             |
| showLogoInHeader | boolean                             | Kind of self explanatory.                                                                                                     |
| showDescription  | boolean                             | Show/hide the description in the introduction page.                                                                           |
| showInfoCards    | boolean                             | Show/hide the info cards in the introduction page.                                                                            |


### Logging in users automatically

To do this, head to the [Afficone Dashboard](https://afficone.com/dashboard) and grab your API key in the **Developers** menu.

Once you have your API key, make an authenticated `GET` request to:

> https://api.afficone.com/v1/affiliates/jwt

You can authenticate your requests by setting an `X-Affi-Key` header with your API key.

You have to include one of these 2 query parameters:
- `email` - Email of the registered affiliate.
- `id` - Afficone Id of the registered affiliate.

**Request Example:**

```
curl --location 'https://api.afficone.com/v1/affiliates/jwt?email=contact@afficone.com' \
--header 'X-Affi-Key: [Your API key]'
```

**Possible responses:**

| Status       | Response Code | Result                                                      |
|--------------|---------------|-------------------------------------------------------------|
| Success      | 200           | { error: false, message: null, data: "**the auth token**" } |
| Bad request  | 400           | { error: true, message: "The error message.", data: null }  |

Once you have the auth token for that affiliate, you can set the `authToken` and the affiliate will be automatically logged in.

```tsx
<AffiliatePortal token='[your token]' authToken={token} />
```

## Writing your own affiliate portal (advanced)

All the core functions in this library are exported and usable from anywhere in your app.

### 1. Retrieve the portal data

Includes titles, descriptions, logos, currencies and everything that's in the introduction page.

```ts
import { getPortalData } from 'react-affiliate-program';

const portal = await getPortalData('[your token]');
```

### 2. Authenticate the user

First, since the widget uses [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile) captcha, you need to add the following iframe to your onboarding page:

```jsx
<iframe width={300} height={65} src='https://afficone.com/turnstile-iframe'/>
```

The captcha will (in most cases) complete automatically. Once it's done, you need to capture a `postMessage` from the iframe, containing the captcha token:

```tsx
React.useEffect(() => {
    const func = (msg: MessageEvent) => {
        const data = msg.data as string;
        if (data.startsWith('affi_')) {
            const result = data.replace('affi_', '');
            // Save the captcha token somewhere.
            setCaptchaToken(result);
        }
    }

    window.addEventListener('message', (msg) => func(msg));
    return () => window.removeEventListener('message', func);
}, []);
```

Once you have a captcha token, you can proceed with the onboarding process.

#### 2.1. Create an account

```ts
import { createAccount } from 'react-affiliate-program';

// Returns the following type: { type: 'success' | 'verification' | 'error', value: string }
const status = await createAccount({
    token: '[your portal token]',
    name: '[name from input]',
    email: '[email from input]',
    password: '[password from input]',
    turnstileToken: captchaToken
});

switch (status.type) {
    case 'success':
        // Account created successfully, you can now log in.
        break;
    case 'verification':
        // You can turn required email verification off in the Afficone dashboard -> Website
        break;
    case 'error':
        // Display the error.
        break;
}

if (status.type === 'success') {
    const authToken = status.value;
} else {
    // Handle errors.
}
```

#### 2.2. Login to an account

```ts
import { retrieveAuthToken } from 'react-affiliate-program';

// Returns the following type: { type: 'success' | 'error', value: string }
const status = await retrieveAuthToken({
    token: '[your portal token]',
    email: '[email from input]',
    password: '[password from input]',
    turnstileToken: captchaToken
});

if (status.type === 'success') {
    // The value is saved in localStorage -> "afficoneAuthToken", but you can save it in state too.
    const authToken = status.value;
} else {
    // Display the error.
}
```

### 3. Retrieve affiliate data

Once you have an authentication token, you can finally fetch all the affiliate data.

```ts
// Feel free to save the result in state and display it accordingly.
const profile = await getProfile('[auth token]');
```

## Helper functions

Now that you have your own custom affiliate portal, a few helper functions might make your experience easier:
- `getCurrencySymbol` - converts a 3 letter currency code to a currency symbol.
- `generateAffiliateLink` - inserts a coupon code to any link.
- `logout` - clears the localStorage -> "afficoneAuthToken" saved token.
