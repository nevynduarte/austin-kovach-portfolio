"""Run once with the path to a checkout of the official VAST-AI-Research/TripoSR repo."""
from pathlib import Path
import sys
file=Path(sys.argv[1])/'tsr/models/isosurface.py'
text=file.read_text()
old='from torchmcubes import marching_cubes'
new='''from skimage.measure import marching_cubes as skimage_marching_cubes

def marching_cubes(volume, level):
    vertices, faces, _, _ = skimage_marching_cubes(volume.cpu().numpy(), level)
    return torch.from_numpy(vertices[:, [2, 1, 0]].copy()), torch.from_numpy(faces.copy().astype(np.int64))'''
if old not in text:
    raise SystemExit('Expected upstream import not found; adapter already applied or upstream changed.')
file.write_text(text.replace(old,new))
