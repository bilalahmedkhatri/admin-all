const {test}=require('node:test');
const assert=require('node:assert/strict');
const fixture=require('./blog-backend-contract.json');
const {postListSchema,categoryListSchema,postSchema}=require('../src/lib/gateway/blog-client.ts');
test('editor parses actual isolated FastAPI list and saved-post responses',()=>{
 const posts=postListSchema.parse(fixture.posts);
 const categories=categoryListSchema.parse(fixture.categories);
 const post=postSchema.parse(fixture.saved.post);
 assert.equal(posts.items[0].id,post.id);
 assert.equal(categories.items[0].id,post.category_id);
 assert.equal(post.content_json.type,'doc');
 assert.equal(post.version,1);
 assert.equal(post.author_name,'Admin');
 assert.equal(postListSchema.safeParse({posts:[],total:0}).success,false);
 assert.equal(categoryListSchema.safeParse({categories:[],total:0}).success,false);
});
