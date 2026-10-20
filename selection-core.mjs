// Image identities belong to attempts, not candidates. Pure rules shared by UI/tests.
export const RATING_FOLDER = Object.freeze({o:'adopt',h:'hold',x:'pending'});
export function planSelection(record, choice, {testReject=false}={}) {
 if(!record) return {action:'ignore',reason:'unregistered'};
 if(!choice || !Object.hasOwn(RATING_FOLDER,choice.rating))return {action:'ignore',reason:'unrated'};
 if(record.imageId!==choice.imageId || (choice.candidate && record.candidate!==choice.candidate))return {action:'error',reason:'image-id mismatch'};
 const destination=choice.rating==='x' ? (testReject?'reject':record.folder||'pending') : RATING_FOLDER[choice.rating];
 if(record.rating===choice.rating && record.folder===destination && record.confirmed===true && (record.comment||'')===(choice.comment||''))return {action:'unchanged',destination};
 return {action:'sync',destination};
}
export async function applySelections(records,choices,commit,options){
 const result={saved:[],unchanged:[],errors:[],ignored:[]},seen=new Set();
 for(const choice of choices){
  const key=choice.imageId;
  if(seen.has(key)){result.errors.push(choice.candidate+': duplicate choice');continue}seen.add(key);
  const matches=records.filter(r=>r.imageId===key);
  if(matches.length>1){result.errors.push(choice.candidate+': duplicate image ID');continue}
  const record=matches[0]||records.find(r=>r.candidate===choice.candidate);
  const plan=planSelection(record,choice,options);
  if(plan.action==='ignore'){result.ignored.push(choice.candidate);continue}
  if(plan.action==='error'){result.errors.push(choice.candidate+': '+plan.reason);continue}
  if(plan.action==='unchanged'){result.unchanged.push(choice.candidate);continue}
  try{await commit(record,choice,plan.destination);result.saved.push(choice.candidate)}catch(error){result.errors.push(choice.candidate+': '+error.message)}
 }
 return result;
}
