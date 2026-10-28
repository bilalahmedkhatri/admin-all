const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('node:http');
const {loader,loadEditorPost}=require('../src/lib/gateway/services/blog.ts');
const {sessionCookie}=require('../src/lib/gateway/backend.server.ts');
const {blogDraftStorageKey}=require('../src/lib/gateway/blog.ts');
const {hasPage,pageForPath}=require('../src/lib/gateway/permissions.ts');
let server,role='admin',extra=false,catalogReads=0;
before(async()=>{
 server=createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url.endsWith('/me'))return res.end(JSON.stringify({id:7,name:'Signed-in author',email:'writer@test.invalid',approved:1,role,page_permissions:'[]'}));
  assert.equal(req.headers.authorization,'Bearer isolated-blog-session');
  const post={id:9,title:'Saved article',slug:'saved-article',excerpt:'Summary',locale:'en',version:3,status:'published',category_id:2,cover_asset_id:null,author_name:'Original writer',author_designation:null,content_json:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Saved body'}]}]},metadata_json:{canonical_url:'https://example.test/blog/saved-article'},updated_at:'2026-10-27T00:00:00Z',published_at:'2026-10-26T00:00:00Z'};
  if(req.url==='/api/v1/dashboard/blog/apps/azeemlab/posts/9')return res.end(JSON.stringify({post}));
  if(req.url==='/api/v1/dashboard/blog/apps/azeemlab/categories?page_size=100')return res.end(JSON.stringify({items:[{id:2,name:'Guides'}],total:1,page:1,page_size:100}));
  if(req.url==='/api/v1/dashboard/blog/apps/azeemlab/assets?page_size=100')return res.end(JSON.stringify({assets:[],total:0,page:1,page_size:100}));
  if(req.url==='/api/v1/dashboard/blog/apps/azeemlab/settings')return res.end(JSON.stringify({public_blog_url:'https://example.test/blog'}));
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
 assert.deepEqual(data,{membershipId:7,isAdmin:true,initialProfile:{name:'Signed-in author',email:'writer@test.invalid'},canCreate:true,canUpdate:true,canPublish:true});
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
test('saved edit entry loads the selected app article and editor dependencies without changing its author or document',async()=>{
 const data=await loadEditorPost(await request(),'azeemlab',9);
 assert.equal(data.app.key,'azeemlab');
 assert.equal(data.post.id,9);
 assert.equal(data.post.author_name,'Original writer');
 assert.equal(data.post.content_json.content[0].content[0].text,'Saved body');
 assert.equal(data.post.published_at,'2026-10-26T00:00:00Z');
 assert.deepEqual(data.categories,[{id:2,name:'Guides'}]);
 assert.equal(data.publicBlogUrl,'https://example.test/blog');
});
test('unavailable website is rejected before opening its saved post',async()=>{
 await assert.rejects(loadEditorPost(await request(),'bondsgame',9),r=>r.status===404);
 for(const path of ['/blog-editor/new','/blog-editor/posts','/blog-editor/edit/azeemlab/9'])assert.equal(pageForPath(path),'blog-editor');
});
