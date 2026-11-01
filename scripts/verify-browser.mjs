import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const { default: puppeteer } = await import(process.env.PUPPETEER_MODULE || 'puppeteer-core');
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH,headless:true});
const dir='docs/design/current';mkdirSync(dir,{recursive:true});const checks=[],errors=[];
const config={version:'1',topic:'opponents',seed:'curiosity',mode:'both',forgiveness:.1,weights:[1,1,1,1,1,1]};
async function setRound(page,n){await page.$eval('[aria-label="Go to tournament round"]',(e,n)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(n));e.dispatchEvent(new Event('input',{bubbles:true}));},n);}
async function points(page){return page.$$eval('.player-points strong',es=>es.map(e=>Number(e.textContent.replaceAll(',',''))));}
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1440,height:1000});
 await page.goto('http://127.0.0.1:5173/#run='+encodeURIComponent(JSON.stringify(config)),{waitUntil:'networkidle0'});await page.waitForSelector('.player-score');
 const reference=await page.evaluate(async()=>{
  const {tournament,PAIRS}=await import('/src/engine.ts');const r=tournament('curiosity',{label:'Equal mix',mode:'both',forgiveness:.1,weights:[1,1,1,1,1,1]});
  const sums=[0,0,0,0,0,0],played=[0,0,0,0,0,0];for(const e of r.encounters){const[a,b]=PAIRS[e.pair];sums[a]+=e.totals[0];sums[b]+=e.totals[1];played[a]+=e.rounds;played[b]+=e.rounds;}
  return {sums,played,total:r.encounters.reduce((n,e)=>n+e.rounds,0),first:r.encounters[0].rounds};
 });
 assert.deepEqual(await points(page),reference.sums);
 assert.deepEqual(await page.$$eval('.player-score .helper',es=>es.map(e=>Number(e.textContent.split(' ')[0].replaceAll(',','')))),reference.played);
 assert.equal(reference.played.reduce((a,b)=>a+b,0),2*reference.total);
 assert.equal(await page.$$eval('.strategy-family',es=>es.filter(e=>e.textContent.startsWith('Nice')).length),5);
 assert.equal(await page.$$eval('.strategy-family',es=>es.filter(e=>e.textContent.startsWith('Nasty')).length),1);
 assert.equal(await page.$$eval('.player-score .avatar',es=>new Set(es.map(e=>getComputedStyle(e).backgroundPosition)).size),6);
 const image=await page.evaluate(async()=>{const im=new Image();im.src='/avatars/strategies-v2.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);return {width:im.width,height:im.height,cornerAlpha:x.getImageData(0,0,1,1).data[3],ringAlpha:x.getImageData(768,768,1,1).data[3]};});
 assert.deepEqual(image,{width:1536,height:1024,cornerAlpha:0,ringAlpha:0});
 checks.push('Six distinct sprite positions, five nice/one nasty labels, alpha background and open ring');
 checks.push('Final raw scores and player-rounds match independent summation of all encounter summaries');
 await setRound(page,0);assert.deepEqual(await points(page),[0,0,0,0,0,0]);
 await setRound(page,1);const one=await page.evaluate(async()=>{const {encounter}=await import('/src/engine.ts');return encounter('curiosity',0,0,{label:'Equal mix',mode:'both',forgiveness:.1,weights:[1,1,1,1,1,1]},true).trace[0].points.reduce((a,b)=>a+b,0);});
 assert.deepEqual(await points(page),[one,0,0,0,0,0]);
 await setRound(page,reference.total);await page.select('.select-label select','1');assert.deepEqual(await points(page),reference.sums);
 checks.push('Round zero, first self-play round, final round and equal raw scores for two identical schedules');
 for(const width of [360,768,1440]){await page.setViewport({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width}`);}
 await page.setViewport({width:1440,height:1000});await page.screenshot({path:dir+'/scores-desktop.png',fullPage:true});
 await page.setViewport({width:390,height:844});await page.screenshot({path:dir+'/scores-phone.png',fullPage:true});
 await page.click('#encounter-details>summary');
 const actual=await page.$$eval('.encounter-player p',es=>es.map(e=>Number(e.textContent.split(' ')[0].replaceAll(',',''))));
 const expected=await page.evaluate(async()=>{const {encounter,PAIRS}=await import('/src/engine.ts');const pair=PAIRS.findIndex(([a,b])=>a===1&&b===2);return encounter('curiosity',0,pair,{label:'Equal mix',mode:'both',forgiveness:.1,weights:[1,1,1,1,1,1]},true).trace[0].points;});
 assert.deepEqual(actual,expected);
 await page.select('.inspector-controls select:nth-of-type(1)','0');
 await page.select('.inspector-controls label:nth-child(2) select','0');
 assert.ok(await page.$eval('.encounter-scores',e=>e.textContent.includes('player 1')&&e.textContent.includes('player 2')));
 await page.setViewport({width:1440,height:1000});await page.screenshot({path:dir+'/encounter-desktop.png',fullPage:true});
 checks.push('Encounter points correspond to selected round and self-play player instances stay labelled');
 assert.deepEqual(errors,[]);mkdirSync('docs/verification',{recursive:true});writeFileSync('docs/verification/avatar-scores-browser.json',JSON.stringify({browser:await browser.version(),checks,reference,image,errors,limits:'Headless Edge; no physical-device or beginner recognition/comprehension test.'},null,2));console.log(JSON.stringify({checks,errors,reference},null,2));
}finally{await browser.close();}
