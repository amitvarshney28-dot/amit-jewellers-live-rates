const express = require("express");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const app = express();
app.use(express.json({limit:"20kb"}));
app.use(express.static(path.join(__dirname,"public")));
const settingsFile = path.join(__dirname,"settings.json");
const defaults = {goldBadla:500,silverBadla:1000,making18:0,making20:0,making22:0,making24:0,silverMaking:0,gstPercent:3,silverRtgsAdd:0};
function settings(){try{return {...defaults,...JSON.parse(fs.readFileSync(settingsFile,"utf8"))}}catch{return {...defaults}}}
function save(s){fs.writeFileSync(settingsFile,JSON.stringify(s,null,2))}
function admin(req,res,next){const h=req.headers.authorization||"";const token=h.startsWith("Bearer ")?h.slice(7):"";if(!process.env.ADMIN_PASSWORD||token!==process.env.ADMIN_PASSWORD)return res.status(401).json({error:"Unauthorized"});next()}
app.get("/api/settings",admin,(req,res)=>res.json(settings()));
app.put("/api/settings",admin,(req,res)=>{const input=req.body||{};const next={};for(const k of Object.keys(defaults)){const n=Number(input[k]);if(!Number.isFinite(n)||n<0||n>1000000)return res.status(400).json({error:"Invalid setting: "+k});next[k]=n}save(next);res.json({ok:true,settings:next})});
app.get("/api/public-settings",(req,res)=>{const s=settings();res.json({goldBadla:s.goldBadla,silverBadla:s.silverBadla,making18:s.making18,making20:s.making20,making22:s.making22,making24:s.making24,silverMaking:s.silverMaking,gstPercent:s.gstPercent,silverRtgsAdd:s.silverRtgsAdd})});
app.get("/api/market-data",async(req,res)=>{const url=process.env.SPOT_API_URL||"https://data-asg.goldprice.org/dbase/INR";try{const r=await fetch(url,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error("Market provider HTTP "+r.status);const d=await r.json();const item=(d.items&&d.items[0])||d;if(!Number.isFinite(Number(item.xauPrice))||!Number.isFinite(Number(item.xagPrice)))throw Error("Provider response format not recognized");const goldOz=Number(item.xauPrice),silverOz=Number(item.xagPrice);const s=settings();const gold10g=goldOz*10/31.1034768;const silverKg=silverOz*1000/31.1034768;res.json({available:true,source:"International spot reference (not MCX futures)",currency:"INR",updatedAt:new Date().toISOString(),gold10g,silverKg,products:{gold18:gold10g*.75+s.goldBadla,gold20:gold10g*(20/24)+s.goldBadla,gold22:gold10g*(22/24)+s.goldBadla,gold24:gold10g+s.goldBadla,silver999:silverKg+s.silverBadla}})}catch(e){res.status(503).json({available:false,error:"Live spot data unavailable. No estimated or fabricated rate is shown.",detail:e.message})}});
app.get("/health",(req,res)=>res.json({ok:true}));
const port=process.env.PORT||3000;app.listen(port,()=>console.log("AMIT JEWELLERS rates server on "+port));
