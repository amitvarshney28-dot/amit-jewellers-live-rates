# AMIT JEWELLERS — Live Rates starter

## इसमें क्या है
- Mobile-first black/gold dashboard.
- MCX Gold/Silver futures + international Gold/Silver spot + USD/INR fields.
- 24K, 22K, 20K, 18K gold calculations (₹/10g).
- Silver RTGS / 1kg rates (₹/kg).
- दो display columns: **मेकिंग सहित** और **मेकिंग + GST सहित**.
- Admin panel: gold/silver badla, each karat making %, silver making %, GST %.
- कोई random/demo/fake live price generator नहीं है. Provider data न मिलने पर app स्पष्ट error दिखाता है.

## जरूरी वास्तविकता
MCX real-time data के लिए MCX या उसके अधिकृत data vendor से real-time feed, contract और display rights लेने होंगे. केवल API key डालने से हर vendor का feed अपने-आप compatible नहीं होगा. Provider के API response को नीचे दिए normalized format में लाने के लिए `server.js` के adapter हिस्से को vendor के वास्तविक दस्तावेज़ के अनुसार map करना होगा.

MCX official data feed info:
https://www.mcxindia.com/faq/technology-services
https://classic.mcxindia.com/technology/datafeed

## चलाने का तरीका
1. कंप्यूटर पर Node.js 20 या नया install करें.
2. इस folder में terminal खोलें.
3. `npm install`
4. `.env.example` की copy `.env` नाम से बनाएं.
5. `.env` में अपना Admin password और provider URLs/API keys भरें.
6. `npm start`
7. Browser में `http://localhost:3000` खोलें.

## Provider adapter response format

### MCX_DATA_URL
GET endpoint must return JSON:
```json
{
  "gold": {"last": 72000.00, "bid": 71998.00, "ask": 72002.00},
  "silver": {"last": 90000.00, "bid": 89990.00, "ask": 90010.00}
}
```
Gold last/bid/ask must be ₹ per 10 grams; silver must be ₹ per kilogram. Use the actual live MCX contract values and correct contract mapping supplied by your vendor.

### METALS_SPOT_URL
```json
{"goldUsdOz": 2300.00, "silverUsdOz": 28.50}
```
USD per troy ounce.

### FX_DATA_URL
```json
{"usdInr": 83.50}
```

These numbers above are format examples only, NOT current market prices. Do not use them as live values.

## Environment variables
See `.env.example`. If your provider uses query-string keys, custom headers, WebSocket, FAST binary protocol, or a different response structure, the adapter needs to be adjusted to that vendor's official API specification. Keep API secrets on the server; never put private keys in `index.html`.

## Calculation rules
- 24K reference = MCX Gold price + Gold Badla.
- 22K = 24K × 22/24; 20K = 24K × 20/24; 18K = 24K × 18/24.
- Making inclusive = purity rate × (1 + making% / 100).
- GST inclusive = making-inclusive rate × (1 + GST% / 100).
- GST default is 3% but editable by owner. Confirm the applicable GST treatment/rate with your accountant before customer display/invoicing.
- This is a rate display calculation, not a tax invoice engine. Local premium, import duty, wastage, hallmarking and product-specific charges may need additional configuration.

## Security / deployment
- Change the sample admin password immediately.
- Use HTTPS and a private server/VPN if the owner-only panel is exposed outside the shop.
- Configure MCX/vendor permissions for the exact intended display (private internal screen vs public customer website). Do not redistribute exchange data beyond the licence.
- Do not expose `.env` or provider API keys.
