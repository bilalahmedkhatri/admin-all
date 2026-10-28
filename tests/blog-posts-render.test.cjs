const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const messages=require('../src/messages/en.json');
const nativeLoad=Module._load;
require.extensions['.tsx']=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file)};
Module._load=function(name,...args){
 if(name==='next-intl')return {useLocale:()=> 'en',useTranslations:namespace=>(key,values={})=>{let text=(namespace+'.'+key).split('.').reduce((value,part)=>value?.[part],messages);assert.equal(typeof text,'string','Missing translation '+namespace+'.'+key);for(const [name,value]of Object.entries(values))text=text.replaceAll('{'+name+'}',value);return text;}};
 if(name==='@/i18n/navigation')return {Link:({children,...props})=>React.createElement('a',props,children)};
 return nativeLoad.call(this,name,...args);
};
after(()=>{Module._load=nativeLoad;});
const Table=require('../src/components/blog/BlogPostsTable.tsx').default;
const Counts=require('../src/components/blog/BlogWebsiteCounts.tsx').default;
const {publishedBlogUrl}=require('../src/lib/gateway/blog-navigation.ts');
const post={id:9,title:'Saved article',slug:'saved-article',excerpt:'Summary',locale:'en',version:1,status:'published',category_id:null,cover_asset_id:null,author_name:'Original writer',author_designation:null,metadata_json:{canonical_url:'https://example.test/blog/saved-article'},updated_at:'2026-10-27T00:00:00Z',published_at:'2026-10-26T00:00:00Z'};
const groups=['azeemlab','ailettergen'].map(key=>({app:{key,label:key==='azeemlab'?'AzeemLab':'AILetterGen',configured:true},items:[post],total:1,page:1,page_size:20,error:''}));
test('saved blogs table distinguishes website-scoped IDs and shows stored publication dates and creator for administrators',()=>{
 const html=renderToStaticMarkup(React.createElement(Table,{groups,isAdmin:true,canUpdate:true}));
 assert.match(html,/<table/);assert.match(html,/Created by/);assert.match(html,/Original writer/);
 assert.match(html,/AzeemLab/);assert.match(html,/AILetterGen/);
 assert.match(html,/href="\/blog-editor\/edit\/azeemlab\/9"/);
 assert.match(html,/href="\/blog-editor\/edit\/ailettergen\/9"/);
 assert.match(html,/datetime="2026-10-26T00:00:00Z"/i);
 assert.match(html,/View published post/);
});
test('ordinary members do not receive the creator column; drafts have no publication link or invented date',()=>{
 const draft={...post,status:'draft',published_at:null};
 const html=renderToStaticMarkup(React.createElement(Table,{groups:[{...groups[0],items:[draft]}],isAdmin:false,canUpdate:false}));
 assert.doesNotMatch(html,/Created by|Original writer|<time|View published post/);
 assert.match(html,/Open post/);
 assert.equal(publishedBlogUrl({...post,metadata_json:{canonical_url:'javascript:alert(1)'}}),null);
 assert.equal(publishedBlogUrl({...post,metadata_json:{canonical_url:'https://user:password@example.test'}}),null);
});
test('website summary displays own count in green and unfiltered website total independently of table pagination',()=>{
 const html=renderToStaticMarkup(React.createElement(Counts,{groups:[{...groups[0],total:1,counts:{mine:2,total:10}}]}));
 assert.match(html,/Your posts: 2; website total: 10/);
 assert.match(html,/text-success-600[^>]*>2<\/span>/);
 assert.match(html,/text-black[^>]*>10<\/span>/);
});
