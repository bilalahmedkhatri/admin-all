const {test}=require('node:test');
const assert=require('node:assert/strict');
const {initialSelection,endpointAction,sectionOperations,relatedComponents,togglePermission}=require('../src/lib/gateway/permission-options.ts');
const catalog={pages:['overview','endpoints','blog-editor'],sections:['audio','query','keys'],components:['endpoint.execute','endpoint.create','endpoint.update','endpoint.delete','blog.create','blog.update','blog.publish','blog.app.azeemlab','members.manage'],grants:['GET /api/v1/audio/models','GET /api/v1/audio/sample','POST /api/v1/audio/tts','POST /api/v1/audio/tts/retry/{job_id}','POST /api/v1/query/','DELETE /api/v1/keys/{key_id}'],credentials:[]};
test('API sections expose only their own operations and role-appropriate capabilities',()=>{
 assert.deepEqual(sectionOperations(catalog,'audio','viewer'),['GET /api/v1/audio/models']);
 assert.equal(sectionOperations(catalog,'audio','operator').length,4);
 assert.deepEqual(sectionOperations(catalog,'keys','operator'),[]);
 assert.deepEqual(relatedComponents(catalog,'endpoints','query','operator'),['endpoint.execute','endpoint.create']);
 assert.equal(endpointAction('GET /api/v1/audio/sample'),'create');
 assert.equal(endpointAction('POST /api/v1/audio/tts/retry/{job_id}'),'update');
});
test('Blog Editor shows only blog actions, never API or unrelated member controls',()=>{
 assert.deepEqual(relatedComponents(catalog,'blog-editor','','operator'),['blog.create','blog.update','blog.publish']);
 assert.deepEqual(relatedComponents(catalog,'overview','','operator'),[]);
 assert.deepEqual(relatedComponents(catalog,'blog-editor','','viewer'),[]);
});
test('removing a parent page clears only its dependent grants',()=>{
 const original={page:['endpoints','blog-editor'],section:['audio'],endpoint:['GET /api/v1/audio/models'],component:['endpoint.execute','blog.create','blog.app.azeemlab'],credential:['8']};
 const removed=togglePermission(original,'page','endpoints',false);
 assert.deepEqual(removed,{page:['blog-editor'],section:[],endpoint:[],component:['blog.create','blog.app.azeemlab'],credential:[]});
 assert.deepEqual(original.section,['audio']);
 const blogRemoved=togglePermission(original,'page','blog-editor',false);
 assert.deepEqual(blogRemoved.component,['endpoint.execute']);
 assert.deepEqual(blogRemoved.endpoint,original.endpoint);
});
test('removing an API section clears its routes without losing other sections or shared actions',()=>{
 const selection={...initialSelection(),page:['endpoints'],section:['audio','query'],endpoint:['GET /api/v1/audio/models','POST /api/v1/query/'],component:['endpoint.execute','endpoint.create']};
 const result=togglePermission(selection,'section','audio',false);
 assert.deepEqual(result.endpoint,['POST /api/v1/query/']);
 assert.deepEqual(result.section,['query']);
 assert.deepEqual(result.component,selection.component);
});
test('existing inactive and unknown grants survive initialization and unrelated edits',()=>{
 const user={page_permissions:'["blog-editor","endpoints"]',grants:'["GET /api/v1/audio/models"]',credential_ids:'[7]',sections:['audio'],components:['blog.create','future.action']};
 const selected=initialSelection(user);
 const result=togglePermission(selected,'page','overview',true);
 assert.deepEqual(result.component,['blog.create','future.action']);
 assert.deepEqual(result.credential,['7']);
 assert.deepEqual(result.endpoint,['GET /api/v1/audio/models']);
 assert.equal(togglePermission(result,'page','overview',true).page.filter(p=>p==='overview').length,1);
});
