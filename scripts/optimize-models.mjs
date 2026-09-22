import fs from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,prune,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {recipes} from './model-recipes.mjs';
globalThis.FileReader=class{async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.();}async readAsDataURL(blob){this.result='data:application/octet-stream;base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onloadend?.();}};
await fs.mkdir('public/models',{recursive:true});await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const records=[];
for(const [id,build] of Object.entries(recipes)){
 const root=build();root.name=id;
 const binary=await new GLTFExporter().parseAsync(root,{binary:true});
 await fs.mkdir('reconstruction-work/assemblies',{recursive:true});
 await fs.writeFile(`reconstruction-work/assemblies/${id}.glb`,new Uint8Array(binary));
 const doc=await io.readBinary(new Uint8Array(binary));
 await doc.transform(dedup(),prune({keepLeaves:true}),meshopt({encoder:MeshoptEncoder,level:'medium'}));
 const dest=`public/models/${id}.glb`;await io.write(dest,doc);
 const nodes=doc.getRoot().listNodes().filter(n=>n.getExtras().part);
 if(nodes.length!==root.children.length)throw new Error('Component hierarchy lost: '+id);
 records.push({id,parts:nodes.map(n=>n.getName()),bytes:(await fs.stat(dest)).size,method:'Image-guided parametric component reconstruction',dimensionalAccuracy:'Not verified; relative units',sourcePages:{coffee:'3–8',mobility:'9–13',haven:'14–18',wrench:'19–23'}[id]});
 console.log(id,nodes.length,(await fs.stat(dest)).size);
}
await fs.writeFile('public/models/manifest.json',JSON.stringify(records,null,2));
