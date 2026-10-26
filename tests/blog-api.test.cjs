const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('node:http');
const {handleBlog}=require('../src/lib/gateway/services/blog-api.ts');
const {sessionCookie}=require('../src/lib/gateway/backend.server.ts');
let server,role='admin',writes=[],reads=[],fail=false,extraCatalog=false;
before(async()=>{
 server=createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json');
  assert.ok(!req.url.endsWith('/me'), 'blog operations must not preflight /me');
  if(role !== 'admin'){res.writeHead(403);return res.end(JSON.stringify({detail:'Permission denied'}));}
  assert.equal(req.headers.authorization,'Bearer isolated-blog-session');
  assert.equal(req.headers.origin,'http://localhost:3002');
  if(fail){res.writeHead(503);return res.end(JSON.stringify({detail:'PRIVATE_DIAGNOSTICS'}));}
  if(req.url==='/api/v1/dashboard/blog/apps'){return res.end(JSON.stringify({apps:[{key:'azeemlab',label:'AzeemLab',configured:true,...(extraCatalog?{database_url:'PRIVATE_DB_URL'}:{})}]}));}
  if(req.method==='GET'){reads.push(req.url);return res.end(JSON.stringify({posts:[],total:0}));}
  let bytes=[];for await(const chunk of req)bytes.push(chunk);
  writes.push({url:req.url,body:Buffer.concat(bytes),type:req.headers['content-type'],token:req.headers['idempotency-key']});
  res.end(JSON.stringify({accepted:true}));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 process.env.GATEWAY_URL='http://127.0.0.1:'+server.address().port;
 process.env.ADMIN_ORIGIN='http://localhost:3002';
});
after(async()=>new Promise(resolve=>server.close(resolve)));
async function request(query,method='GET',body,headers={}){return new Request('http://localhost:3002/blog-editor/api?'+query,{method,headers:{Cookie:(await sessionCookie.serialize('isolated-blog-session')).split(';')[0],...(method!=='GET'?{Origin:'http://localhost:3002'}:{}),...headers},body});}
test('blog proxy retains exact app scope, pagination and no-store',async()=>{
 const response=await handleBlog(await request('app=azeemlab&resource=posts&page=2&search=literal%25'));
 assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');
 assert.equal(reads.at(-1),'/api/v1/dashboard/blog/apps/azeemlab/posts?page=2&search=literal%25');
});
test('JSON writes retain version and editor document without adding identity or slug',async()=>{
 const body=JSON.stringify({version:3,title:'Secure post',content_json:{type:'doc',content:[]}});
 const response=await handleBlog(await request('app=ailettergen&resource=posts&id=12','PATCH',body,{'Content-Type':'application/json'}));
 assert.equal(response.status,200);
 assert.equal(writes.at(-1).url,'/api/v1/dashboard/blog/apps/ailettergen/posts/12');
 assert.deepEqual(JSON.parse(writes.at(-1).body),JSON.parse(body));
});
test('binary upload streams intact with retry token and exact MIME',async()=>{
 const body=Buffer.from([0,255,23,42]);const token='7ff0c20a-e90c-4ab4-b793-4a6175ef3781';
 const response=await handleBlog(await request('app=azeemlab&resource=assets&filename=a.wav','POST',body,{'Content-Type':'audio/wav','Idempotency-Key':token}));
 assert.equal(response.status,200);assert.deepEqual(writes.at(-1).body,body);assert.equal(writes.at(-1).token,token);assert.equal(writes.at(-1).type,'audio/wav');
});
test('Origin, page grant and session are enforced independently',async()=>{
 let count=writes.length;
 assert.equal((await handleBlog(await request('app=azeemlab&resource=posts','POST','{}',{Origin:'https://evil.test'}))).status,403);
 role='viewer';assert.equal((await handleBlog(await request('app=azeemlab&resource=posts'))).status,403);role='admin';
 assert.equal((await handleBlog(new Request('http://localhost:3002/blog-editor/api?app=azeemlab&resource=posts'))).status,401);
 assert.equal(writes.length,count);
});
test('invalid routing, IDs and delete cannot become gateway operations',async()=>{
 const count=reads.length;
 for(const query of ['app=../azeemlab&resource=posts','app=azeemlab&resource=../settings','app=azeemlab&resource=posts&id=1/2'])assert.equal((await handleBlog(await request(query))).status,400);
 assert.equal((await handleBlog(await request('app=azeemlab&resource=posts','DELETE'))).status,405);
 assert.equal(reads.length,count);
});
test('oversized declared body is rejected before forwarding and failures hide diagnostics',async()=>{
 const count=writes.length;
 assert.equal((await handleBlog(await request('app=azeemlab&resource=posts','POST','{}',{'Content-Length':'999999999'}))).status,413);
 assert.equal(writes.length,count);
 fail=true;const response=await handleBlog(await request('app=azeemlab&resource=posts'));fail=false;
 assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/PRIVATE_DIAGNOSTICS/);
});

test('image gallery proxy forwards image filtering and pagination but not caller ownership',async()=>{
 const response=await handleBlog(await request('app=azeemlab&resource=assets&page=2&page_size=12&media_type=image&uploaded_by_membership_id=99'));
 assert.equal(response.status,200);
 assert.equal(reads.at(-1),'/api/v1/dashboard/blog/apps/azeemlab/assets?page=2&page_size=12&media_type=image');
});


test('on-demand catalog validates safe fields, session and read-only routing',async()=>{
 const response=await handleBlog(await request('resource=apps'));
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{apps:[{key:'azeemlab',label:'AzeemLab',configured:true}]});
 extraCatalog=true;
 const invalid=await handleBlog(await request('resource=apps'));
 extraCatalog=false;
 assert.equal(invalid.status,503);assert.doesNotMatch(await invalid.text(),/PRIVATE_DB_URL|database_url/);
 assert.equal((await handleBlog(await request('resource=apps','POST','{}'))).status,405);
 role='viewer';assert.equal((await handleBlog(await request('resource=apps'))).status,403);role='admin';
});


test('avatar proxy streams image bytes to the authenticated self-avatar endpoint',async()=>{
 const bytes=Buffer.from([0,1,2,3]);
 const response=await handleBlog(await request('resource=avatar','POST',bytes,{'Content-Type':'image/webp'}));
 assert.equal(response.status,200);
 assert.equal(writes.at(-1).url,'/api/v1/dashboard/blog/profile/avatar');
 assert.equal(writes.at(-1).type,'image/webp');assert.deepEqual(writes.at(-1).body,bytes);
 assert.equal((await handleBlog(await request('resource=avatar'))).status,405);
 assert.equal((await handleBlog(await request('resource=avatar','POST',bytes,{'Content-Type':'image/webp','Content-Length':String(2*1024*1024+1)}))).status,413);
});
