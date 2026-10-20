import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const pages=['sticker-selector-v9-nine-reject-test.html','sticker-selector-v9-resume-test.html'];
const browser=await chromium.launch({headless:true});
let errors=0;
for(const file of pages){
 const page=await browser.newPage();
 const issues=[];
 page.on('pageerror',e=>issues.push(e.message));
 await page.goto('file://'+process.cwd()+'/'+file);
 await page.waitForTimeout(800);
 const details=await page.evaluate(()=>({
   title:document.title,
   list:!!document.querySelector('#list'),
   upload:!!document.querySelector('#files'),
   resume:document.querySelector('#oneStep')?.textContent?.trim()
 }));
 if(issues.length||!details.list||!details.upload||!details.resume){
   console.error('FAIL',file,details,issues);errors++;
 }else console.log('PASS',file,details.resume);
 await page.close();
}
await browser.close();
if(errors)process.exit(1);
