import fs from 'node:fs';
import vm from 'node:vm';

const files=fs.readdirSync('.').filter(x=>x.endsWith('.html')&&x.startsWith('sticker-selector-v9-'));
let issues=0;
for(const name of files){
 const prior=issues;
 const html=fs.readFileSync(name,'utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 if(!scripts.length){console.error('FAIL '+name+': no inline script');issues++;continue;}
 for(const [,source] of scripts){
  if(!source.trim())continue;
  try{new vm.Script(source,{filename:name})}catch(e){console.error('FAIL '+name+': '+e.message);issues++}
 }
 const required=['id="list"','id="files"','id="status"'];
 if(required.some(x=>!html.includes(x))){console.error('FAIL '+name+': missing required UI');issues++}
 if(issues===prior)console.log('PASS '+name);
}
if(!files.length){console.error('No v9 HTML files');process.exit(1)}
console.log('Checked '+files.length+' HTML files. Issues: '+issues);
process.exitCode=issues?1:0;
