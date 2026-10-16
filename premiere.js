/* Chapter Four · The Premiere. The approved Blender cinema, exported as material-batched GLBs. */
import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {DRACOLoader} from './vendor/DRACOLoader.js';
(async () => {
const $=s=>document.querySelector(s), T=THREE, V=(x,y,z)=>new T.Vector3(x,y,z), canvas=$('#hall');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t), angDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches, finePointer=matchMedia('(hover: hover) and (pointer: fine)').matches;

// Veils, dialogs and captions fade like the earlier chapters: 1.6s out, 2.4s in.
function show(el){clearTimeout(el._t);el.hidden=false;void el.offsetWidth;el.classList.add('on');}
function hide(el,ms=1700){el.classList.remove('on');clearTimeout(el._t);el._t=setTimeout(()=>{if(!el.classList.contains('on'))el.hidden=true;},ms);}

const scene=new T.Scene();scene.background=new T.Color('#05070a');scene.fog=new T.FogExp2('#05070a',.012);
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){$('#openNote').textContent='This cinema needs WebGL. Please turn on hardware acceleration.';$('#openNote').hidden=false;$('#loadLabel').hidden=true;return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
const camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.08,110),clock=new T.Clock();
const floor=z=>Math.max(0,(z-8)*.105), START=V(0,floor(28)+1.65,28), pos=START.clone();let yaw=0,pitch=.025;
const mat=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const ink=mat('#11151c'),trim=mat('#625b49',.45,.5),white=mat('#a7a8a8');
const cold=new T.MeshBasicMaterial({color:'#bdc9da'});
function mesh(geo,m,x=0,y=0,z=0,parent=scene){const o=new T.Mesh(geo,m);o.position.set(x,y,z);parent.add(o);return o;}
function box(w,h,d,m,x,y,z,parent){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);}
function cyl(r1,r2,h,m,x,y,z,parent){return mesh(new T.CylinderGeometry(r1,r2,h,32),m,x,y,z,parent);}
const sphereGeo=new T.SphereGeometry(1,24,16);
function ball(rx,ry,rz,m,x,y,z,parent){const o=mesh(sphereGeo,m,x,y,z,parent);o.scale.set(rx,ry,rz);return o;}
// Lettering in the room uses the same serif small caps as the interface.
function textTexture(text,{w=512,h=128,size=64,spacing=14,color='#efe2c2',glow=null,bg=null}={}){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h);}g.font=`500 ${size}px "Cormorant Garamond", Georgia, serif`;try{g.letterSpacing=spacing+'px';}catch(e){}g.textAlign='center';g.textBaseline='middle';if(glow){g.shadowColor=glow;g.shadowBlur=size*.5;}g.fillStyle=color;g.fillText(text,w/2+spacing/2,h/2+size*.05);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=4;return tx;}
// A thin warm rim on every figure, like the silhouettes of Chapters One to Three.
function rim(m,k,pw=4){m.onBeforeCompile=s=>{s.uniforms.uRim={value:new T.Color('#e8d3a0').multiplyScalar(k)};s.fragmentShader='uniform vec3 uRim;\n'+s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float f=1.0-abs(dot(normalize(normal),normalize(vViewPosition)));totalEmissiveRadiance+=uRim*pow(f,'+pw.toFixed(1)+');}');};m.customProgramCacheKey=()=>'rim'+k+pw;m.needsUpdate=true;}

const filmCanvas=document.createElement('canvas');filmCanvas.width=1536;filmCanvas.height=768;const fg=filmCanvas.getContext('2d');
const filmTexture=new T.CanvasTexture(filmCanvas);filmTexture.colorSpace=T.SRGBColorSpace;
const screen=mesh(new T.PlaneGeometry(15.8,7.35),new T.MeshBasicMaterial({map:filmTexture}),0,6,.54);const SCREEN=V(0,6,.54);
const amb=new T.HemisphereLight('#8b9cbb','#080a0f',.22);scene.add(amb);
const screenLight=new T.PointLight('#c8d6f5',100,30,2);screenLight.position.set(0,7,2.6);scene.add(screenLight);
const rimLight=new T.DirectionalLight('#b3bfd2',.5);rimLight.position.set(-4,8,0);scene.add(rimLight);
const backlight=new T.DirectionalLight('#5e7497',.09);backlight.position.set(0,10,35);scene.add(backlight);
const house=new T.HemisphereLight('#ffffff','#657082',0);scene.add(house);
for(const s of [-1,1])for(let j=0;j<6;j++){const z=3.2+j*5.35,l=new T.PointLight('#e6cda3',12,5.5,2);l.position.set(s*9.5,5.6+floor(z)*.25,z);scene.add(l);}
// Q&A: one light finds the director, one finds the audience's microphone.
const dirSpot=new T.SpotLight('#f4ead6',0,30,.3,.75,1.2);dirSpot.position.set(0,14,.8);dirSpot.target.position.set(0,3,6.2);scene.add(dirSpot,dirSpot.target);
const MIC=V(-1.05,floor(22),22);
const micSpot=new T.SpotLight('#f4ead6',0,12,.22,.8,1.2);micSpot.position.set(MIC.x,MIC.y+6.5,MIC.z);micSpot.target.position.copy(MIC);scene.add(micSpot,micSpot.target);
const youLight=new T.PointLight('#f1e2c0',0,26,1.1);scene.add(youLight);
const micCone=mesh(new T.ConeGeometry(.8,6,40,1,true),new T.MeshBasicMaterial({color:'#f4ead6',transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),MIC.x,MIC.y+3,MIC.z);
const beam=mesh(new T.ConeGeometry(6,35,32,1,true),new T.MeshBasicMaterial({color:'#93a6c0',transparent:true,opacity:.009,side:T.DoubleSide,depthWrite:false}),0,6.8,18);beam.rotation.x=Math.PI/2;
const dustGeo=new T.BufferGeometry(),dustPositions=new Float32Array(360*3);for(let i=0;i<360;i++){dustPositions[i*3]=(Math.random()-.5)*15;dustPositions[i*3+1]=2+Math.random()*8;dustPositions[i*3+2]=Math.random()*35;}
dustGeo.setAttribute('position',new T.BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:'#d4d9e2',size:.018,transparent:true,opacity:.2,depthWrite:false}));scene.add(dust);

const director=new T.Group();director.position.set(0,.16,6.2);director.scale.setScalar(3);scene.add(director);
const headPivot=new T.Group();headPivot.position.y=1.18;director.add(headPivot);
const HEAD=V(0,0,0);const headWorld=()=>headPivot.getWorldPosition(V(0,0,0)).add(V(0,.12*director.scale.x,0));
// The chair and the figure are solid; nobody walks through him.
const chairHit=(x,z)=>{const s=director.scale.x;return Math.abs(x)<.42*s&&z>6.2-.66*s&&z<6.2+.38*s;};
const audience=[],audienceInstances=[];
for(let row=0;row<12;row++)for(const side of [-1,1])for(let col=0;col<8;col++){
 const x=side*(1.9+col*.99),z=9.8+row*1.85,y=floor(z)+.24;
 const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(1.06+Math.random()*.12);const head=new T.Group();head.position.y=1.18;g.add(head);
 const p={g,head,row,phase:Math.random()*6,phone:Math.random()<.10};audience.push(p);
 if(p.phone){const phone=box(.09,.15,.012,cold,x+.18,y+.95,z-.28);phone.rotation.x=-.6;p.phoneMesh=phone;}
}

