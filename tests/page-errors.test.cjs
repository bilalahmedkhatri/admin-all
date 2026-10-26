const {test}=require('node:test');
const assert=require('node:assert/strict');
const Module=require('node:module');
const framework=require('next/navigation');
const load=Module._load;
const marker=kind=>Object.assign(new Error(kind),{kind});
Module._load=function(name,...args){
 if(name==='next/headers')return{headers:async()=>new Headers(),cookies:async()=>({set(){}})};
 if(name==='@/i18n/navigation')return{redirect:({href})=>{throw marker(href);}};
 if(name==='next/navigation')return{...framework,forbidden:()=>{throw marker('forbidden');},notFound:()=>{throw marker('not-found');}};
 return load.call(this,name,...args);
};
const {handlePageError,handleResponse}=require('../src/lib/gateway/runtime.server.ts');
const {loadPage}=require('../src/lib/gateway/load-page.server.ts');
Module._load=load;
test('raw backend Responses become sanitized retryable errors',async()=>{
 for(const read of [()=>handlePageError(new Response('PRIVATE',{status:503})),()=>handleResponse(new Response('PRIVATE',{status:503})),()=>loadPage(async()=>{throw new Response('PRIVATE',{status:503});})])
 await assert.rejects(read,e=>e instanceof Error&&!(e instanceof Response)&&e.message==='The requested page could not be loaded');
});
test('login, forbidden, missing page and safe redirects retain their behavior',async()=>{
 for(const [status,kind] of [[401,'/login'],[403,'forbidden'],[404,'not-found']])
 await assert.rejects(handlePageError(new Response('',{status})),e=>e.kind===kind);
 await assert.rejects(handlePageError(new Response('',{status:302,headers:{Location:'/pending'}})),e=>e.kind==='/pending');
 await assert.rejects(handleResponse(new Response('',{status:302,headers:{Location:'https://attacker.test'}})),e=>e.message==='The requested page could not be loaded');
});
test('framework redirect control flow is rethrown unchanged by page loaders',async()=>{
 const redirect=Object.assign(new Error('NEXT_REDIRECT'),{digest:'NEXT_REDIRECT;replace;/login;307;'});
 await assert.rejects(loadPage(async()=>{throw redirect;}),e=>e===redirect);
});
