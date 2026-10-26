const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Schema}=require('@tiptap/pm/model');
const {EditorState,NodeSelection}=require('@tiptap/pm/state');
const {insertBlogMedia}=require('../src/components/blog/extensions/mediaExtensions.ts');
test('inserting media after a selected audio node retains existing content',()=>{
 const schema=new Schema({nodes:{doc:{content:'block+'},paragraph:{group:'block',content:'text*'},text:{group:'inline'},customAudio:{group:'block',atom:true,attrs:{asset_id:{},src:{}}},customImage:{group:'block',atom:true,attrs:{asset_id:{},src:{}}}}});
 const paragraph=schema.node('paragraph',null,schema.text('Keep this text'));
 const originalAudio=schema.node('customAudio',{asset_id:7,src:'https://media.test/original.wav'});
 const doc=schema.node('doc',null,[paragraph,originalAudio]);
 const editor={state:EditorState.create({doc,selection:NodeSelection.create(doc,paragraph.nodeSize)}),chain(){return {focus(){return this;},insertContentAt(position,node){editor.state=editor.state.apply(editor.state.tr.insert(position,schema.nodeFromJSON(node)));return this;},run(){return true;}}}};
 assert.equal(insertBlogMedia(editor,{type:'customImage',attrs:{asset_id:9,src:'https://media.test/new.png'}}),true);
 assert.equal(editor.state.doc.childCount,3);
 assert.equal(editor.state.doc.child(0).textContent,'Keep this text');
 assert.deepEqual(editor.state.doc.child(1).toJSON(),originalAudio.toJSON());
 assert.equal(editor.state.doc.child(2).attrs.asset_id,9);
});
test('YouTube embeds retain the origin-only referrer required by the player',()=>{
 const {CustomVideo}=require('../src/components/blog/extensions/mediaExtensions.ts');
 const output=CustomVideo.config.renderHTML({HTMLAttributes:{src:'https://www.youtube.com/embed/M7lc1UVf-VE',caption:''}});
 const findIframe=node=>Array.isArray(node)?node[0]==='iframe'?node:node.map(findIframe).find(Boolean):null;
 const iframe=findIframe(output);
 assert.equal(iframe[1].referrerpolicy,'strict-origin-when-cross-origin');
 assert.equal(iframe[1].src,'https://www.youtube.com/embed/M7lc1UVf-VE');
});