// Interactive props. The hall, chairs and figures are the Blender assets.
const prog=box(.34,.018,.48,white,1.08,floor(24)+.85,24);prog.rotation.y=-.2;box(.4,.035,.55,ink,1.08,floor(24)+.82,24);box(.045,.8,.045,ink,1.08,floor(24)+.4,24);
cyl(.018,.025,1.5,white,MIC.x,MIC.y+.75,MIC.z);ball(.045,.09,.045,white,MIC.x,MIC.y+1.57,MIC.z);cyl(.18,.18,.025,ink,MIC.x,MIC.y+.02,MIC.z);
box(.12,.35,.22,ink,-9.97,3.3,18);box(.13,.15,.07,white,-9.9,3.3,18.1);
const plate=mesh(new T.PlaneGeometry(.74,.18),new T.MeshBasicMaterial({map:textTexture('HOUSE LIGHTS',{size:40,spacing:10,bg:'#16130e',color:'#d9c9a2'})}),-9.93,3.85,18);plate.rotation.y=Math.PI/2;
box(2,.06,.55,trim,2.7,4.4,35.2);
// Reel 01: the film of Chapter One, waiting on the shelf under a small lamp.
const REEL_Y=4.47,reel=new T.Group();reel.position.set(2.7,REEL_Y,35.2);scene.add(reel);
const alu=mat('#a9adb3',.32,.85),coil=mat('#1b140f',.55,.1);
for(const y of [-.03,.03])cyl(.34,.34,.008,alu,0,y,0,reel);cyl(.27,.27,.052,coil,0,0,0,reel);cyl(.055,.055,.07,alu,0,0,0,reel);
for(let i=0;i<3;i++){const a=i/3*Math.PI*2+.5;cyl(.075,.075,.072,ink,Math.cos(a)*.18,0,Math.sin(a)*.18,reel);}
const tag=mesh(new T.PlaneGeometry(.2,.06),new T.MeshBasicMaterial({map:textTexture('REEL 01',{size:46,spacing:8,color:'#2a241a',bg:'#e9dcc0'})}),0,.036,.24,reel);tag.rotation.x=-Math.PI/2;
const reelLamp=new T.PointLight('#f2dcae',5,3.2,1.8);reelLamp.position.set(2.7,5.6,35);scene.add(reelLamp);

// The way out is behind you, where you came in.
const EXIT_X=-4.4,exitAnchor=V(EXIT_X,4.9,35.4),exitDest=V(EXIT_X,0,34.5),door={leaves:[],open:0};
function buildExit(room){
 let wallZ=35.62,fy=floor(35.2);
 try{room.updateMatrixWorld(true);const rc=new T.Raycaster(V(EXIT_X,fy+1.4,31.5),V(0,0,1),0,8);const h=rc.intersectObject(room,true)[0];if(h)wallZ=h.point.z;rc.set(V(EXIT_X,fy+3,wallZ-.6),V(0,-1,0));const f=rc.intersectObject(room,true)[0];if(f)fy=f.point.y;}catch(e){}
 const g=new T.Group();g.position.set(EXIT_X,fy,wallZ-.012);scene.add(g);
 door.lobby=mesh(new T.PlaneGeometry(1.66,2.5),new T.MeshBasicMaterial({color:'#f3e2bb',toneMapped:false,transparent:true,opacity:.05,side:T.DoubleSide}),0,1.25,-.004,g);
 const frameM=mat('#1a1712',.6,.3);box(1.96,.1,.12,frameM,0,2.6,-.05,g);box(.1,2.6,.12,frameM,-.93,1.3,-.05,g);box(.1,2.6,.12,frameM,.93,1.3,-.05,g);
 const leafM=mat('#151925',.75,0);
 for(const s of [-1,1]){const pivot=new T.Group();pivot.position.set(s*.83,0,-.04);g.add(pivot);box(.82,2.5,.05,leafM,-s*.41,1.25,0,pivot);box(.56,.035,.035,trim,-s*.41,1.15,-.05,pivot);door.leaves.push({pivot,s});}
 door.slit=mesh(new T.PlaneGeometry(1.62,.035),new T.MeshBasicMaterial({color:'#f6e3b4',toneMapped:false,side:T.DoubleSide}),0,.018,-.075,g);
 mesh(new T.PlaneGeometry(.8,.2),new T.MeshBasicMaterial({map:textTexture('EXIT',{size:76,spacing:24,color:'#efe2c2',glow:'rgba(240,217,164,.6)'}),transparent:true,toneMapped:false}),0,2.95,-.06,g).rotation.y=Math.PI;const lamp=new T.PointLight('#f2dcae',4,4.5,1.6);lamp.position.set(0,3.1,-.6);g.add(lamp);
 door.light=new T.PointLight('#f3dfb4',0,10,1.4);door.light.position.set(0,1.6,-.9);g.add(door.light);
 door.wallZ=wallZ;exitAnchor.set(EXIT_X,fy+2.2,wallZ-.2);exitDest.set(EXIT_X,0,Math.min(34.6,wallZ-1.1));
}
function setDoor(k){door.open=k;for(const l of door.leaves)l.pivot.rotation.y=-l.s*1.25*ease(k);if(door.lobby){door.lobby.material.opacity=.05+.95*ease(k);door.light.intensity=70*ease(k);}}

// The "DIRECTOR" lettering on the chair back is part of the bronze batch; split it out and let it glow faintly.
let letterGlow=null;
function glowLetters(model){model.traverse(o=>{if(!o.isMesh||!/bronze/.test(o.material.name)||letterGlow)return;const geo=o.geometry,p=geo.attributes.position,idx=geo.index;if(!idx)return;const keep=[],text=[],bx=new T.Box3(),v=new T.Vector3();
 for(let t=0;t<idx.count;t+=3){let cy=0,cz=0;for(let k=0;k<3;k++){cy+=p.getY(idx.getX(t+k));cz+=p.getZ(idx.getX(t+k));}cy/=3;cz/=3;const tri=[idx.getX(t),idx.getX(t+1),idx.getX(t+2)];if(cz<-.26&&cy>.95&&cy<1.05){text.push(...tri);for(const i of tri)bx.expandByPoint(v.fromBufferAttribute(p,i));}else keep.push(...tri);}
 if(!text.length)return;geo.setIndex(keep);const tg=geo.clone();tg.setIndex(text);
 letterGlow=new T.MeshStandardMaterial({color:'#d9c391',roughness:.35,metalness:.2,emissive:'#f0d9a4',emissiveIntensity:.75});const m=new T.Mesh(tg,letterGlow);m.position.copy(o.position);m.quaternion.copy(o.quaternion);m.scale.copy(o.scale);o.parent.add(m);
 const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(128,32,0,128,32,128);r.addColorStop(0,'rgba(240,217,164,.55)');r.addColorStop(.45,'rgba(240,217,164,.16)');r.addColorStop(1,'rgba(240,217,164,0)');g.setTransform(1,0,0,.25,0,24);g.fillStyle=r;g.fillRect(0,0,256,256);
 const size=bx.getSize(new T.Vector3()),ctr=bx.getCenter(new T.Vector3());mesh(new T.PlaneGeometry(size.x*1.9,size.y*3.2),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),ctr.x,ctr.y,bx.min.z-.006,m);});}

