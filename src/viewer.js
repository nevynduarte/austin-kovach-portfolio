import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';

export function createViewer(host,onSelect){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.outputColorSpace=T.SRGBColorSpace;
 host.append(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','3D product. Drag to rotate. Use arrow keys to rotate, plus and minus to zoom, Escape to clear selection.');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.01,100);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xffffff,0x718079,2));let key=new T.DirectionalLight(0xffffff,3);key.position.set(3,6,5);scene.add(key);
 const grid=new T.GridHelper(16,32,0x65716e,0x3d4644);grid.material.transparent=true;grid.material.opacity=.24;grid.position.y=-.02;scene.add(grid);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.1;controls.enablePan=false;controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI*.82;controls.autoRotateSpeed=.65;controls.zoomToCursor=false;
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);let root=null,parts=[],selected=null,amount=0,targetAmount=0,frame=0,active=true,visible=true,serial=0,fitRadius=5,targetPoint=new T.Vector3(),targetDistance=null,isolated=false,last=performance.now();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ray=new T.Raycaster(),mouse=new T.Vector2();
 function request(){if(!frame&&active&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
 function dispose(root){const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 function bounds(object){return new T.Box3().setFromObject(object);}
 function desiredDistance(box){const size=box.getSize(new T.Vector3());return Math.max(size.y,size.x/Math.max(.4,camera.aspect),size.z)*.5/Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.42;}
 function frameObject(object){const b=bounds(object);targetPoint.copy(b.getCenter(new T.Vector3()));targetDistance=Math.max(.25,desiredDistance(b));}
 function highlight(){root?.traverse(o=>{if(!o.isMesh)return;let part=o;while(part&&!part.userData.part)part=part.parent;let chosen=part===selected;o.visible=!isolated||!selected||chosen;if(o.material.emissive){o.material.emissive.copy(o.userData.originalEmissive||new T.Color(0));if(chosen)o.material.emissive.set('#4b6a42');o.material.emissiveIntensity=chosen?.32:(o.userData.originalIntensity||0);}});}
 function select(name){selected=parts.find(p=>p.name===name)||null;isolated=false;highlight();if(selected)frameObject(selected);else frameObject(root);onSelect(selected);request();}
 async function load(id,mode='assembly'){
  const token=++serial;const gltf=await loader.loadAsync(mode==='assembly'?`/models/${id}.glb`:`/models/${id}-triposr.glb`);if(token!==serial){dispose(gltf.scene);return [];}
  if(root){scene.remove(root);dispose(root);}root=gltf.scene;
  if(mode!=='assembly')root.rotation.x=-Math.PI/2;
  const b=bounds(root),s=b.getSize(new T.Vector3());if(mode!=='assembly'){root.scale.setScalar(2.7/Math.max(s.x,s.y,s.z));}
  const b2=bounds(root),center=b2.getCenter(new T.Vector3());root.position.set(-center.x,-b2.min.y,-center.z);
  scene.add(root);parts=[];root.traverse(o=>{if(o.userData.part){o.userData.base=o.position.clone();parts.push(o);}if(o.isMesh){o.material=o.material.clone();o.userData.originalEmissive=o.material.emissive?.clone();o.userData.originalIntensity=o.material.emissiveIntensity;}});
  selected=null;amount=0;targetAmount=0;controls.autoRotate=false;isolated=false;frameObject(root);fitRadius=targetDistance;controls.minDistance=.15;controls.maxDistance=fitRadius*3;
  controls.target.copy(targetPoint);camera.position.copy(targetPoint).add(new T.Vector3(1,.55,1.5).normalize().multiplyScalar(fitRadius));targetDistance=null;controls.update();request();return parts;
 }
 function tick(now){frame=0;const dt=Math.min(.05,(now-last)/1000);last=now;if(!active||!visible||document.hidden)return;let moving=false;
  if(root&&Math.abs(amount-targetAmount)>.0005){amount=reduced?targetAmount:T.MathUtils.damp(amount,targetAmount,9,dt);for(const p of parts){p.position.copy(p.userData.base);p.position.addScaledVector(new T.Vector3(...p.userData.explode),amount);}root.updateMatrixWorld(true);if(selected)frameObject(selected);else frameObject(root);moving=true;}
  if(targetDistance!==null){let current=camera.position.distanceTo(controls.target);const offset=camera.position.clone().sub(controls.target).normalize();let next=reduced?targetDistance:T.MathUtils.damp(current,targetDistance,8,dt);const old=controls.target.clone();controls.target.lerp(targetPoint,reduced?1:1-Math.exp(-8*dt));camera.position.copy(controls.target).addScaledVector(offset,next);moving=true;if(Math.abs(next-targetDistance)<.002&&old.distanceTo(targetPoint)<.002)targetDistance=null;}
  const changed=controls.update(dt);renderer.render(scene,camera);if(moving||changed||controls.autoRotate)request();
 }
 controls.addEventListener('change',request);controls.addEventListener('start',()=>{targetDistance=null;});
 let down=null;canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});canvas.addEventListener('pointerup',e=>{if(!root||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObject(root,true).find(h=>h.object.visible);if(hit){let p=hit.object;while(p&&!p.userData.part)p=p.parent;select(p?.name);}else select(null);down=null;});
 canvas.addEventListener('keydown',e=>{let v=camera.position.clone().sub(controls.target),s=new T.Spherical().setFromVector3(v),handled=true;if(e.key==='ArrowLeft')s.theta-=.12;else if(e.key==='ArrowRight')s.theta+=.12;else if(e.key==='ArrowUp')s.phi=Math.max(.1,s.phi-.1);else if(e.key==='ArrowDown')s.phi=Math.min(Math.PI*.8,s.phi+.1);else if(e.key==='+'||e.key==='=')s.radius*=.85;else if(e.key==='-')s.radius*=1.15;else if(e.key==='Escape'){select(null);return;}else handled=false;if(handled){e.preventDefault();targetDistance=null;camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(s));controls.update();request();}});
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(root)frameObject(selected||root);request();};new ResizeObserver(resize).observe(host);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;request();},{threshold:.02}).observe(host);document.addEventListener('visibilitychange',request);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;host.dispatchEvent(new CustomEvent('viewer-error',{bubbles:true}));});
 resize();return {load,select,explode(v){targetAmount=v;request();},reset(){controls.autoRotate=false;selected=null;isolated=false;highlight();targetAmount=0;frameObject(root);camera.position.copy(controls.target).add(new T.Vector3(1,.55,1.5).normalize().multiplyScalar(fitRadius));onSelect(null);request();},isolate(on){isolated=on;highlight();request();},spin(on){controls.autoRotate=on;request();},zoom(f){targetDistance=T.MathUtils.clamp(camera.position.distanceTo(controls.target)*f,controls.minDistance,controls.maxDistance);targetPoint.copy(controls.target);request();},pause(){active=false;},resume(){active=true;request();}};
}
