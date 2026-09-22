"""Render original inference meshes without a graphics context; diagnostic only."""
from pathlib import Path
import sys
import numpy as np
import trimesh
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
root=Path(__file__).resolve().parents[1]
fig=plt.figure(figsize=(16,5))
for i,name in enumerate(['coffee','mobility','haven','wrench']):
    scene=trimesh.load(root/'reconstruction-work/assemblies'/f'{name}.glb') if '--assemblies' in sys.argv else trimesh.load(root/'public/models'/f'{name}-triposr.glb')
    mesh=scene.to_geometry()
    assert np.isfinite(mesh.vertices).all()
    assert len(mesh.faces)>0
    ax=fig.add_subplot(1,4,i+1,projection='3d')
    visual=mesh.visual.to_color() if hasattr(mesh.visual,'to_color') else mesh.visual
    colors=visual.vertex_colors[mesh.faces].mean(axis=1)/255
    ax.add_collection3d(Poly3DCollection(mesh.vertices[mesh.faces],facecolors=colors,edgecolors='none',rasterized=True))
    bounds=mesh.bounds;mid=bounds.mean(axis=0);r=(bounds[1]-bounds[0]).max()/2
    ax.set(xlim=(mid[0]-r,mid[0]+r),ylim=(mid[1]-r,mid[1]+r),zlim=(mid[2]-r,mid[2]+r),title=name)
    ax.set_box_aspect((1,1,1));ax.view_init(18,35,vertical_axis='y' if '--assemblies' in sys.argv else 'z');ax.set_axis_off()
    print(name,len(mesh.vertices),len(mesh.faces),'finite',flush=True)
fig.tight_layout();fig.savefig(root/'reconstruction-work'/('assembly-inspection.png' if '--assemblies' in sys.argv else 'mesh-inspection.png'),dpi=160)
