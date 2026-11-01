'use strict';
// Requires Firebase compat SDKs loaded in index.html. No privileged credentials on client.
(function(){
 const cfg=window.CAREERPILOT_FIREBASE_CONFIG||{};
 const configured=!!(cfg.apiKey && !cfg.apiKey.startsWith('REPLACE_') && cfg.projectId && !cfg.projectId.startsWith('REPLACE_'));
 const api={configured,user:null,ready:false};window.CareerCloud=api;
 if(!configured){api.ready=true;window.dispatchEvent(new CustomEvent('career-auth',{detail:{user:null,configured:false}}));return}
 firebase.initializeApp(cfg);const auth=firebase.auth(),db=firebase.firestore();api.db=db;
 api.signup=(email,password)=>auth.createUserWithEmailAndPassword(email,password);
 api.login=(email,password)=>auth.signInWithEmailAndPassword(email,password);
 api.google=()=>auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
 api.reset=email=>auth.sendPasswordResetEmail(email);
 api.logout=()=>auth.signOut();
 api.read=async(name)=>{if(!api.user)throw Error('Sign in required');const snap=await db.collection('users').doc(api.user.uid).collection('workspace').doc(name).get();return snap.exists?snap.data().value:null};
 api.write=async(name,value)=>{if(!api.user)throw Error('Sign in required');await db.collection('users').doc(api.user.uid).collection('workspace').doc(name).set({value,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})};
 api.importResume=async(profile,resume,expectedUid)=>{
  if(!auth.currentUser||auth.currentUser.uid!==expectedUid||api.user?.uid!==expectedUid)throw Error('Your sign-in changed. Reopen the import.');
  const workspace=db.collection('users').doc(expectedUid).collection('workspace');
  const batch=db.batch();
  for(const [name,value] of [['profile',profile],['resume',resume]])batch.set(workspace.doc(name),{value,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  await batch.commit();
 };
 auth.onAuthStateChanged(user=>{api.user=user;api.ready=true;window.dispatchEvent(new CustomEvent('career-auth',{detail:{user,configured:true}}))},err=>{console.error('Authentication initialization error',err);api.ready=true;window.dispatchEvent(new CustomEvent('career-auth',{detail:{user:null,configured:true,error:err.message}}))});
})();
