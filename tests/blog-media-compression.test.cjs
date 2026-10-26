const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const source=ts.createSourceFile('picker.tsx',fs.readFileSync(path.resolve(__dirname,'../src/components/blog/BlogMediaPicker.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const component=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='BlogMediaPicker');
const handler=component.body.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='upload');
const code=ts.transpileModule(handler.getText(source),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function setup(file,{compressed=file,fail=false}={}){
 const calls=[],errors=[],tabs=[],states=[],inserted=[];let compressions=0,closed=0;
 const prepared={current:null};
 const upload=new Function('file','busy','imagesOnly','setError','setBusy','preparedFile','compressImage','blogRequest','appKey','z','assetSchema','token','setFile','setPreview','setTab','onInsert','onClose',code+';return upload;')(
 file,false,false,e=>errors.push(e),v=>states.push(v),prepared,async()=>{compressions++;return compressed;},async(...args)=>{calls.push(args);if(fail&&calls.length===1)throw new Error('Retry');return {asset:{media_type:file.type}};},'azeemlab',{object:()=>({})},{},{current:'same-token'},()=>{},()=>{},v=>tabs.push(v),v=>inserted.push(v),()=>closed++);
 return{upload,calls,errors,tabs,states,inserted,compressions:()=>compressions,closed:()=>closed};
}
test('editor uploads compressed image with matching filename/MIME and opens library',async()=>{
 const original=new File(['original'],'photo.jpg',{type:'image/jpeg'}),compressed=new File(['new'],'photo.webp',{type:'image/webp'});
 const state=setup(original,{compressed});await state.upload();
 assert.equal(state.calls[0][3].body,compressed);assert.equal(state.calls[0][3].headers['Content-Type'],'image/webp');assert.equal(state.calls[0][4].filename,'photo.webp');assert.deepEqual(state.tabs,['library']);assert.equal(state.closed(),0);assert.deepEqual(state.states,[true,false]);
});
test('retry reuses identical compressed bytes and token',async()=>{
 const file=new File(['original'],'photo.png',{type:'image/png'}),compressed=new File(['new'],'photo.webp',{type:'image/webp'});const state=setup(file,{compressed,fail:true});await state.upload();await state.upload();
 assert.equal(state.compressions(),1);assert.equal(state.calls[0][3].body,state.calls[1][3].body);assert.equal(state.calls[0][3].headers['Idempotency-Key'],state.calls[1][3].headers['Idempotency-Key']);assert.deepEqual(state.tabs,['library']);
});
test('image still over 10 MiB never uploads and releases busy state',async()=>{
 const file=new File([new Uint8Array(10*1024*1024+1)],'photo.webp',{type:'image/webp'});const state=setup(file);await state.upload();assert.equal(state.calls.length,0);assert.match(state.errors.at(-1),/10 MiB/);assert.deepEqual(state.states,[true,false]);
});
test('audio bypasses compression and retains direct insertion',async()=>{
 const file=new File(['audio'],'voice.mp3',{type:'audio/mp3'});const state=setup(file);await state.upload();assert.equal(state.compressions(),0);assert.equal(state.calls[0][3].body,file);assert.equal(state.calls[0][3].headers['Content-Type'],'audio/mpeg');assert.equal(state.inserted.length,1);assert.equal(state.closed(),1);
});
