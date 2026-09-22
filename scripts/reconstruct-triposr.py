"""Actual TripoSR CPU inference; outputs experimental whole-object meshes, not CAD."""
import os, sys, time, json
from pathlib import Path
import numpy as np
from PIL import Image
import cv2, torch
import rembg

ROOT=Path(__file__).resolve().parents[1]
RESEARCH=Path(os.environ.get('RECONSTRUCTION_ROOT',str(ROOT/'reconstruction-work'/'tools')))
sys.path.insert(0,str(RESEARCH/'TripoSR'))
from tsr.system import TSR
torch.set_num_threads(4)
inputs=ROOT/'reconstruction-work'/'inputs'
out=ROOT/'reconstruction-work'/'inference';out.mkdir(parents=True,exist_ok=True)
print('Loading TripoSR on CPU',flush=True)
model=TSR.from_pretrained(str(RESEARCH/'weights'),config_name='config.yaml',weight_name='model.ckpt')
model.eval();model.renderer.set_chunk_size(4096)
results=[]
session=rembg.new_session('u2netp',providers=['CPUExecutionProvider'])
for name in (sys.argv[1:] or ['coffee','mobility','haven','wrench']):
 start=time.time()
 im=np.asarray(Image.open(inputs/f'{name}.png').convert('RGB'))
 mask=np.min(im,axis=2)<235
 count,labels,stats,cent=cv2.connectedComponentsWithStats(mask.astype(np.uint8),8)
 if count>1:
  largest=1+np.argmax(stats[1:,cv2.CC_STAT_AREA]); x,y,w,h,_=stats[largest]
  im=im[y:y+h,x:x+w]
 p=rembg.remove(Image.fromarray(im),session=session);p.thumbnail((430,430))
 canvas=Image.new('RGB',(512,512),(128,128,128));canvas.paste(p,((512-p.width)//2,(512-p.height)//2),p.getchannel('A'))
 canvas.save(out/f'{name}-input.png')
 print('Inferring '+name,flush=True)
 with torch.inference_mode():
  codes=model([canvas],device='cpu')
  mesh=model.extract_mesh(codes,has_vertex_color=True,resolution=128)[0]
 mesh.export(out/f'{name}-triposr.glb')
 info={'name':name,'vertices':len(mesh.vertices),'faces':len(mesh.faces),'seconds':round(time.time()-start,2),'method':'TripoSR single-image CPU; skimage marching cubes; resolution 128','status':'experimental—not dimensionally verified'}
 results.append(info);print(json.dumps(info),flush=True)
 (out/'results.json').write_text(json.dumps(results,indent=2))