let loaded=false;
const draco=new DRACOLoader();draco.setDecoderPath('vendor/draco/');draco.setWorkerLimit(2);
const loader=new GLTFLoader();loader.setDRACOLoader(draco);
function prep(model){model.updateMatrixWorld(true);const parts=[];model.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);o.geometry.computeBoundingSphere();o.material.side=T.FrontSide;for(const k of ['map','normalMap','roughnessMap'])if(o.material[k])o.material[k].anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());parts.push(o);}});return parts;}
async function loadRoom(){
 try{
  try{await document.fonts.load('500 64px "Cormorant Garamond"');}catch(e){}
  const names=['cinema',innerWidth<700?'seat-mobile':'seat','director-body','director-head','audience-body'];let done=0;
  // The models travel as base64 text (the host serves no .glb); decode them back to the original binary.
  const glb=n=>fetch('assets/'+n+'.glb.txt').then(r=>{if(!r.ok)throw new Error(n+' '+r.status);return r.text();}).then(s=>{const bin=atob(s.trim()),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return loader.parseAsync(u.buffer,'');});
  const models=await Promise.all(names.map(n=>glb(n).then(r=>{done++;$('#loadFill').style.width=(done/5*100)+'%';return r.scene;})));
  const room=models[0];room.rotation.y=Math.PI;scene.add(room);
  room.traverse(o=>{if(o.isMesh){for(const k of ['map','normalMap','roughnessMap'])if(o.material[k])o.material[k].anisotropy=4;if(o.material.name.includes('opal'))o.material.emissiveIntensity=.25;}});
  buildExit(room);
  const dummy=new T.Object3D();
  for(const p of prep(models[1])){const inst=new T.InstancedMesh(p.geometry,p.material,192);audience.forEach((a,i)=>{dummy.position.set(a.g.position.x,floor(a.g.position.z)+.14,a.g.position.z);dummy.rotation.set(0,Math.PI,0);dummy.scale.setScalar(1);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.instanceMatrix.needsUpdate=true;scene.add(inst);}
  glowLetters(models[2]);models[2].rotation.y=Math.PI;director.add(models[2]);models[3].rotation.y=Math.PI;models[3].position.y=-1.18;headPivot.add(models[3]);
  director.traverse(o=>{if(o.isMesh&&o.material!==letterGlow&&!o.material.transparent)rim(o.material,.22,4.5);});
  for(const part of prep(models[4])){const k=4;const geo=part.geometry.clone();geo.applyMatrix4(new T.Matrix4().makeRotationY(Math.PI));const m=part.material.clone();if(/skin/.test(m.name)){m.map=null;m.color.set('#4e4a45');}else m.color.multiplyScalar(.55);m.roughness=.9;rim(m,.4,3.2);const inst=new T.InstancedMesh(geo,m,192);inst.instanceMatrix.setUsage(T.DynamicDrawUsage);inst.frustumCulled=false;scene.add(inst);audienceInstances.push({inst,head:false});}
  // Heads are drawn here: a simple head and neck reads better as a silhouette than the decimated scan.
  const skin=new T.MeshStandardMaterial({color:'#4e4a45',roughness:.85});rim(skin,.4,3.2);const headGeo=new T.SphereGeometry(1,20,14);headGeo.scale(.082,.108,.096);headGeo.translate(0,.14,-.005);const neckGeo=new T.CylinderGeometry(.042,.05,.12,12);neckGeo.translate(0,.03,0);
  for(const geo of [headGeo,neckGeo]){const inst=new T.InstancedMesh(geo,skin,192);inst.instanceMatrix.setUsage(T.DynamicDrawUsage);inst.frustumCulled=false;scene.add(inst);audienceInstances.push({inst,head:true});}
  updateAudience();loaded=true;document.body.dataset.loaded='true';draco.dispose();setTimeout(start,400);
 }catch(e){$('#openNote').textContent='The cinema could not load. Check your connection and reload.';$('#openNote').hidden=false;$('#loadLabel').hidden=true;$('#reload').hidden=false;$('#reload').onclick=()=>location.reload();document.body.dataset.loadError=String(e);}
}
function updateAudience(){for(const p of audience)p.g.updateMatrixWorld(true);for(const {inst,head}of audienceInstances){audience.forEach((p,i)=>inst.setMatrixAt(i,(head?p.head:p.g).matrixWorld));inst.instanceMatrix.needsUpdate=true;}}

// Labels appear only for what you are looking at, close enough to reach and not hidden behind him.
const objects=[];
function hotspot(id,text,anchor,dest,act,opt={}){const b=document.createElement('button');b.type='button';const s=document.createElement('span');s.textContent=text;b.append(s);b.dataset.object=id;b.tabIndex=-1;$('#places').append(b);const o={id,text,anchor:typeof anchor==='function'?anchor:()=>anchor,dest,act,b,alpha:0,range:16,...opt};objects.push(o);b.addEventListener('click',e=>{e.preventDefault();lastInput=activeTime;approach(o);});return o;}
const dirAnchor=V(0,0,0);
hotspot('director','The director',()=>dirAnchor.set(0,.16+.5*director.scale.x,6.2+.42*director.scale.x),null,()=>confront(true),{range:30});
hotspot('programme','Programme',V(1.08,floor(24)+1.2,24),V(.4,0,25),openProgramme);
hotspot('mic','Microphone',V(MIC.x,MIC.y+1.95,MIC.z),V(-.6,0,23.6),microphone,{enabled:()=>qa,range:22});
hotspot('lights','House lights',V(-9.8,3.9,18),V(-9.6,0,18),lights);
hotspot('booth','Reel 01',V(2.7,4.95,35.2),V(2.2,0,34.5),booth);
hotspot('exit','Exit',()=>exitAnchor,()=>exitDest,beginExit,{range:20});

// Sound is unlocked by Enter, and every load/play failure is deliberately silent.
const transientAudio=new Set();let audioContext,muted=false,unlocked=false,chatterVol=.36,fade=null;const sounds={};
const soundFiles={director:'laugh_director.mp3',crowdA:'laugh_crowd_a.mp3',crowdB:'laugh_crowd_b.mp3',genius:'genius.mp3',masterpiece:'masterpiece.mp3',wonderful:'wonderful.mp3'};
for(const [name,file] of Object.entries(soundFiles)){const a=new Audio('sfx/'+file);a.preload='none';a.volume=a._base=.5;a.addEventListener('error',()=>{});sounds[name]=a;}
// The room's chatter: two plain <audio> players of the mp3 take turns, crossfading over 0.35s near the end,
// so the mp3's built-in silence at its start and end is never heard (a single looped <audio> stutters there).
function makeLoop(url){const a=[new Audio(url),new Audio(url)];a.forEach(x=>{x.preload='auto';x.addEventListener('error',()=>{});});
 const o={a,cur:0,paused:true,xf:0,t0:0,_v:chatterVol,_base:chatterVol,
  get volume(){return this._v;},set volume(v){this._v=v;if(!this.xf)this.a[this.cur].volume=clamp(v,0,1);},
  get currentTime(){return this.a[this.cur].currentTime;},set currentTime(v){this.a.forEach(x=>{try{x.currentTime=v;}catch(e){}});},
  play(){this.paused=false;const A=this.a[this.cur];A.volume=clamp(this._v,0,1);return A.play();},
  pause(){this.paused=true;this.xf=0;this.a.forEach(x=>x.pause());},
  tick(){if(this.paused)return;const A=this.a[this.cur],B=this.a[1-this.cur],d=A.duration;
   if(!this.xf&&d&&A.currentTime>d-.45){B.currentTime=.06;B.volume=0;B.play().catch(()=>{});this.xf=1;this.t0=performance.now();}
   if(this.xf){const k=Math.min(1,(performance.now()-this.t0)/350),v=clamp(this._v,0,1);A.volume=v*(1-k);B.volume=v*k;if(k>=1){A.pause();this.cur=1-this.cur;this.xf=0;}}}};
 // if a frame was missed and a player runs out, hand over at once
 a.forEach(x=>x.addEventListener('ended',()=>{if(o.paused||x!==o.a[o.cur])return;o.xf=0;o.cur=1-o.cur;const B=o.a[o.cur];B.currentTime=.06;B.volume=clamp(o._v,0,1);B.play().catch(()=>{});}));
 return o;}
sounds.chatter=makeLoop('sfx/chatter.mp3');
function unlock(){unlocked=true;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});}catch(e){} if(!muted)play('chatter');}
function play(name,volume){const a=sounds[name];if(!a||muted||!unlocked)return;if(name==='chatter')volume=chatterVol;if(volume!==undefined)a.volume=a._base=clamp(volume,0,1);if(name!=='chatter')a.currentTime=0;a.play().catch(()=>{});}
function silence(){fade=null;transientAudio.forEach(s=>{try{s.stop();}catch(e){}});transientAudio.clear();Object.values(sounds).forEach(a=>{a.pause();a.currentTime=0;});}
function tone(freq=.1,duration=.08,volume=.02){if(!audioContext||muted)return;try{const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sawtooth';o.frequency.value=freq;g.gain.setValueAtTime(volume,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch(e){}}
function noise(seconds,shape,gain,filterType,freq){if(!audioContext||muted||!unlocked)return;const n=Math.floor(audioContext.sampleRate*seconds),b=audioContext.createBuffer(1,n,audioContext.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*shape(i/n,i)*gain;const s=audioContext.createBufferSource();s.buffer=b;let out=s;if(filterType){const f=audioContext.createBiquadFilter();f.type=filterType;f.frequency.value=freq;f.Q.value=.7;s.connect(f);out=f;}out.connect(audioContext.destination);transientAudio.add(s);s.onended=()=>transientAudio.delete(s);s.start();}
const applause=()=>noise(2.4,(u,i)=>Math.pow(Math.sin(i*.00031),12)*(1-u),.15);
const gasp=()=>noise(.55,u=>Math.sin(Math.PI*u),.055,'bandpass',730);
const doorSound=()=>noise(1.1,u=>Math.pow(1-u,3),.05,'lowpass',380);

// Captions queue, so nothing is said over anything else.
let subs=[],curSub=null,subGap=0,subtitleText='';
function say(text,sec=5,cls='',onStart){subs.push({text,sec,cls,onStart});}
function clearSubs(){subs=[];curSub=null;subtitleText='';$('#subtitle').classList.remove('on');}
function updateSubs(){const el=$('#subtitle');if(curSub&&activeTime>curSub.until){curSub=null;subtitleText='';el.classList.remove('on');subGap=activeTime+.9;}
 if(!curSub&&subs.length&&activeTime>=subGap){curSub=subs.shift();curSub.until=activeTime+curSub.sec;subtitleText=curSub.text;el.className=curSub.cls;el.textContent=curSub.text;void el.offsetWidth;el.classList.add('on');curSub.onStart?.();}}

// ---------- The microphone: the five words, in the flat cinema of the earlier chapters; then back to this room ----------
// The words live in their own page (interlude.html), laid over this one; the 3D hall waits underneath, unloaded and silent.
let M={phase:null,returnAt:null},micRun=0;
const interlude=$('#interlude'),black=$('#black');
function blackTo(on,ms=1000){black.style.transitionDuration=ms+'ms';black.classList.toggle('on',on);return new Promise(r=>setTimeout(r,ms));}
async function enterInterlude(){const run=++micRun;M={phase:'in',returnAt:null};await blackTo(true);if(run!==micRun)return;
  interlude.hidden=false;await new Promise(r=>{interlude.onload=r;interlude.src='interlude.html';});if(run!==micRun)return;
  try{interlude.contentWindow.postMessage({type:'sound',on:!muted},'*');}catch(e){}
  M.phase='words';interlude.focus();await blackTo(false,1400);}
async function leaveInterlude(){const run=micRun;if(M.phase!=='words')return;M.phase='out';await blackTo(true,1200);if(run!==micRun)return;
  interlude.hidden=true;interlude.removeAttribute('src');M.returnAt=modeTime;M.phase='room';roomTone(true);await blackTo(false,1400);}
function resetInterlude(){micRun++;M={phase:null,returnAt:null};interlude.hidden=true;interlude.removeAttribute('src');black.style.transitionDuration='300ms';black.classList.remove('on');roomTone(false);}
addEventListener('message',e=>{if(e.source===interlude.contentWindow&&e.data&&e.data.type==='interlude-done'&&state==='mic')leaveInterlude();});
// back in the hall: no chatter, only its own quiet, as in the earlier chapters (low room tone, a faint mains hum)
let quiet=null;
function roomTone(on){if(!on){if(quiet&&audioContext){const q=quiet;q.g.gain.setTargetAtTime(0,audioContext.currentTime,.25);setTimeout(()=>q.nodes.forEach(n=>{try{n.stop();}catch(e){}}),1500);}quiet=null;return;}
  if(quiet||muted||!audioContext)return;const c=audioContext,g=c.createGain();g.gain.value=0;g.connect(c.destination);g.gain.setTargetAtTime(.3,c.currentTime,.8);
  const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.2;}
  const s=c.createBufferSource();s.buffer=b;s.loop=true;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=340;s.connect(lp).connect(g);s.start();
  const o=c.createOscillator(),og=c.createGain();o.frequency.value=50;og.gain.value=.014;o.connect(og).connect(g);o.start();quiet={g,nodes:[s,o]};}
// his screen afterwards: empty, lit by the projector, nothing on it
function paintMicScreen(){const w=1536,h=768,g=fg.createRadialGradient(w*.5,h*.55,0,w*.5,h*.55,w*.64);g.addColorStop(0,'#e4dbc2');g.addColorStop(.5,'#a99e84');g.addColorStop(1,'#463f31');fg.fillStyle=g;fg.fillRect(0,0,w,h);
  fg.fillStyle='rgba(0,0,0,.54)';fg.fillRect(0,0,w,h);const vg=fg.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,w*.62);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');fg.fillStyle=vg;fg.fillRect(0,0,w,h);}
const micLines=['Nothing is profound by default.','Boredom is not a cinematic achievement.',"Audiences' time should not be wasted on filmmakers' arrogance.",'A film should be able to show us what it creates.','The canon should be questioned by audiences.'];
const QA=[[29,'— Maestro, what are we looking at?','“I don’t make images.”'],[46,'— Is the darkness a metaphor?','“The black is the film. If you need to see something, you were never its audience.”'],[76,'— Could you say something about the ending?','“I never explain. Explaining is for people with nothing to say.”']];
const endingCopy={stay:['The film continues','He never looked at you.',micLines[2]],lights:['The house lights','It only looked profound in the dark.',micLines[1]],booth:['Reel 01','For the first time tonight, the screen showed something.',micLines[3]],mic:['The audience','Nobody was looking at him anymore.',''],exit:['Outside','Cut.','']};
let state='opening',elapsed=0,modeTime=0,activeTime=0,lastLaugh=-10,lastPraise=-5,programmeText='',appropriated=false,qa=false,qaTime=0,qaStep=0,confrontTime=-20,confrontLaughed=true,lightLevel=0,screenLine=-1,transition=null,endingKind='',endingElapsed=0,creditAuto=true,lastInput=0,camTurn=null,lastGaspCycle=-1,spot=0;
const keys=new Set();let target=null,drag=null,heldStep=0;

// The camera turns by itself only after something you chose to do, and gently.
function turnTo(getPoint,sec=2.4){camTurn={getPoint,until:activeTime+sec};aimX=aimY=0;}
const FZ=8.7,BZ=31.5,zoneOf=z=>z<=8.8?'F':z>=31.3?'B':'R',laneOf=x=>Math.abs(x)<=1.2?0:Math.abs(x)>=9.2?Math.sign(x)*9.6:0;
function route(dest){const w=[],P=(x,z)=>w.push(V(x,0,z)),zs=zoneOf(pos.z),zd=zoneOf(dest.z),s=director.scale.x;
 if(zs==='F'&&zd!=='F'){let x=pos.x;if(Math.abs(x)<.42*s+1&&pos.z<6.2+.4*s){x=(x>=0?1:-1)*(.42*s+1.1);P(x,pos.z);}P(x,FZ);}
 if(zs==='R'){const lx=laneOf(pos.x);if(!(zd==='R'&&laneOf(dest.x)===lx)){const endZ=zd==='F'?FZ:zd==='B'?BZ:(Math.abs(pos.z-FZ)+Math.abs(dest.z-FZ)<Math.abs(pos.z-BZ)+Math.abs(dest.z-BZ)?FZ:BZ);P(lx,endZ);if(zd==='R')P(laneOf(dest.x),endZ);else P(dest.x,endZ);}}
 else if(zs!==zd){const from=zs==='F'?FZ:BZ;if(zd==='R'){P(laneOf(dest.x),from);}else{P(0,from);P(0,zd==='F'?FZ:BZ);P(dest.x,zd==='F'?FZ:BZ);}}
 w.push(V(dest.x,0,dest.z));return w;}
function approach(o){if(state!=='playing'||(o.enabled&&!o.enabled()))return;keys.clear();camTurn=null;let w;
 if(o.id==='director'){const s=director.scale.x,side=pos.x>=0?1:-1;w=route(V(side*(.42*s+1.1),0,6.2-.5*s));}
 else w=route(typeof o.dest==='function'?o.dest():o.dest);
 target={o,waypoints:w,check:activeTime,from:pos.clone()};}

let startTimer=0;
function start(){clearTimeout(startTimer);if(!loaded)return;state='playing';elapsed=activeTime=modeTime=0;lastInput=0;hide($('#opening'));unlock();say('— A masterpiece. Before it has even begun.',4.5,'q');}
function restart(){silence();clearSubs();state='opening';elapsed=modeTime=activeTime=0;lastLaugh=-10;lastPraise=-5;programmeText='';appropriated=qa=false;qaStep=0;spot=0;confrontTime=-20;confrontLaughed=true;lightLevel=0;screenLine=-1;transition=null;target=null;camTurn=null;keys.clear();heldStep=0;lastInput=0;chatterVol=.36;
 pos.copy(START);yaw=0;pitch=.025;lookX=lookY=aimX=aimY=0;director.scale.setScalar(3);headPivot.rotation.set(0,0,0);reel.position.y=REEL_Y;reel.scale.setScalar(1);reel.visible=true;setDoor(0);canvas.style.opacity=1;micSpot.intensity=0;dirSpot.intensity=0;
 audience.forEach(p=>{p.g.rotation.set(0,0,0);p.head.rotation.set(0,0,0);});
 for(const id of ['ending','credits'])hide($('#'+id),10);resetInterlude();if($('#programme').open)$('#programme').close();$('#programme textarea').value='';$('#loadLabel').hidden=true;$('#loadbar').hidden=true;show($('#opening'));clearTimeout(startTimer);startTimer=setTimeout(start,1200);}
function confront(explicit){if(state!=='playing')return;confrontTime=activeTime;confrontLaughed=false;if(explicit)turnTo(headWorld,3.2);}
function openProgramme(){if(state!=='playing')return;const d=$('#programme');keys.clear();d.showModal();requestAnimationFrame(()=>d.classList.add('on'));}
function lights(){if(state!=='playing')return;state='lights';modeTime=0;target=null;silence();clearSubs();}
function booth(){if(state!=='playing')return;state='booth';modeTime=0;target=null;silence();clearSubs();tone(55,.4,.03);}
function microphone(){if(state!=='playing'||!qa)return;state='mic';modeTime=0;target=null;keys.clear();silence();clearSubs();resetInterlude();turnTo(()=>SCREEN,2);enterInterlude();}
function beginExit(){if(state!=='playing')return;state='exit';modeTime=0;target=null;clearSubs();doorSound();play('director',.55);setTimeout(()=>play(Math.random()<.5?'crowdA':'crowdB',.45),700);fade={t0:activeTime+1.2,dur:6};turnTo(()=>V(EXIT_X,pos.y,40),1.2);}
function showEnding(kind){endingElapsed=elapsed;endingKind=kind;state='ending';target=null;camTurn=null;keys.clear();resetInterlude();if(kind!=='exit')silence();clearSubs();
 $('#endlabel').textContent=endingCopy[kind][0];$('#endfirst').textContent=endingCopy[kind][1];$('#endsecond').textContent=endingCopy[kind][2];$('#endsecond').hidden=!endingCopy[kind][2];
 show($('#ending'));setTimeout(()=>{if(state==='ending')$('#read').focus({preventScroll:true});},1200);}
$('#restart').onclick=restart;
// Arriving from Chapter Three there may be no click on this page yet; the first touch or key brings the sound in.
const wake=()=>{if(audioContext&&audioContext.state==='suspended')audioContext.resume().catch(()=>{});if(state==='playing'&&!muted&&sounds.chatter.paused)unlock();};addEventListener('pointerdown',wake);addEventListener('keydown',wake);
$('#again').onclick=restart;
$('#sound').onclick=()=>{muted=!muted;$('#sound').textContent=muted?'Sound off':'Sound on';$('#sound').setAttribute('aria-pressed',String(!muted));if(muted)silence();else if(['playing'].includes(state))unlock();try{interlude.contentWindow&&interlude.contentWindow.postMessage({type:'sound',on:!muted},'*');}catch(e){}if(muted)roomTone(false);else if(M.phase==='room')roomTone(true);};
const progForm=$('#programme form');
progForm.addEventListener('submit',e=>{e.preventDefault();const v=e.submitter?.value||'cancel',d=$('#programme');d.classList.remove('on');setTimeout(()=>d.close(v),700);});
$('#programme').addEventListener('close',()=>{const d=$('#programme');d.classList.remove('on');if(d.returnValue==='write'){const val=d.querySelector('textarea').value.trim();if(val){programmeText=val;appropriated=false;transition={at:activeTime+7};say('Your words stay in the programme.',3.4,'caps');}}});
$('#turn').onclick=()=>{if(!canMove())return;target=null;const b=V(pos.x+Math.sin(yaw+lookX)*10,pos.y,pos.z+Math.cos(yaw+lookX)*10);turnTo(()=>b,1.6);};

// The credits roll by themselves, like the end of a film; the viewer only watches. The roll stops on the names.
const credits=['Nothing is profound by default.','Ambiguity is not automatically complexity.','Discomfort is not automatically meaningful.',"Boredom is not a cinematic achievement. Audiences’ time should not be wasted on filmmakers’ arrogance.",'A film does not owe its audience an explanation, nor does its audience owe it admiration.','But if it refuses understanding, it must create something in its place.','A pause must create tension, anticipation, unease — something.','An ambiguity must open possibilities, not merely withhold answers.','Confusion without consequence is just confusion.','The fact that something invites interpretation does not make it profound. Audiences should not get used to inventing depth to justify their own patience.','Criticism can reveal meaning. It can also manufacture it.','A film should enter the canon because of what it creates on screen, not simply because the canon has decided that it matters.','The canon should be questioned by audiences, not treated as proof that a film deserves to be admired.','A film should not need its canonical status or cultural prestige to defend itself. It should be able to show us what it creates.'];
for(const line of credits){const p=document.createElement('p');p.textContent=line;$('#credits article').append(p);}
const by=document.createElement('p');by.className='by';by.textContent='Project made by: Sofia, David, Blake, Tnier, Lexie';$('#credits article').append(by);
let creditY=0;const CREDIT_SPEED=42;
$('#read').onclick=()=>{creditY=innerHeight;creditAuto=true;$('#credits article').style.transform=`translate3d(0,${creditY}px,0)`;show($('#credits'));};
$('#closecredits').onclick=endCredits;
// the roll runs all the way up and off; the moment the screen is empty, the ending page is back
function endCredits(){const el=$('#credits');creditAuto=false;clearTimeout(el._t);el.classList.remove('on');el.hidden=true;$('#read').focus({preventScroll:true});}
function rollCredits(dt){const art=$('#credits article');if(creditAuto){creditY-=dt*CREDIT_SPEED;if(creditY+art.offsetHeight<innerHeight*.12){endCredits();return;}}art.style.transform=`translate3d(0,${creditY}px,0)`;}

// Movement remains available during all in-room sequences. No pointer lock.
function canMove(){return ['playing','lights','booth'].includes(state)&&!$('#programme').open;}
const touched=()=>{lastInput=activeTime;};
addEventListener('keydown',e=>{touched();if(e.target instanceof Element&&e.target.matches('textarea,input'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(canMove()&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){keys.add(e.key.toLowerCase());target=null;camTurn=null;}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();heldStep=0;drag=null;});
addEventListener('wheel',touched,{passive:true});addEventListener('touchstart',touched,{passive:true});
// Desktop: the mouse position steers the view directly (no button held). Near the left/right edge the view keeps turning.
let lookX=0,lookY=0,aimX=0,aimY=0,mouseNX=0,mouseOver=false;
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;if(Math.abs(e.movementX)+Math.abs(e.movementY)>1)touched();mouseOver=e.target===canvas;if(!mouseOver||camTurn||!(canMove()||state==='mic'))return;mouseNX=e.clientX/innerWidth*2-1;const ny=e.clientY/innerHeight*2-1;aimX=-mouseNX*.07;aimY=-ny*.045;});
document.addEventListener('mouseleave',()=>{mouseOver=false;});
if(finePointer)$('#hint').textContent='Drag to look around · WASD to walk · Click what you see';
function mouseLook(dt){if((!canMove()&&state!=='mic')||camTurn){aimX=aimY=0;}const k=Math.min(1,dt*5);lookX+=(aimX-lookX)*k;lookY+=(aimY-lookY)*k;}
canvas.addEventListener('pointerdown',e=>{touched();if(!canMove())return;target=null;camTurn=null;drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.0036;pitch=clamp(pitch+(e.clientY-drag.y)*.0028,-.65,.65);drag.x=e.clientX;drag.y=e.clientY;});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{drag=null;canvas.classList.remove('dragging');});
document.querySelectorAll('[data-step]').forEach(b=>{b.onpointerdown=e=>{touched();if(!canMove())return;target=null;camTurn=null;heldStep=Number(b.dataset.step);b.setPointerCapture(e.pointerId);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>heldStep=0;});
document.addEventListener('visibilitychange',()=>{keys.clear();heldStep=0;if(document.hidden){silence();}else{clock.getDelta();if(state==='playing'&&!muted)play('chatter');}});
function move(dx,dz){let nx=clamp(pos.x+dx,-9.8,9.8),nz=clamp(pos.z+dz,3.2,35.3);
 // Seat blocks are solid; front, rear, side and centre aisles stay connected.
 if(Math.abs(nx)>1.20&&Math.abs(nx)<9.25&&nz>8.8&&nz<31.3){if(Math.abs(pos.x)<=1.20)nx=Math.sign(nx)*1.20;else if(Math.abs(pos.x)>=9.25)nx=Math.sign(nx)*9.25;else nz=pos.z;}
 if(chairHit(nx,nz)){if(!chairHit(nx,pos.z))nz=pos.z;else if(!chairHit(pos.x,nz))nx=pos.x;else{nx=pos.x;nz=pos.z;}}
 pos.x=nx;pos.z=nz;pos.y=floor(pos.z)+1.65;}
function navigate(dt){
 if(camTurn&&state!=='ending'&&state!=='opening'){const p=camTurn.getPoint(),dx=p.x-pos.x,dz=p.z-pos.z,dy=p.y-pos.y,k=Math.min(1,dt*2.6);yaw+=angDiff(Math.atan2(-dx,-dz),yaw)*k;pitch+=(clamp(Math.atan2(dy,Math.hypot(dx,dz)),-.75,.75)-pitch)*k;if(activeTime>camTurn.until)camTurn=null;}
 if(!canMove())return;
 if(target){const o=target.o,dest=target.waypoints[0],dx=dest.x-pos.x,dz=dest.z-pos.z,d=Math.hypot(dx,dz);
  if(d>.1){const speed=Math.min(d,dt*4.6);move(dx/d*speed,dz/d*speed);const focus=o.id==='mic'?SCREEN:o.anchor(),aim=Math.atan2(-(focus.x-pos.x),-(focus.z-pos.z));yaw+=angDiff(aim,yaw)*Math.min(1,dt*2);pitch*=Math.max(0,1-dt*3);
   if(activeTime-target.check>.8){if(pos.distanceTo(target.from)<.05)target=null;else{target.check=activeTime;target.from.copy(pos);}}}
  else{target.waypoints.shift();if(!target.waypoints.length){target=null;o.act();}}
 }else{const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-heldStep,side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),norm=Math.hypot(forward,side)||1,h=yaw;if(forward||side)move((-Math.sin(h)*forward+Math.cos(h)*side)*dt*3.8/norm,(-Math.cos(h)*forward-Math.sin(h)*side)*dt*3.8/norm);}
 const s=director.scale.x;if(state==='playing'&&!target&&Math.abs(pos.x)<.42*s+1.4&&pos.z<6.2+.38*s+1.2&&pos.z>6.2-.66*s-1.2&&activeTime-confrontTime>12)confront(false);
}
function wrapText(text,maxWidth,font){fg.font=font;const words=text.split(' '),lines=[];let line='';for(const word of words){if(fg.measureText(line+' '+word).width>maxWidth&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);return lines;}
function paintFilm(){fg.fillStyle=lightLevel>.5?'#6c6d6e':'#0b0d13';fg.fillRect(0,0,1536,768);
 if(state==='mic'){paintMicScreen();return void(filmTexture.needsUpdate=true);}
else if(state==='booth'||(state==='ending'&&endingKind==='booth')){const t=state==='booth'?modeTime-3:23;if(t<0)return void(filmTexture.needsUpdate=true);fg.fillStyle='#080b11';fg.fillRect(0,0,1536,768);const x=768,y=t<5?384:330;
  if(t<5){const r=3+Math.sin(t*.8)*2;const g=fg.createRadialGradient(x,y,0,x,y,65);g.addColorStop(0,'#fff6de');g.addColorStop(.08,'#ead7ab');g.addColorStop(1,'#ead7ab00');fg.globalAlpha=ease(t/1.5);fg.fillStyle=g;fg.fillRect(x-70,y-70,140,140);fg.fillStyle='#fff';fg.beginPath();fg.arc(x,y,r,0,7);fg.fill();fg.globalAlpha=1;}
  else if(t<11){const sun=fg.createRadialGradient(768,335,1,768,335,180);sun.addColorStop(0,'#fff3d1');sun.addColorStop(.3,'#daba78');sun.addColorStop(1,'#66503c00');fg.fillStyle=sun;fg.fillRect(500,100,540,500);fg.fillStyle='#e8c88b';fg.beginPath();fg.arc(768,335,55,0,7);fg.fill();for(let i=0;i<60;i++){fg.fillStyle=`rgba(225,195,135,${.4*(1-i/65)})`;const width=(12+i*3)*(1+.3*Math.sin(i*1.7+t));fg.fillRect(768-width/2+Math.sin(i+t)*12,404+i*5,width,2);}}
  else{const dropT=Math.max(0,t-15);const dy=180+Math.min(350,dropT*dropT*90);fg.fillStyle='#f1e8d3';fg.beginPath();fg.ellipse(768,dy,8,14,0,0,7);fg.fill();if(dropT>1.9)for(let i=0;i<5;i++){fg.strokeStyle=`rgba(241,232,211,${Math.max(0,.6-i*.1)})`;fg.lineWidth=2;fg.beginPath();fg.ellipse(768,540,(dropT-1.9)*100+i*40,(dropT-1.9)*16+i*7,0,0,7);fg.stroke();}}
 }
 else if(state==='playing'&&!reduced){const cycle=activeTime%13;if(cycle>11.6&&cycle<11.92){const gc=Math.floor(activeTime/13);if(gc!==lastGaspCycle){lastGaspCycle=gc;gasp();}fg.save();fg.beginPath();fg.rect(0,200,1536,240);fg.clip();fg.fillStyle='#d8d9da';fg.fillRect(0,202,1536,5);const frag=gc%4;if(frag===0){fg.fillStyle='#f1e8d3';fg.beginPath();fg.arc(768,320,11,0,7);fg.fill();}else if(frag===1){fg.strokeStyle='#a7a9ae';fg.lineWidth=4;fg.strokeRect(480,160,550,380);fg.strokeRect(700,230,160,200);fg.fillStyle='#777';fg.fillRect(550,350,100,80);}else{fg.fillStyle=frag===2?'#cdbb8e':'#fff';fg.font='64px Georgia';fg.textAlign='center';fg.fillText(frag===2?'❧  1974  ❧':'MASTERPIECE',768,350);}fg.restore();}}
 filmTexture.needsUpdate=true;
}
function updateStory(dt){if(state!=='opening'&&state!=='ending')elapsed+=dt;activeTime+=dt;
 if(state==='playing'){
  if(activeTime-lastLaugh>14){lastLaugh=activeTime;play('director',.65);setTimeout(()=>{if(state==='playing')play(Math.random()<.5?'crowdA':'crowdB',.42);},650);}
  if(activeTime-lastPraise>19){lastPraise=activeTime;play(['genius','masterpiece','wonderful'][Math.floor(activeTime/19)%3],.4);}
  // Q&A: the light changes first, then the card, then the questions from the room.
  if(!qa&&elapsed>25){qa=true;qaTime=activeTime;chatterVol=.24;play('chatter');say('Q & A',3.2,'caps');}
  if(qa&&qaStep<QA.length&&elapsed>QA[qaStep][0]){const [,q,a]=QA[qaStep++];say(q,3.2,'q');say(a,6.5,'',()=>{setTimeout(()=>{if(state==='playing'){lastLaugh=activeTime;play('director',.6);setTimeout(()=>{if(state==='playing')play(Math.random()<.5?'crowdA':'crowdB',.45);},600);}},5200);});}
  if(transition&&qa&&activeTime>transition.at&&!appropriated){appropriated=true;transition=null;say('— And what did you mean, Maestro?',3,'q');say('“What I meant with this film: '+programmeText+'”',8,'',()=>setTimeout(()=>{if(state==='playing')applause();},2500));}
  if(!confrontLaughed&&activeTime-confrontTime>2.7){confrontLaughed=true;lastLaugh=activeTime;play('director',.7);}
  // Staying is a choice made by doing nothing.
  if(elapsed>=100&&activeTime-lastInput>=40&&!$('#programme').open&&!target&&!camTurn&&activeTime-confrontTime>4)showEnding('stay');
 }
 if(['lights','booth','mic','exit'].includes(state))modeTime+=dt;
 if(state==='lights'){lightLevel=Math.min(1,modeTime*1.5);if(modeTime>9)showEnding('lights');}
 if(state==='booth'){reel.position.y=REEL_Y+ease(modeTime/.8)*.22;reel.scale.setScalar(Math.max(.001,1-ease((modeTime-.5)/.5)));if(modeTime>.9&&modeTime<.9+dt)turnTo(()=>SCREEN,3);if(modeTime>26)showEnding('booth');}
 if(state==='mic'){
  // back from the words: the room turns to you, he shrinks to the size of a man, and nobody is looking at him
  if(M.returnAt!==null&&modeTime-M.returnAt>12)showEnding('mic');
 }
 if(state==='exit'){setDoor(clamp(modeTime/1.4,0,1));if(modeTime>1.2)pos.z=Math.min(door.wallZ-.25,pos.z+dt*1.3);canvas.style.opacity=1-ease((modeTime-2.6)/1.6);if(modeTime>4.4)showEnding('exit');}
 if(fade){const k=clamp(1-(activeTime-fade.t0)/fade.dur,0,1);for(const a of Object.values(sounds))a.volume=(a._base??a.volume)*k;if(k<=0)silence();}
 updateSubs();
 // Light levels: the house lights, the Q&A spots.
 const spotTarget=state==='playing'&&qa?1:state==='mic'?(M.returnAt===null?1:0):0;spot+=(spotTarget-spot)*Math.min(1,dt*(spotTarget>spot?.8:.5));
 dirSpot.intensity=spot*320;const micOn=(state==='playing'&&qa)||state==='mic'?1:0;micSpot.intensity+=(micOn*90-micSpot.intensity)*Math.min(1,dt*.8);micCone.material.opacity=micSpot.intensity/90*.03;youLight.position.set(pos.x,pos.y+.4,pos.z+.6);youLight.intensity+=((state==='mic'&&M.returnAt!==null?clamp((modeTime-M.returnAt-.6)/4,0,1)*40:0)-youLight.intensity)*Math.min(1,dt*2);
 const growth=state==='mic'?(M.returnAt!==null&&modeTime-M.returnAt>1.2?T.MathUtils.lerp(director.scale.x,1,Math.min(1,dt*.6)):director.scale.x):state==='lights'?T.MathUtils.lerp(director.scale.x,1,Math.min(1,dt*2)):state==='ending'?director.scale.x:Math.min(5.4,3+elapsed*.016);director.scale.setScalar(growth);
 const laugh=state==='playing'?Math.max(0,1-(activeTime-lastLaugh)/4):0;
 // He never looks at you, unless you make him: a look down, the eyes up and away, back to his screen, then the laugh.
 const c=activeTime-confrontTime;
 if(state==='playing'&&c<3.4){const hw=headPivot.getWorldPosition(HEAD),toYaw=clamp(Math.atan2(-(pos.x-hw.x),-(pos.z-hw.z)),-1.3,1.3),look=ease(c/.6)*(1-ease((c-2.1)/.9)),roll=ease((c-1.3)/.4)*(1-ease((c-2.3)/.8));headPivot.rotation.set(.32*look*(1-roll)-.3*roll,toYaw*look*(1-.35*roll),.08*roll);}
 else headPivot.rotation.set(-.03+Math.sin(activeTime*11)*.07*laugh-laugh*.2,0,0);
 audience.forEach(p=>{let turn=0;if(state==='mic'&&M.returnAt!==null){const k=clamp((modeTime-M.returnAt-.8-p.row*.8)/1.6,0,1);turn=k*(Math.atan2(pos.x-p.g.position.x,pos.z-p.g.position.z)+Math.PI);}else if(state==='lights')turn=Math.sin(p.phase)*.7;
  p.g.rotation.y=T.MathUtils.lerp(p.g.rotation.y,turn,Math.min(1,dt*3));p.head.rotation.z=state==='playing'?Math.sin(activeTime*5+p.phase)*.035*laugh:0;p.head.rotation.x=state==='booth'&&modeTime>4?-.1:0;if(p.phoneMesh)p.phoneMesh.visible=state==='playing';});
 house.intensity=lightLevel*2.8;amb.intensity=.22+lightLevel*.6;renderer.toneMappingExposure=.85+lightLevel*.2;scene.fog.density=.012-lightLevel*.008;beam.visible=lightLevel<.4;beam.material.opacity=state==='booth'&&modeTime>3?.022:.009;screenLight.intensity=state==='booth'?(modeTime>3?160:40):state==='mic'?140:lightLevel>0?40:85;rimLight.intensity=.5+lightLevel*.3;updateAudience();
}
const projected=new T.Vector3(),fwd=new T.Vector3(),toObj=new T.Vector3(),dirBox=new T.Box3(),ray=new T.Ray(),hit=new T.Vector3();
function positionLabels(dt){camera.getWorldDirection(fwd);dirBox.setFromObject(director);const occupied=[],dialogOpen=$('#programme').open;
 for(const o of objects){const p=o.anchor();let a=0;
  if(state==='playing'&&!dialogOpen&&!target&&!camTurn&&(!o.enabled||o.enabled())){toObj.subVectors(p,camera.position);const d=toObj.length();toObj.divideScalar(d);const ang=Math.acos(clamp(toObj.dot(fwd),-1,1));
   if(d<o.range&&ang<.6){a=Math.min(1,(.6-ang)/.2)*Math.min(1,(o.range-d)/3);ray.set(camera.position,toObj);if(o.id!=='director'&&ray.intersectBox(dirBox,hit)&&hit.distanceTo(camera.position)<d)a=0;}}
  o.alpha+=(a-o.alpha)*Math.min(1,dt*(a>o.alpha?3:5));const b=o.b;b.style.opacity=o.alpha.toFixed(3);b.style.pointerEvents=o.alpha>.4?'auto':'none';if(o.alpha<.01){b.style.visibility='hidden';continue;}b.style.visibility='visible';
  projected.copy(p).project(camera);let x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;x=clamp(x,70,innerWidth-70);y=clamp(y,90,innerHeight-110);for(const q of occupied)if(Math.abs(q.x-x)<130&&Math.abs(q.y-y)<40)y=q.y+42;occupied.push({x,y});b.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;}}
let filmTick=0;
// Read-only diagnostics for device QA; never changes the scene or story.
window.premiereDiagnostics=()=>({state,position:pos.toArray(),yaw,pitch,target:target?{id:target.o.id,waypoints:target.waypoints.map(p=>p.toArray())}:null,elapsed,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,headTurn:headPivot.rotation.y,audio:Object.fromEntries(Object.entries(sounds).map(([k,a])=>[k,{paused:a.paused,volume:a.volume}]))});
function frame(){requestAnimationFrame(frame);const realDelta=clock.getDelta(),dt=Math.min(realDelta,.05);if(document.hidden)return;navigate(dt);mouseLook(dt);updateStory(Math.min(realDelta,.25));sounds.chatter.tick();
 document.body.dataset.scene=state;camera.position.copy(pos);camera.rotation.order='YXZ';camera.rotation.set(clamp(pitch+lookY,-.8,.8),yaw+lookX,0);camera.updateMatrixWorld();positionLabels(dt);
 filmTick+=dt;const moving=state==='mic'||state==='booth'||state==='lights'||(state==='playing'&&activeTime%13>11.5&&activeTime%13<12);if(moving||filmTick>.25){filmTick=0;paintFilm();}
 if(letterGlow)letterGlow.emissiveIntensity=(.62+Math.sin(activeTime*1.1)*.12)*(1-lightLevel*.6);
 dust.rotation.y=Math.sin(activeTime*.02)*.02;renderer.render(scene,camera);
 $('#steps').classList.toggle('on',canMove());$('#hint').classList.toggle('on',state==='playing'&&elapsed<22);if(!$('#credits').hidden)rollCredits(Math.min(realDelta,.1));}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<600?78:65;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});dispatchEvent(new Event('resize'));paintFilm();frame();loadRoom();
})();
