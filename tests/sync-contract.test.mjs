import assert from 'node:assert/strict';
import test from 'node:test';
import {applySelections,planSelection} from '../selection-core.mjs';
const fixture=()=>Array.from({length:7},(_,i)=>({candidate:'TEST'+String(i+6).padStart(2,'0'),imageId:'png-'+(i+6),rating:null,folder:'pending',confirmed:false,history:[]}));
const commit=async(row,choice,folder)=>{row.rating=choice.rating;row.folder=folder;row.confirmed=true;row.history.push(choice.rating)};
test('skip unknown image and detect image-ID mismatch',async()=>{
 const rows=fixture();
 const r=await applySelections(rows,[{candidate:'unknown',imageId:'x',rating:'o'},{candidate:'TEST06',imageId:'bad',rating:'o'},{candidate:'TEST07',imageId:'png-7',rating:'h'}],commit);
 assert.deepEqual(r.saved,['TEST07']);assert.equal(r.ignored.length,1);assert.equal(r.errors.length,1);
});
test('network failure then resume without duplicates',async()=>{
 const rows=fixture(),choices=rows.map((r,i)=>({candidate:r.candidate,imageId:r.imageId,rating:['o','h','x'][i%3]}));
 const first=await applySelections(rows,choices,async(row,c,folder)=>{if(row.candidate==='TEST08')throw Error('network');await commit(row,c,folder)});
 assert.equal(first.saved.length,6);assert.equal(first.errors.length,1);
 const second=await applySelections(rows,choices,commit);
 assert.deepEqual(second.saved,['TEST08']);assert.equal(second.unchanged.length,6);
 assert.ok(rows.every(x=>x.history.length===1));
 const third=await applySelections(rows,choices,commit);assert.equal(third.saved.length,0);
});
test('rejection keeps record and PNG in current folder',async()=>{
 const rows=fixture();await applySelections(rows,[{candidate:'TEST06',imageId:'png-6',rating:'x'}],commit);
 assert.equal(rows.length,7);assert.equal(rows[0].folder,'pending');
});
test('duplicate choice rejected rather than double-committed',async()=>{
 const rows=fixture(),c={candidate:'TEST06',imageId:'png-6',rating:'o'};
 const r=await applySelections(rows,[c,c],commit);
 assert.equal(r.saved.length,1);assert.equal(r.errors.length,1);assert.equal(rows[0].history.length,1);
});
