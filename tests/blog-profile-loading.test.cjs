const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const filename=path.resolve(__dirname,'../src/components/blog/DatabaseBlogEditor.tsx');
const source=ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const component=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='DatabaseBlogEditor');
const expression=component.body.statements.find(n=>ts.isExpressionStatement(n)&&ts.isCallExpression(n.expression)&&n.expression.expression.getText(source)==='useEffect'&&n.getText(source).includes('profileRequest.current'));
const code=ts.transpileModule('const effect = '+expression.expression.arguments[0].getText(source)+';', {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const update=component.body.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='updateProfile');
const updateCode=ts.transpileModule(update.getText(source),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const bind=new Function('initialProfile','profileRequest','blogRequest','authorProfileSchema','setProfile','setError',code+updateCode+';return {effect,save:updateProfile};');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){const initial={email:'a@test.invalid'},ref={current:null},calls=[],profiles=[],errors=[];const run=bind(initial,ref,()=>new Promise((resolve,reject)=>calls.push({resolve,reject})),{},value=>profiles.push(value),value=>errors.push(value));return{initial,ref,calls,profiles,errors,run:run.effect,save:run.save};}

test('effect replay shares one pending read and preserves the loaded profile after a save',async()=>{
 const state=setup();const cleanup=state.run();cleanup();state.run();assert.equal(state.calls.length,1);
 state.calls[0].resolve({name:'Current Author'});await tick();assert.equal(state.profiles.length,1);assert.equal(state.ref.current.loaded,true);
 state.save({name:'Profile Saved Later'});state.run();await tick();assert.equal(state.calls.length,1);assert.equal(state.profiles.at(-1).name,'Profile Saved Later');
});
test('pending reads never cross account changes or replace a newer profile',async()=>{
 const state=setup();const cleanup=state.run();cleanup();state.initial.email='b@test.invalid';state.run();assert.equal(state.calls.length,2);
 state.calls[0].resolve({name:'Old Account'});await tick();assert.equal(state.profiles.length,0);assert.equal(state.ref.current.email,'b@test.invalid');
 state.calls[1].resolve({name:'New Account'});await tick();assert.deepEqual(state.profiles,[{name:'New Account'}]);
});
test('a failed read releases the pending slot and can be retried',async()=>{
 const state=setup();state.run();state.calls[0].reject(new Error('PRIVATE_DIAGNOSTIC'));await tick();assert.equal(state.ref.current,null);assert.doesNotMatch(state.errors[0],/PRIVATE_DIAGNOSTIC/);
 state.run();assert.equal(state.calls.length,2);state.calls[1].resolve({name:'Recovered'});await tick();assert.equal(state.profiles[0].name,'Recovered');
});

test('saving while initial profile read is pending wins over its late success or failure',async()=>{
 for(const fails of [false,true]){
 const state=setup();state.run();state.save({name:'Saved Profile'});
 if(fails)state.calls[0].reject(new Error('late failure'));else state.calls[0].resolve({name:'Old Profile'});
 await tick();assert.deepEqual(state.profiles,[{name:'Saved Profile'}]);assert.deepEqual(state.errors,[]);
 state.run();assert.equal(state.calls.length,1);
 }
});
