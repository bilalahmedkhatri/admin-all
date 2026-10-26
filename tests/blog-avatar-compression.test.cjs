const {test,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const {compressImage}=require('../src/utils/compressImage.ts');
const {avatarUploadSchema}=require('../src/lib/gateway/blog-client.ts');
// Execute the production file handler with the real compressor; mock only Canvas/HTTP.
const filename=path.resolve(__dirname,'../src/components/blog/BlogAuthorCard.tsx');
const source=ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const component=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='BlogAuthorCard');
const handler=component.body.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='handleAvatarFile');
const code=ts.transpileModule(handler.getText(source),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const bind=new Function('compressImage','setUploading','setError','setDraft','blogRequest','avatarUploadSchema','MAX_AVATAR_SIZE','busy','uploading',code+'; return handleAvatarFile;');
let previousDocument,previousBitmap,encoded,draw,quality;
beforeEach(()=>{
 previousDocument=globalThis.document;previousBitmap=globalThis.createImageBitmap;
 encoded=new Blob([new Uint8Array(4000)],{type:'image/webp'});
 globalThis.createImageBitmap=async()=>({width:3000,height:1500,close(){}});
 globalThis.document={createElement:()=>({width:0,height:0,getContext(){return{drawImage(...args){draw=args;}};},toBlob(callback,type,q){quality=q;callback(encoded);}})};
});
afterEach(()=>{if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;if(previousBitmap===undefined)delete globalThis.createImageBitmap;else globalThis.createImageBitmap=previousBitmap;});
function setup(ok=true){
 const calls=[],states=[],errors=[];let draft={avatar_url:'https://media.test/existing.webp'};
 const upload=bind(compressImage,value=>states.push(value),value=>errors.push(value),update=>{draft=update(draft);},async(app,resource,schema,init)=>{calls.push({app,resource,...init});if(!ok)throw new Error('Image upload failed. Please try again.');return schema.parse({url:'https://media.test/new.webp'});},avatarUploadSchema,2*1024*1024,false,false);
 return{upload,calls,states,errors,draft:()=>draft};
}
function event(size=3*1024*1024,type='image/jpeg'){return{target:{files:[new File([new Uint8Array(size)],'avatar.jpg',{type})],value:'avatar.jpg'}};}

test('avatar larger than 2 MiB is compressed before validation and only compressed bytes are posted',async()=>{
 const state=setup();const input=event();await state.upload(input);
 assert.equal(state.calls.length,1);const file=state.calls[0].body;
 assert.equal(state.calls[0].resource,'avatar');assert.equal(state.calls[0].headers['Content-Type'],'image/webp');
 assert.equal(file.size,4000);assert.equal(file.type,'image/webp');assert.equal(file.name,'avatar.webp');
 assert.deepEqual(draw.slice(1),[0,0,512,256]);assert.equal(quality,0.82);
 assert.equal(state.draft().avatar_url,'https://media.test/new.webp');assert.equal(input.target.value,'');assert.deepEqual(state.states,[true,false]);
});
test('avatar still larger than 2 MiB after compression never reaches the network',async()=>{
 encoded=new Blob([new Uint8Array(2500000)],{type:'image/webp'});const state=setup();await state.upload(event());
 assert.equal(state.calls.length,0);assert.match(state.errors.at(-1),/Compressed avatar/);assert.equal(state.draft().avatar_url,'https://media.test/existing.webp');assert.deepEqual(state.states,[true,false]);
});
test('compression failure keeps the existing avatar and releases the processing state',async()=>{
 encoded=null;const state=setup();await state.upload(event());assert.equal(state.calls.length,0);assert.match(state.errors.at(-1),/could not be compressed/);assert.equal(state.draft().avatar_url,'https://media.test/existing.webp');assert.deepEqual(state.states,[true,false]);
});
test('failed avatar endpoint preserves the existing profile and reports upload failure',async()=>{
 const state=setup(false);await state.upload(event());assert.equal(state.calls.length,1);assert.match(state.errors.at(-1),/Image upload failed/);assert.equal(state.draft().avatar_url,'https://media.test/existing.webp');assert.deepEqual(state.states,[true,false]);
});
