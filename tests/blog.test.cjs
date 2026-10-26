const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('node:http');
const {loader}=require('../src/lib/gateway/services/blog.ts');
const {sessionCookie}=require('../src/lib/gateway/backend.server.ts');
const {blogDraftStorageKey}=require('../src/lib/gateway/blog.ts');
const {hasPage,pageForPath}=require('../src/lib/gateway/permissions.ts');
let server,role='admin',extra=false,catalogReads=0;
before(async()=>{
 server=createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url.endsWith('/me'))return res.end(JSON.stringify({id:7,name:'Signed-in author',email:'writer@test.invalid',approved:1,role,page_permissions:'[]'}));
  assert.equal(req.headers.authorization,'Bearer isolated-blog-session');
  assert.equal(req.url,'/api/v1/dashboard/blog/apps'); catalogReads++;
  res.end(JSON.stringify({apps:[{key:'azeemlab',label:'AzeemLab',configured:true,...(extra?{database_url:'must-not-serialize'}:{})}]}));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 process.env.GATEWAY_URL='http://127.0.0.1:'+server.address().port;
 process.env.ADMIN_ORIGIN='http://localhost:3002';
});
after(async()=>new Promise(resolve=>server.close(resolve)));
async function request(){return new Request('http://localhost:3002/blog-editor',{headers:{Cookie:(await sessionCookie.serialize('isolated-blog-session')).split(';')[0]}})}
test('editor entry authorizes but defers all app catalog work',async()=>{
 const data=await loader({request:await request(),params:{}});
 assert.deepEqual(data,{membershipId:7,initialProfile:{name:'Signed-in author',email:'writer@test.invalid'},canCreate:true,canUpdate:true,canPublish:true});
 assert.equal(catalogReads,0);
 assert.equal(pageForPath('/blog-editor'),'blog-editor');
});
test('missing page permission prevents catalog requests',async()=>{
 role='viewer';const before=catalogReads;
 await assert.rejects(loader({request:await request(),params:{}}),r=>r.status===403);
 assert.equal(catalogReads,before);
 assert.equal(hasPage({role:'viewer',page_permissions:'[]'},'blog-editor'),false); role='admin';
});
test('draft scopes differ by member and app without claiming legacy drafts',()=>{
 const first=blogDraftStorageKey(1,'azeemlab');
 assert.notEqual(first,blogDraftStorageKey(2,'azeemlab'));
 assert.notEqual(first,blogDraftStorageKey(1,'ailettergen'));
 assert.notEqual(first,'ai_voice_blog_drafts');
 assert.throws(()=>blogDraftStorageKey(1,'../azeemlab'));
});
