const {test,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path'),Module=require('node:module');
// Exercise React's real server cache; the test dispatcher scopes it to a render.
const React=require(path.join(path.dirname(require.resolve('react')),'react.react-server.js'));
const load=Module._load;
Module._load=function(name,...args){if(name==='react')return React;return load.call(this,name,...args);};
const {currentUser,requireUser}=require('../src/lib/gateway/auth.server.ts');
Module._load=load;
const {sessionCookie}=require('../src/lib/gateway/backend.server.ts');
const internals=React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
const originalFetch=globalThis.fetch;let calls,user,status;
function render(){const roots=new Map();internals.A={getCacheForType(factory){if(!roots.has(factory))roots.set(factory,factory());return roots.get(factory);}};}
beforeEach(()=>{process.env.ADMIN_ORIGIN='http://localhost:3002';process.env.GATEWAY_URL='http://127.0.0.1:9999';calls=[];status=200;user={id:1,name:'Tester',role:'viewer',approved:1,page_permissions:'[]'};globalThis.fetch=async(url,init)=>{calls.push({url,init});await Promise.resolve();return Response.json(status===200?user:{detail:'PRIVATE'}, {status});};render();});
afterEach(()=>{internals.A=null;globalThis.fetch=originalFetch;});
async function request(path='/',token='a'){return new Request('http://localhost:3002'+path,{headers:{Cookie:(await sessionCookie.serialize(token)).split(';')[0]}});}
test('layout and leaf page share one live me read while page authorization remains independent',async()=>{
 const layout=await request('/'),page=await request('/blog-editor');
 const results=await Promise.allSettled([requireUser(layout,undefined,false),requireUser(page)]);
 assert.equal(calls.length,1);assert.equal(results[0].status,'fulfilled');assert.equal(results[1].reason.status,403);
});
test('fresh render revalidates revoked sessions and separate accounts never share results',async()=>{
 await Promise.all([currentUser(await request('/','a')),currentUser(await request('/','b'))]);assert.equal(calls.length,2);
 status=401;render();assert.equal(await currentUser(await request('/','a')),null);assert.equal(calls.length,3);
});
test('server actions and non-render calls are not retained in a global auth cache',async()=>{
 internals.A=null;await currentUser(await request());status=401;assert.equal(await currentUser(await request()),null);assert.equal(calls.length,2);
});
test('missing sessions do not call backend and transient failures can recover in a new render',async()=>{
 assert.equal(await currentUser(new Request('http://localhost:3002')),null);assert.equal(calls.length,0);
 status=503;await assert.rejects(currentUser(await request()),e=>e instanceof Response&&e.status===503);
 status=200;render();assert.equal((await currentUser(await request())).id,1);assert.equal(calls.length,2);
});
