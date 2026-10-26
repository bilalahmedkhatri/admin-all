const {test}=require('node:test');
const assert=require('node:assert/strict');
const {getSchema}=require('@tiptap/core');
const StarterKit=require('@tiptap/starter-kit').default;
const {blogImage}=require('../src/components/blog/extensions/blogMedia.ts');
const {attributedImageContent,imageAttributionSchema,emptyAttribution}=require('../src/components/blog/imageAttribution.ts');
const asset={public_url:'https://media.test/photo.webp',media_type:'image/webp',original_filename:'photo.webp',alt_text:'A workflow diagram'};
test('image and linked attribution roundtrip through the official schema',()=>{
 const attribution={credit:'Jane / Example',sourceUrl:'https://example.com/photo',license:'CC BY 4.0',licenseUrl:'https://example.com/license'};
 const nodes=attributedImageContent({...asset,attribution});
 const schema=getSchema([StarterKit,blogImage]);
 const doc=schema.nodeFromJSON({type:'doc',content:nodes});
 doc.check();
 assert.equal(doc.child(0).attrs.alt,asset.alt_text);
 assert.equal(doc.child(1).textContent,'Image credit: Jane / Example · License: CC BY 4.0');
 assert.equal(doc.child(1).child(1).marks[0].attrs.href,attribution.sourceUrl);
 assert.equal(doc.child(1).lastChild.marks[0].attrs.href,attribution.licenseUrl);
 assert.equal(doc.toJSON().content.length,2);
});
test('optional attribution does not add empty paragraphs or alter other media',()=>{
 assert.equal(attributedImageContent(asset).length,1);
 assert.equal(attributedImageContent({...asset,attribution:emptyAttribution}).length,1);
 assert.equal(attributedImageContent({...asset,media_type:'audio/mpeg',attribution:{...emptyAttribution,credit:'Jane'}}).length,1);
});
test('unsafe links and unlabeled source/license links are rejected',()=>{
 for(const sourceUrl of ['javascript:alert(1)','data:text/html,x','https://user:pass@example.com/','invalid'])
 assert.equal(imageAttributionSchema.safeParse({...emptyAttribution,credit:'Jane',sourceUrl}).success,false);
 assert.equal(imageAttributionSchema.safeParse({...emptyAttribution,sourceUrl:'https://example.com'}).success,false);
 assert.equal(imageAttributionSchema.safeParse({...emptyAttribution,licenseUrl:'https://example.com'}).success,false);
 assert.equal(imageAttributionSchema.safeParse({...emptyAttribution,credit:'x'.repeat(201)}).success,false);
});

test('saved featured image details reload only for the matching cover asset',()=>{
 const {savedCoverDetails}=require('../src/components/blog/imageAttribution.ts');
 const details={alt_text:'Workflow diagram',attribution:{...emptyAttribution,credit:'Jane'}};
 assert.deepEqual(savedCoverDetails({cover_image:{asset_id:12,...details,url:'https://media.test/photo.webp'}},12),details);
 assert.equal(savedCoverDetails({cover_image:{asset_id:12,...details}},13),null);
 assert.equal(savedCoverDetails({},12),null);
 assert.equal(savedCoverDetails({cover_image:{asset_id:12,alt_text:42}},12),null);
});
