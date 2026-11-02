# AMIT JEWELLERS Live Rates

Mobile-friendly customer dashboard and jeweller settings.

## Important market-data limitation
The included adapter uses Corgano's free Gold and Silver latest-price JSON endpoints with `currency=INR`. The documented response fields used are `data.currencies.INR.per_gram` for gold, `data.currencies.INR.per_kg` for silver, and `data.as_of` for the timestamp. This is an international **spot reference**, not MCX futures or an IBJA retail benchmark. Corgano documents updates about once a minute, no API key, and per-IP limits of 10 requests/minute, 60/hour and 500/day. Attribution links are required and are shown in the dashboard. The app validates positive numeric prices and timestamps and shows unavailable on provider errors; it never substitutes random or hardcoded rates. Provider figures are indicative and may be delayed.

## Run
Requires Node.js 20+. Run `npm install`, set `ADMIN_PASSWORD` to a unique secret of at least 12 characters, then `npm start`. Open the service URL in a browser.

## Hosting
Set `ADMIN_PASSWORD` and optionally `SPOT_API_URL` in hosting environment variables. Never commit real passwords or API keys. Free hosting may sleep, and local JSON settings may be lost on redeploy/restart; production should use persistent storage.

## Real MCX feed
A genuine MCX futures feed requires an authorized data vendor, exchange/data licensing as applicable, and that vendor's API documentation/credentials. Do not label spot as MCX. The market adapter must be implemented against the actual vendor specification.

## Rate calculation
Gold purity factors used: 18K 75%, 20K 83.33%, 22K 91.6%, 24K 100%. The dashboard adds badla, making and configured GST. Silver uses badla, RTGS add, making and GST. Confirm tax and commercial treatment with your accountant before using for billing.


## Single-mobile MCX demo preparation
The dashboard has a dedicated MCX Gold/Silver Futures panel and installable PWA shell. The MCX endpoint intentionally returns unavailable until the account-specific authorized RMoney XTS login/session flow, MCX instrument tokens and credentials are supplied. No spot, delayed or simulated price is represented as MCX. Keep API secrets only in private hosting environment variables, never in GitHub or chat. The PWA shell does not cache API data offline.


## Single-mobile demo and India estimate
The mobile PWA shows Corgano INR international spot reference and a separate India indicative estimate. Formula: Spot × (1 + user-entered duty percentage) + user-entered landed cost. Duty percentages and other landed costs default to zero; the jeweller must verify and enter applicable values. These defaults are not a statement of current Indian customs rates. This estimate is NOT MCX Futures LTP, not an exchange quote, and not a guaranteed retail/billing price. Genuine MCX prices require an authorized MCX/vendor feed. The MCX endpoint therefore remains unavailable rather than fabricating values. Keep secrets in private hosting environment variables, never in GitHub or chat. The PWA shell does not cache API data offline.
