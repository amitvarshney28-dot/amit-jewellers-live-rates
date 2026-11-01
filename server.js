require("dotenv").config();
const express=require("express"),fs=require("fs"),path=require("path");
const app=express(),PORT=process.env.PORT||3000,FILE=path.join(__dirname,"settings.json");
app.use(express.json({limit:"20kb"}));app.use(express.static(path.join(__dirname,"public")));
const defaults={goldBadla:0,silverBadla:0,making18:0,making20:0,making22:0,making24:0,silverMaking:0,gstPercent:3,silverRtgsAdd:0};
function read(){try{return {...defaults,...JSON.parse(fs.readFileSync(FILE,"utf8"))}}catch{return {...defaults}}}
function auth(req,res,next){const pass=process.env.ADMIN_PASSWORD,got=(req.get("authorization")||"").replace(/^Bearer /,"");if(!pass||pass.length<12)return res.status(503).json({error:"Secure ADMIN_PASSWORD (12+ characters) is not configured."});if(got!==pass)return res.status(401).json({error:"Unauthorized"});next()}
app.get("/health",(q,s)=>s.json({ok:true}));
app.get("/api/market-data",async(q,s)=>{try{const r=await fetch(process.env.SPOT_API_URL||"https://data-asg.goldprice.org/dbase/INR",{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error("Provider HTTP "+r.status);const d=await r.json(),x=Array.isArray(d.items)?d.items[0]:d,c=String(x?.curr||d.currency||d.curr||"").toUpperCase(),g=Number(x?.xauPrice),a=Number(x?.xagPrice);if(c!=="INR"||!Number.isFinite(g)||!Number.isFinite(a)||g<=0||a<=0)throw Error("Provider currency/response not verified as INR; refusing to show an unverified price.");s.json({available:true,isMCX:false,source:"International spot reference (INR)",timestamp:new Date().toISOString(),goldPer10g:g*10/31.1034768,silverPerKg:a*1000/31.1034768})}catch(e){s.status(503).json({available:false,isMCX:false,error:e.message})}});
app.get("/api/public-settings",(q,s)=>{const x=read();s.json(x)});
app.get("/api/settings",auth,(q,s)=>s.json(read()));
app.put("/api/settings",auth,(q,s)=>{const o={};for(const k of Object.keys(defaults)){const n=Number(q.body?.[k]);if(!Number.isFinite(n)||n<0||n>1000000)return s.status(400).json({error:"Invalid numeric setting: "+k});o[k]=n}if(o.gstPercent>100)return s.status(400).json({error:"GST percent must be 0-100"});fs.writeFileSync(FILE,JSON.stringify(o,null,2));s.json({ok:true,settings:o})});
app.listen(PORT,()=>console.log("AMIT JEWELLERS listening on "+PORT));
