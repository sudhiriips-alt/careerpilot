// npm install --prefix /tmp/careerpilot-validation firebase-tools @firebase/rules-unit-testing firebase
// NODE_PATH=/tmp/careerpilot-validation/node_modules firebase emulators:exec --project demo-careerpilot --only firestore "node --test tests/firestore_rules_test.cjs"
const {test}=require('node:test');
const fs=require('node:fs');
test('Firestore owner access, unauthenticated/cross-user denial, and atomic denial',async()=>{
 const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
 const {doc,getDoc,setDoc,writeBatch}=require('firebase/firestore');
 const env=await initializeTestEnvironment({projectId:'demo-careerpilot',firestore:{rules:fs.readFileSync('firestore.rules','utf8')}});
 try{
  const owner=env.authenticatedContext('alice').firestore();
  const other=env.authenticatedContext('bob').firestore();
  const anon=env.unauthenticatedContext().firestore();
  for(const name of ['jobs','profile','resume']){
   const path=`users/alice/workspace/${name}`;
   await assertSucceeds(setDoc(doc(owner,path),{value:{name:'original'}}));
   await assertSucceeds(getDoc(doc(owner,path)));
   for(const db of [other,anon]){
    await assertFails(getDoc(doc(db,path)));
    await assertFails(setDoc(doc(db,path),{value:{name:'forbidden'}}));
   }
  }
  await assertFails(setDoc(doc(owner,'users/alice/workspace/unknown'),{value:{}}));
  const allowed=writeBatch(owner);
  for(const name of ['profile','resume'])allowed.set(doc(owner,`users/alice/workspace/${name}`),{value:{name:'approved'}});
  await assertSucceeds(allowed.commit());
  const denied=writeBatch(owner);
  denied.set(doc(owner,'users/alice/workspace/profile'),{value:{name:'must not persist'}});
  denied.set(doc(owner,'users/bob/workspace/resume'),{value:{}});
  await assertFails(denied.commit());
  const snap=await getDoc(doc(owner,'users/alice/workspace/profile'));
  require('node:assert/strict').equal(snap.data().value.name,'approved');
 }finally{await env.cleanup()}
});
