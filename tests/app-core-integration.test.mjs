import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planSelection} from '../selection-core.mjs';
test('development app uses shared planner in actual resumable sync path',()=>{
 const html=fs.readFileSync('sticker-selector-v9-resume-test.html','utf8');
 assert.ok(html.includes("await import('./selection-core.mjs')"));
 assert.ok(html.includes('core.planSelection('));
 assert.ok(html.includes('画像ID不一致'));
});
test('confirmed selection has no duplicate operation',()=>{
 const current={imageId:'png-1',rating:'h',folder:'hold',confirmed:true};
 assert.equal(planSelection(current,{imageId:'png-1',rating:'h'}).action,'unchanged');
});
