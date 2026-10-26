// Disposable fabricated browser fixture; never connects to a configured database or B2.
const {createServer}=require('node:http');
const posts={azeemlab:[],ailettergen:[]}, cats={azeemlab:[],ailettergen:[]};
const user={id:7,name:'Test Editor',email:'editor@example.test',role:'admin',approved:1,active:1,status:'approved',created_at:'',grants:'[]',credential_ids:'[]',page_permissions:'[]',sections:[],components:[]};
createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/session'){res.setHeader('Set-Cookie','gateway_dashboard_session='+encodeURIComponent(Buffer.from(JSON.stringify('isolated-browser-fixture')).toString('base64'))+'; Path=/; HttpOnly; SameSite=Lax');res.writeHead(200);return res.end(JSON.stringify({fixture:true}));} const send=(value,status=200)=>{res.writeHead(status);res.end(JSON.stringify(value));};
 if(url.pathname.endsWith('/me'))return send(user);
 if(url.pathname.endsWith('/blog/apps'))return send({apps:[{key:'azeemlab',label:'AzeemLab',configured:true},{key:'ailettergen',label:'AILetterGen',configured:true}]});
 if(url.pathname.endsWith('/blog/profile'))return send({name:'Test Editor',designation:'Staff writer'});
 const match=url.pathname.match(/blog\/apps\/(azeemlab|ailettergen)\/(posts|categories|settings|assets)(?:\/(\d+))?$/);
 if(!match)return send({detail:'Unsupported fixture endpoint'},404);
 const [,key,resource,id]=match;
 if(resource==='settings')return send({public_blog_url:'https://example.test/en/blog'});
 if(resource==='categories')return send({items:cats[key],total:cats[key].length,page:1,page_size:100});
 if(resource==='assets')return send({assets:[],total:0});
 if(req.method==='GET')return id?send({post:posts[key].find(p=>p.id===Number(id))}):send({items:posts[key],total:posts[key].length,page:1,page_size:20});
 let raw=''; for await(const chunk of req)raw+=chunk;
 const body=JSON.parse(raw),existing=posts[key].find(p=>p.id===Number(id));
 if(existing&&existing.version!==body.version)return send({detail:'This post changed. Reload it before saving.'},409);
 let categoryId=body.category_id||null;
 if(body.category_name){const category={id:cats[key].length+1,name:body.category_name};cats[key].push(category);categoryId=category.id;}
 const post={id:existing?.id||posts[key].length+1,title:body.title,slug:existing?.slug||body.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),excerpt:body.excerpt,locale:body.locale,version:(existing?.version||0)+1,status:body.status,category_id:categoryId,cover_asset_id:body.cover_asset_id,author_name:'Test Editor',author_designation:'Staff writer',content_json:body.content_json,metadata_json:{canonical_url:'https://example.test/en/blog/'+(existing?.slug||body.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'))},updated_at:new Date().toISOString()};
 if(existing)posts[key][posts[key].indexOf(existing)]=post;else posts[key].push(post);
 send({post,audit_recorded:true});
}).listen(8014,'127.0.0.1',()=>console.log('Disposable blog fixture listening on 8014'));
