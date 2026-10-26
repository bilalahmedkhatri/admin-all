const {test,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const {compressImage}=require('../src/utils/compressImage.ts');
// Canvas/bitmap boundaries are mocked: these tests do not claim browser codec quality.
let previousDocument,previousBitmap,canvas,bitmap,draw,encoded,qualityUsed,decodes;
beforeEach(()=>{
 previousDocument=globalThis.document;previousBitmap=globalThis.createImageBitmap;
 decodes=0;draw=null;encoded=new Blob([new Uint8Array(120)],{type:'image/webp'});
 bitmap={width:4000,height:2000,closed:false,close(){this.closed=true;}};
 canvas={width:0,height:0,getContext(){return {drawImage(...args){draw=args;}};},toBlob(callback,type,quality){qualityUsed={type,quality};callback(encoded);}};
 globalThis.document={createElement(tag){assert.equal(tag,'canvas');return canvas;}};
 globalThis.createImageBitmap=async(file,options)=>{decodes++;assert.equal(options.imageOrientation,'from-image');return bitmap;};
});
afterEach(()=>{if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;if(previousBitmap===undefined)delete globalThis.createImageBitmap;else globalThis.createImageBitmap=previousBitmap;});
const file=(type='image/jpeg',size=1000)=>new File([new Uint8Array(size)],'photo.original.jpg',{type,lastModified:1234});

test('compression bounds dimensions, retains aspect ratio and returns the actual WebP File',async()=>{
 const original=file();const result=await compressImage(original);
 assert.equal(result.size,120);assert.equal(result.type,'image/webp');assert.equal(result.name,'photo.original.webp');assert.equal(result.lastModified,1234);
 assert.deepEqual(draw.slice(1),[0,0,1920,960]);assert.deepEqual(qualityUsed,{type:'image/webp',quality:0.82});
 assert.equal(bitmap.closed,true);assert.equal(canvas.width,0);assert.equal(canvas.height,0);
});
test('custom bounds handle portrait images without upscaling small images',async()=>{
 bitmap.width=100;bitmap.height=200;await compressImage(file(),{maxWidth:500,maxHeight:150,quality:0.7});
 assert.deepEqual(draw.slice(1),[0,0,75,150]);assert.equal(qualityUsed.quality,0.7);
 bitmap.width=60;bitmap.height=40;await compressImage(file(),{maxWidth:500,maxHeight:500});assert.deepEqual(draw.slice(1),[0,0,60,40]);
});
test('an equal or larger encoded image returns the exact original file',async()=>{
 const original=file();encoded=new Blob([new Uint8Array(1000)],{type:'image/webp'});
 assert.equal(await compressImage(original),original);assert.equal(bitmap.closed,true);
});
test('browser PNG fallback gets a matching MIME and filename',async()=>{
 encoded=new Blob([new Uint8Array(100)],{type:'image/png'});const result=await compressImage(file());assert.equal(result.name,'photo.original.png');assert.equal(result.type,'image/png');
});
test('rejects unsupported, empty and oversized input and invalid options before decoding',async()=>{
 await assert.rejects(compressImage(file('image/svg+xml')),/JPEG/);
 await assert.rejects(compressImage(file('image/png',0)),/nonempty/);
 await assert.rejects(compressImage(file('image/png',32*1024*1024+1)),/32 MiB/);
 for(const options of [{maxWidth:0},{maxHeight:4097},{quality:NaN},{quality:1.1}])await assert.rejects(compressImage(file(),options),/dimensions/);
 assert.equal(decodes,0);
});
test('animated APNG and WebP pass through without dropping animation frames',async()=>{
 const png=new Uint8Array(28);const view=new DataView(png.buffer);view.setUint32(0,0x89504e47);view.setUint32(4,0x0d0a1a0a);view.setUint32(8,8);png.set(Buffer.from('acTL'),12);
 const apng=new File([png],'animated.png',{type:'image/png'});assert.equal(await compressImage(apng),apng);
 const webp=Buffer.alloc(24);webp.write('RIFF');webp.writeUInt32LE(16,4);webp.write('WEBP',8);webp.write('ANIM',12);webp.writeUInt32LE(4,16);
 const animated=new File([webp],'animated.webp',{type:'image/webp'});assert.equal(await compressImage(animated),animated);assert.equal(decodes,0);
});
test('encoder/context failures release the decoded bitmap and canvas',async()=>{
 encoded=null;await assert.rejects(compressImage(file()),/could not be compressed/);assert.equal(bitmap.closed,true);assert.equal(canvas.width,0);
 bitmap.closed=false;canvas.getContext=()=>null;await assert.rejects(compressImage(file()),/canvas is unavailable/);assert.equal(bitmap.closed,true);
});
test('server-side invocation fails clearly without accessing browser APIs on import',async()=>{
 delete globalThis.document;delete globalThis.createImageBitmap;await assert.rejects(compressImage(file()),/requires a browser/);
});
