const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const messages=require('../src/messages/en.json');
const nativeLoad=Module._load;
require.extensions['.tsx']=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file)};
const get=(key)=>key.split('.').reduce((value,part)=>value?.[part],messages);
Module._load=function(request,...args){
 if(request==='next-intl')return {useTranslations(namespace){const translate=(key,values={})=>{let value=get(namespace+'.'+key);assert.equal(typeof value,'string','Missing translation '+key);for(const [name,text]of Object.entries(values))value=value.replaceAll('{'+name+'}',text);return value;};translate.has=key=>get(namespace+'.'+key)!==undefined;return translate;}};
 if(request==='@/components/gateway/forms')return {Form:props=>React.createElement('form',props),useFeatureLocation:()=>({hash:'#request-101'})};
 if(request==='@/components/gateway/shared')return {Submit:({children,...props})=>React.createElement('button',props,children)};
 return nativeLoad.call(this,request,...args);
};
after(()=>{Module._load=nativeLoad;});
const PermissionEditor=require('../src/components/gateway/PermissionEditor.tsx').default;
const AccessRequests=require('../src/components/gateway/AccessRequests.tsx').default;
const catalog={pages:['overview','endpoints','blog-editor','users','settings'],sections:['audio','query'],components:['endpoint.execute','endpoint.create','blog.create','blog.update','blog.app.azeemlab'],grants:['GET /api/v1/audio/models','POST /api/v1/query/'],credentials:[]};
const user={id:2,role:'operator',status:'approved',page_permissions:'["blog-editor","endpoints"]',credential_ids:'[]',grants:'["GET /api/v1/audio/models"]',sections:['audio'],components:['blog.create','endpoint.execute']};
test('rendered controls keep actual role/status values and only the active page actions',()=>{
 const html=renderToStaticMarkup(React.createElement(PermissionEditor,{catalog,user}));
 assert.match(html,/<option value="operator" selected="">operator<\/option>/);
 assert.match(html,/<option value="approved" selected="">approved<\/option>/);
 assert.match(html,/aria-label="Create blog posts"/);
 assert.doesNotMatch(html,/aria-label="Run allowed operations"/);
 assert.doesNotMatch(html,/aria-label="Team and permissions"/);
 assert.match(html,/type="hidden" name="endpoint" value="GET \/api\/v1\/audio\/models"/);
 assert.equal((html.match(/name="component" value="endpoint.execute"/g)||[]).length,1);
 assert.match(html,/sm:grid-cols-2 xl:grid-cols-3/);
 assert.match(html,/cursor-pointer/);
});
test('new verified approval uses a full-width review form without an invalid empty member ID',()=>{
 const data={...catalog,users:[],requests:[{id:101,name:'Applicant',email:'applicant@example.test',reason:'Review request',status:'pending',email_verified:true}]};
 const html=renderToStaticMarkup(React.createElement(AccessRequests,{data}));
 assert.match(html,/name="intent" value="invite"/);
 assert.match(html,/name="email" value="applicant@example.test"/);
 assert.doesNotMatch(html,/name="id" value=""/);
 assert.doesNotMatch(html,/<table/);
 assert.match(html,/md:grid-cols-12/);
 assert.match(html,/Approve membership/);
});
test('unverified applicant has no editable approval form',()=>{
 const data={...catalog,users:[],requests:[{id:101,name:'Applicant',email:'applicant@example.test',reason:'Review request',status:'pending',email_verified:false}]};
 const html=renderToStaticMarkup(React.createElement(AccessRequests,{data}));
 assert.doesNotMatch(html,/name="intent" value="invite"/);
 assert.match(html,/name="intent" value="reject"/);
 assert.ok(html.includes(messages.gateway.copy.m215));
});
