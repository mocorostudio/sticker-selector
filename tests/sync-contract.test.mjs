import assert from 'node:assert/strict';
import test from 'node:test';

function run(records, choices, failAt=null) {
 const results={saved:[],unchanged:[],errors:[],ignored:[]};
 for(const choice of choices){
  const row=records.find(r=>r.candidate===choice.candidate);
  if(!row){results.ignored.push(choice.candidate);continue;}
  if(row.imageId!==choice.imageId){results.errors.push(choice.candidate+': image-id mismatch');continue;}
  if(!['o','h','x'].includes(choice.rating)){results.ignored.push(choice.candidate);continue;}
  const folder={o:'adopt',h:'hold',x:'reject'}[choice.rating];
  if(row.rating===choice.rating&&row.folder===folder&&row.confirmed){results.unchanged.push(choice.candidate);continue;}
  if(failAt===choice.candidate){results.errors.push(choice.candidate+': simulated network failure');continue;}
  row.rating=choice.rating;row.folder=folder;row.confirmed=true;
  row.history.push(choice.rating);results.saved.push(choice.candidate);
 }
 return results;
}
const fixture=()=>Array.from({length:7},(_,i)=>({candidate:'TEST'+String(i+6).padStart(2,'0'),imageId:'png-'+(i+6),rating:null,folder:'pending',confirmed:false,history:[]}));
test('skip unrelated and malformed PNG without blocking valid records',()=>{
 const rows=fixture();
 const r=run(rows,[{candidate:'unrelated',imageId:'junk',rating:'o'},{candidate:'TEST06',imageId:'bad',rating:'o'},{candidate:'TEST07',imageId:'png-7',rating:'h'}]);
 assert.equal(r.ignored.length,1);assert.equal(r.errors.length,1);assert.deepEqual(r.saved,['TEST07']);
});
test('partial failure resumes only incomplete records, without duplicate history',()=>{
 const rows=fixture(),choices=rows.map((r,i)=>({candidate:r.candidate,imageId:r.imageId,rating:['o','h','x'][i%3]}));
 const first=run(rows,choices,'TEST08');
 assert.equal(first.saved.length,6);assert.equal(first.errors.length,1);
 const second=run(rows,choices);
 assert.deepEqual(second.saved,['TEST08']);assert.equal(second.unchanged.length,6);
 assert.ok(rows.every(r=>r.history.length===1));
 const third=run(rows,choices);
 assert.equal(third.saved.length,0);assert.equal(third.unchanged.length,7);
});
test('recording rejection preserves PNG instead of deleting',()=>{
 const rows=fixture(),r=run(rows,[{candidate:'TEST06',imageId:'png-6',rating:'x'}]);
 assert.deepEqual(r.saved,['TEST06']);assert.equal(rows.length,7);
 assert.equal(rows[0].folder,'reject');
});
