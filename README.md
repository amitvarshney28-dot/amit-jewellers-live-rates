# AMIT JEWELLERS Live Rates

Mobile-friendly customer dashboard and jeweller settings.

## Important market-data limitation
The included adapter is intended for an INR-denominated international spot reference only. It is **not MCX futures data**. It refuses to display a price unless the provider response includes INR currency identification and numeric XAU/XAG fields. No random or hardcoded fallback prices are used. The default endpoint response structure has not yet been confirmed against a live provider contract; check the provider documentation. If the endpoint does not return the expected fields, the dashboard will correctly show unavailable rather than invent a quote.

## Run
Requires Node.js 20+. Run `npm install`, set `ADMIN_PASSWORD` to a unique secret of at least 12 characters, then `npm start`. Open the service URL in a browser.

## Hosting
Set `ADMIN_PASSWORD` and optionally `SPOT_API_URL` in hosting environment variables. Never commit real passwords or API keys. Free hosting may sleep, and local JSON settings may be lost on redeploy/restart; production should use persistent storage.

## Real MCX feed
A genuine MCX futures feed requires an authorized data vendor, exchange/data licensing as applicable, and that vendor's API documentation/credentials. Do not label spot as MCX. The market adapter must be implemented against the actual vendor specification.

## Rate calculation
Gold purity factors used: 18K 75%, 20K 83.33%, 22K 91.6%, 24K 100%. The dashboard adds badla, making and configured GST. Silver uses badla, RTGS add, making and GST. Confirm tax and commercial treatment with your accountant before using for billing.
