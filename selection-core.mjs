// Shared pure selection rules. Browser + Node.js compatible.
export const RATING_FOLDER = Object.freeze({o:'adopt',h:'hold',x:'reject'});
export function planSelection(record, choice) {
 if(!record) return {action:'ignore',reason:'unregistered'};
 if(!choice || !Object.hasOwn(RATING_FOLDER,choice.rating))return {action:'ignore',reason:'unrated'};
 if(record.imageId!==choice.imageId)return {action:'error',reason:'image-id mismatch'};
 const destination=RATING_FOLDER[choice.rating];
 if(record.rating===choice.rating && record.folder===destination && record.confirmed===true)return {action:'unchanged',destination};
 return {action:'sync',destination};
}
export async function applySelections(records,choices,commit){
 const byId=new Map(records.map(r=>[r.candidate,r]));
 const result={saved:[],unchanged:[],errors:[],ignored:[]};
 const seen=new Set();
 for(const choice of choices){
  if(seen.has(choice.candidate)){result.errors.push(choice.candidate+': duplicate choice');continue}
  seen.add(choice.candidate);
  const record=byId.get(choice.candidate);
  const plan=planSelection(record,choice);
  if(plan.action==='ignore'){result.ignored.push(choice.candidate);continue}
  if(plan.action==='error'){result.errors.push(choice.candidate+': '+plan.reason);continue}
  if(plan.action==='unchanged'){result.unchanged.push(choice.candidate);continue}
  try{await commit(record,choice,plan.destination);result.saved.push(choice.candidate)}
  catch(error){result.errors.push(choice.candidate+': '+error.message)}
 }
 return result;
}
