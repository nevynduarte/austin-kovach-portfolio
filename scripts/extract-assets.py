"""Extract original PDF artwork, preserving source coordinates for reproducibility."""
import fitz, json
from pathlib import Path
from PIL import Image
import io
ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'public'/'downloads'/'Austin-Kovach-Portfolio.pdf'
doc=fitz.open(PDF)
out=ROOT/'public'/'images';out.mkdir(parents=True,exist_ok=True)
specs={
 'coffee-hero':(4,(0,90,1224,792)), 'coffee-final':(8,(0,90,1224,792)),
 'coffee-sketch':(6,(20,130,800,790)), 'coffee-exploded':(7,(25,0,540,790)),
 'mobility-hero':(9,(0,90,1224,792)), 'mobility-final':(13,(120,50,1130,780)),
 'mobility-sketch':(11,(85,120,1150,790)), 'mobility-detail':(12,(0,400,1130,790)),
 'haven-hero':(14,(0,90,1224,792)), 'haven-final':(17,(0,90,1224,790)),
 'haven-process':(16,(0,110,1224,790)), 'haven-exploded':(18,(0,350,1224,790)),
 'wrench-hero':(19,(0,90,1224,792)), 'wrench-final':(22,(20,100,1195,790)),
 'wrench-process':(21,(0,125,1200,790)), 'wrench-exploded':(23,(0,0,1224,425)),
 'portrait':(2,(25,30,280,400)), 'resume-page':(2,(0,0,1224,792))}
manifest={}
for name,(page,rect) in specs.items():
 pix=doc[page-1].get_pixmap(matrix=fitz.Matrix(1.6,1.6),clip=fitz.Rect(rect),alpha=False)
 im=Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
 im.save(out/f'{name}.webp','WEBP',quality=88)
 manifest[name]={'page':page,'crop':rect,'width':im.width,'height':im.height}
 thumb=im.copy();thumb.thumbnail((700,700));thumb.save(out/f'{name}-small.webp','WEBP',quality=82)
# Hero artwork uses exact embedded rasters, excluding PDF titles and overlays.
for name,page in [('coffee',4),('mobility',9),('haven',14),('wrench',19)]:
 info=next(i for i in doc[page-1].get_image_info(xrefs=True) if i['number']==0)
 x=doc.extract_image(info['xref']);im=Image.open(io.BytesIO(x['image'])).convert('RGB')
 im.save(out/f'{name}-hero.webp','WEBP',quality=88)
 manifest[name+'-hero']={'page':page,'xref':info['xref'],'width':im.width,'height':im.height}
 thumb=im.copy();thumb.thumbnail((700,700));thumb.save(out/f'{name}-hero-small.webp','WEBP',quality=82)
# Exact embedded rasters: these bypass PDF labels and clipping frames.
raw=ROOT/'reconstruction-work'/'inputs';raw.mkdir(parents=True,exist_ok=True)
for name,page,idx in [('coffee',3,2),('mobility',3,4),('haven',17,3),('wrench',3,3)]:
 info=next(i for i in doc[page-1].get_image_info(xrefs=True) if i['number']==idx)
 x=doc.extract_image(info['xref']); im=Image.open(io.BytesIO(x['image'])).convert('RGB')
 im.save(raw/f'{name}.png')
 manifest[name+'-raw']={'page':page,'image_index':idx,'xref':info['xref'],'width':im.width,'height':im.height}
(ROOT/'scripts'/'asset-provenance.json').write_text(json.dumps(manifest,indent=2))
(ROOT/'public'/'asset-sizes.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
