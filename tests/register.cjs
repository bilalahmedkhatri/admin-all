// Test-only TypeScript loader; production retains Next's server-only enforcement.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),resolve=Module._resolveFilename,load=Module._load;
Module._resolveFilename=function(request,parent,...rest){if(request.startsWith('@/'))request=path.join(root,'src',request.slice(2));return resolve.call(this,request,parent,...rest)};
Module._load=function(request,...rest){if(request==='server-only')return {};return load.call(this,request,...rest)};
require.extensions['.ts']=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file)};
