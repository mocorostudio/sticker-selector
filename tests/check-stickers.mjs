import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
for(const dir of ['.','integration-v1','integration-v1/crop-v9'])for(const name of fs.readdirSync(dir).filter(x=>x.endsWith('.mjs')))execFileSync(process.execPath,['--check',dir+'/'+name]);
const html=fs.readFileSync('index.html','utf8');
for(const id of ['list','files','status','loadPending','sync'])if(!html.includes('id="'+id+'"'))throw Error('Missing UI '+id);
for(const name of fs.readdirSync('.').filter(x=>x.startsWith('sticker-selector-v9-')&&x.endsWith('.html'))){const source=fs.readFileSync(name,'utf8');for(const [,script] of source.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script);if(!source.includes("location.replace('index.html'"))throw Error('Legacy UI is still active: '+name)}
console.log('PASS module syntax, primary UI and legacy redirects');
