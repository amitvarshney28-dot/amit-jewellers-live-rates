require("dotenv").config();
const express=require("express"),fs=require("fs"),path=require("path");
const app=express(),PORT=process.env.PORT||3000,FILE=path.join(__dirname,"settings.json");
app.use(express.json({limit:"20kb"}));app.use(express.static(path.join(__dirname,"public")));
const defaults={goldBadla:0,silverBadla:0,making18:0,making20:0,making22:0,making24:0,silverMaking:0,gstPercent:3,silverRtgsAdd:0,goldImportDutyPercent:0,silverImportDutyPercent:0,goldLandedCostPer10g:0,silverLandedCostPerKg:0};
function read(){try{return {...defaults,...JSON.parse(fs.readFileSync(FILE,"utf8"))}}catch{return {...defaults}}}
function auth(req,res,next){const pass=process.env.ADMIN_PASSWORD,got=(req.get("authorization")||"").replace(/^Bearer /,"");if(!pass||pass.length<12)return res.status(503).json({error:"Secure ADMIN_PASSWORD (12+ characters) is not configured."});if(got!==pass)return res.status(401).json({error:"Unauthorized"});next()}
const CACHE_MS=60_000;let marketCache=null,cacheAt=0,inFlight=null;
async function fetchJson(url){const r=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"AMIT-JEWELLERS-rate-dashboard/1.0"},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error("Corgano provider HTTP "+r.status);return r.json()}
async function getMarketData(){
 if(marketCache&&Date.now()-cacheAt<CACHE_MS)return marketCache;
 if(inFlight)return inFlight;
 inFlight=(async()=>{
  const [gold,silver]=await Promise.all([
   fetchJson("https://goldprice.corgano.com/api/v1/latest?currency=INR"),
   fetchJson("https://silverprice.corgano.com/api/v1/latest?currency=INR")
  ]);
  const gi=gold?.data?.currencies?.INR,si=silver?.data?.currencies?.INR;
  const goldPerGram=Number(gi?.per_gram),silverPerKg=Number(si?.per_kg);
  const gt=gold?.data?.as_of,st=silver?.data?.as_of;
  if(!Number.isFinite(goldPerGram)||goldPerGram<=0||!Number.isFinite(silverPerKg)||silverPerKg<=0||!gt||!st)throw Error("Corgano INR response validation failed; no unverified rates shown.");
  const value={available:true,isMCX:false,source:"Corgano international spot reference (INR)",timestamp:gt<st?gt:st,goldPer10g:goldPerGram*10,silverPerKg,attribution:{gold:"Gold price data by Corgano",goldUrl:"https://goldprice.corgano.com/",silver:"Silver price data by Corgano",silverUrl:"https://silverprice.corgano.com/"}};
  marketCache=value;cacheAt=Date.now();return value;
 })();
 try{return await inFlight}finally{inFlight=null}
}
app.get("/health",(q,s)=>s.json({ok:true}));
app.get("/api/mcx-market-data",(q,s)=>s.status(503).json({available:false,message:"असली MCX Futures डेटा फीड कनेक्ट नहीं है। नीचे दिया भारत अनुमानित Spot भाव MCX LTP नहीं है।"}));
app.get("/api/market-data",async(q,s)=>{try{s.set("Cache-Control","public, max-age=30");s.json(await getMarketData())}catch(e){s.status(503).json({available:false,isMCX:false,error:e.message})}});
app.get("/api/public-settings",(q,s)=>{const x=read();s.json(x)});\napp.get("/api/india-estimate",async(q,s)=>{try{const m=await getMarketData(),x=read();const gold=m.goldPer10g*(1+x.goldImportDutyPercent/100)+x.goldLandedCostPer10g;const silver=m.silverPerKg*(1+x.silverImportDutyPercent/100)+x.silverLandedCostPerKg;s.json({available:true,isMCX:false,label:"अनुमानित भारत Spot Reference",goldPer10g:gold,silverPerKg:silver,source:m.source,timestamp:m.timestamp,assumptions:{goldImportDutyPercent:x.goldImportDutyPercent,silverImportDutyPercent:x.silverImportDutyPercent,goldLandedCostPer10g:x.goldLandedCostPer10g,silverLandedCostPerKg:x.silverLandedCostPerKg}})}catch(e){s.status(503).json({available:false,isMCX:false,error:e.message})}});
app.get("/api/settings",auth,(q,s)=>s.json(read()));
app.put("/api/settings",auth,(q,s)=>{const o={};for(const k of Object.keys(defaults)){const n=Number(q.body?.[k]);if(!Number.isFinite(n)||n<0||n>1000000)return s.status(400).json({error:"Invalid numeric setting: "+k});o[k]=n}if(o.gstPercent>100)return s.status(400).json({error:"GST percent must be 0-100"});fs.writeFileSync(FILE,JSON.stringify(o,null,2));s.json({ok:true,settings:o})});
app.listen(PORT,()=>console.log("AMIT JEWELLERS listening on "+PORT));
