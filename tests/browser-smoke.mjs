import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const pages=['sticker-selector-v9-nine-reject-test.html','sticker-selector-v9-resume-test.html'];
const browser=await chromium.launch({headless:true});
let errors=0;
for(const file of pages){
 const page=await browser.newPage();
 const issues=[];
 page.on('pageerror',e=>issues.push(e.message));
 try{
  await page.goto('file://'+process.cwd()+'/'+file);
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('表示'));
  if(await page.locator('#files').count()!==1)throw Error('PNG input missing');
  if(await page.locator('#oneStep').count()!==1)throw Error('Sync button missing');
  // A harmless generated one-pixel PNG exercises import, rating and persistence.
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRfkAAAAASUVORK5CYII=','base64');
  await page.locator('#files').setInputFiles({name:'ui-smoke.png',mimeType:'image/png',buffer:png});
  await page.locator('#list .card').first().waitFor();
  await page.locator('#list .card').first().locator('.choices label').nth(1).click();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('sticker-selector-v9')));
  if(!state.items.some(x=>x.name==='ui-smoke.png'&&x.rating==='h'&&x.touched))throw Error('Selection was not persisted');
  await page.reload();
  await page.locator('#list .card').first().waitFor();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('sticker-selector-v9')));
  if(!after.items.some(x=>x.name==='ui-smoke.png'&&x.rating==='h'&&x.touched))throw Error('Selection disappeared on reload');
  if(issues.length)throw Error('Browser exceptions: '+issues.join('; '));
  console.log('PASS',file,'load/import/rating/reload');
 }catch(e){console.error('FAIL',file,e.message,issues);errors++;await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/'+file+'.png',fullPage:true}).catch(()=>{})}
 finally{await page.close()}
}
await browser.close();
process.exitCode=errors?1:0;
