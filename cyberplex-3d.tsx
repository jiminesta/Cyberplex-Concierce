import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type Drink = 'Soda' | 'Icee' | 'Shake' | 'Water';
const drinks: {name:Drink;color:string;position:[number,number,number]}[] = [
 {name:'Soda',color:'#bc6b77',position:[-3,0,-1.8]},
 {name:'Icee',color:'#55b9df',position:[-1,0,-1.8]},
 {name:'Shake',color:'#e5adc9',position:[1,0,-1.8]},
 {name:'Water',color:'#6fcfc6',position:[3,0,-1.8]}
];
const customers:{name:string;order:Drink[]}[]=[
 {name:'NOVA',order:['Soda','Soda']},
 {name:'PIXEL',order:['Water','Icee']},
 {name:'LUNA',order:['Shake']},
 {name:'ZIGGY',order:['Soda','Water']},
 {name:'COSMO',order:['Icee','Icee']}
];
function Machine({name,color,position,onSelect,active}:{name:Drink;color:string;position:[number,number,number];onSelect:(name:Drink)=>void;active:boolean}){
 const lever=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(lever.current)lever.current.rotation.z=active?Math.sin(clock.elapsedTime*13)*.17:0;});
 return <group position={position} onClick={e=>{e.stopPropagation();onSelect(name);}}>
  <RoundedBox args={[1.65,2.25,.85]} position={[0,1.2,0]} radius={.12} smoothness={3}><meshStandardMaterial color="#4a6579" metalness={.65} roughness={.28}/></RoundedBox>
  <mesh position={[0,1.85,.45]}><boxGeometry args={[1.35,.48,.06]}/><meshStandardMaterial color="#152b40" emissive={color} emissiveIntensity={.18}/></mesh>
  <Text position={[0,1.85,.49]} fontSize={.23} color="#fff4dc" anchorX="center" anchorY="middle">{name.toUpperCase()}</Text>
  <mesh position={[0,1.12,.45]}><boxGeometry args={[1.05,.75,.06]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.23}/></mesh>
  <group ref={lever} position={[0,.65,.5]}><mesh><cylinderGeometry args={[.11,.11,.16,12]}/><meshStandardMaterial color="#e8d4b7" metalness={.6}/></mesh></group>
  <pointLight position={[0,1.8,.7]} intensity={active?2:.45} distance={2.3} color={color}/>
  <mesh position={[0,.11,.58]}><boxGeometry args={[1.25,.06,.3]}/><meshStandardMaterial color="#172b3a" metalness={.6}/></mesh>
  <mesh position={[0,.3,.5]}><cylinderGeometry args={[.22,.17,.36,12]}/><meshStandardMaterial color="#f3eadb"/></mesh>
  <group position={[0,1.06,.515]} onClick={e=>{e.stopPropagation();onSelect(name);}} onPointerOver={()=>{document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>
   <RoundedBox args={[.78,.32,.12]} radius={.06} smoothness={3}><meshStandardMaterial color={active?'#f4d7a0':'#18313e'} emissive={color} emissiveIntensity={active?.9:.35}/></RoundedBox>
   <Text position={[0,0,.074]} fontSize={.125} color={active?'#263544':'#fff3da'} anchorX='center' anchorY='middle'>{active?'POURING':'DISPENSE'}</Text>
  </group>
  <mesh position={[0,1.35,.49]}><boxGeometry args={[1.1,.055,.045]}/><meshStandardMaterial color='#142536'/></mesh>
 </group>;
}
function Person({position,shirt,skin}:{position:[number,number,number];shirt:string;skin:string}){
 return <group position={position}>
  <mesh position={[0,.45,0]}><capsuleGeometry args={[.31,.75,4,10]}/><meshStandardMaterial color={shirt}/></mesh>
  <mesh position={[0,1.45,0]}><sphereGeometry args={[.31,14,12]}/><meshStandardMaterial color={skin}/></mesh>
  <mesh position={[0,1.69,-.025]} scale={[1,.38,1]}><sphereGeometry args={[.32,12,10]}/><meshStandardMaterial color="#292331"/></mesh>
  {[-.18,.18].map(x=><mesh key={x} position={[x,-.32,0]}><capsuleGeometry args={[.11,.5,4,8]}/><meshStandardMaterial color="#263247"/></mesh>)}
 </group>;
}
function Scene({onSelect,onServe,canServe,served,active}:{onSelect:(name:Drink)=>void;onServe:()=>void;canServe:boolean;served:number;active:Drink|null}){
 return <Canvas shadows camera={{position:[0,4.7,10],fov:48}} gl={{antialias:true}}>
  <color attach="background" args={['#101827']}/><fog attach="fog" args={['#101827',14,28]}/>
  <ambientLight intensity={1.1}/><hemisphereLight args={['#b2d6ef','#53364c',1.3]}/>
  <spotLight position={[-4,8,5]} intensity={85} angle={.7} penumbra={.9} castShadow color="#f4c69b"/>
  <pointLight position={[3,3,-1]} intensity={13} color="#7acbc9"/>
  <mesh position={[0,-.55,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[25,25]}/><meshStandardMaterial color="#615368" roughness={.9}/></mesh>
  {Array.from({length:14},(_,i)=><mesh key={i} position={[-8.4+i*1.3,-.53,-.6]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.04,14]}/><meshBasicMaterial color={i%2?'#d5a5a5':'#96c8d0'} transparent opacity={.16}/></mesh>)}
  <mesh position={[-5.1,2,-2.12]}><boxGeometry args={[.32,5,.2]}/><meshStandardMaterial color='#c49c7c'/></mesh>
  <mesh position={[5.1,2,-2.12]}><boxGeometry args={[.32,5,.2]}/><meshStandardMaterial color='#c49c7c'/></mesh>
  {[-5.6,5.6].map(x=><group key={x} position={[x,2,-1.95]}><mesh><boxGeometry args={[.75,2.1,.13]}/><meshStandardMaterial color='#182b3a' emissive='#21656c' emissiveIntensity={.4}/></mesh><Text position={[0,.45,.09]} fontSize={.19} color='#f5c89d'>NOW</Text><Text position={[0,.13,.09]} fontSize={.15} color='#91d9d6'>SHOWING</Text><mesh position={[0,-.45,.1]}><boxGeometry args={[.53,.75,.02]}/><meshStandardMaterial color='#be7597'/></mesh></group>)}
  <mesh position={[0,2,-2.45]}><boxGeometry args={[18,7,.3]}/><meshStandardMaterial color="#40364f"/></mesh>
  <mesh position={[0,3.75,-2.23]}><boxGeometry args={[8.4,.8,.15]}/><meshStandardMaterial color="#1b3644" emissive="#183a42" emissiveIntensity={.4}/></mesh>
  <Text position={[0,3.75,-2.12]} fontSize={.55} color="#f5d4a5" anchorX="center">CYBER-PLEX 64</Text>
  {drinks.map(d=><Machine key={d.name} {...d} active={active===d.name} onSelect={onSelect}/>)}
  <Person position={[-.5,.2,.5]} shirt="#2d9d98" skin="#b88165"/>
  <mesh position={[0,.15,2.2]} castShadow><boxGeometry args={[9,1.4,1.25]}/><meshStandardMaterial color="#55405c" metalness={.3} roughness={.45}/></mesh>
  <mesh position={[0,.9,2.2]} castShadow><boxGeometry args={[9,.13,1.5]}/><meshStandardMaterial color="#d8b28d" roughness={.35}/></mesh>
  <Text position={[0,.22,2.84]} fontSize={.3} color="#f2d9ac">CONCESSIONS</Text>
  <group position={[2.8,1.04,2.28]} onClick={e=>{e.stopPropagation();if(canServe)onServe();}} onPointerOver={()=>{document.body.style.cursor=canServe?'pointer':'auto'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>
   <RoundedBox args={[1.38,.18,.65]} radius={.07} smoothness={3}><meshStandardMaterial color={canServe?'#399f82':'#46546b'} emissive={canServe?'#2cc89d':'#000000'} emissiveIntensity={canServe?.65:0}/></RoundedBox>
   <Text position={[0,.105,.02]} rotation={[-Math.PI/2,0,0]} fontSize={.22} color='#fff2d5'>SERVE</Text>
  </group>
  {served<customers.length&&<Person position={[2,-.1,4.3]} shirt="#c778a1" skin="#d6a481"/>}
  <OrbitControls enablePan={false} minDistance={7} maxDistance={15} minPolarAngle={.7} maxPolarAngle={1.35} target={[0,1,0]}/>
 </Canvas>;
}
function Preview(){
 const [served,setServed]=useState(0);
 const [tray,setTray]=useState<Drink[]>([]);
 const [score,setScore]=useState(0);
 const [message,setMessage]=useState('Tap DISPENSE on a 3D machine, then SERVE on the countertop.');
 const [preparing,setPreparing]=useState<Drink|null>(null);
 const [progress,setProgress]=useState(0);
 const [patience,setPatience]=useState(100);
 const [combo,setCombo]=useState(0);
 const [missed,setMissed]=useState(0);
 const [paused,setPaused]=useState(false);
 const [sound,setSound]=useState(true);
 const playTone=(freq:number)=>{if(!sound)return;try{const C=(window as any).AudioContext||(window as any).webkitAudioContext;if(!C)return;const ctx=new C();const o=ctx.createOscillator();const g=ctx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.055,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.17);o.onended=()=>void ctx.close();}catch{}};
 useEffect(()=>{if(paused||served>=customers.length)return;const id=window.setInterval(()=>setPatience(p=>Math.max(0,p-1)),600);return()=>window.clearInterval(id)},[paused,served]);
 useEffect(()=>{if(!preparing||paused)return;const id=window.setInterval(()=>setProgress(p=>Math.min(100,p+10)),150);return()=>window.clearInterval(id)},[preparing,paused]);
 useEffect(()=>{if(preparing&&progress>=100){setTray(t=>[...t,preparing]);setMessage(preparing+' ready for pickup!');playTone(720);setPreparing(null);setProgress(0)}},[preparing,progress]);
 useEffect(()=>{if(patience!==0||served>=customers.length||paused)return;setMissed(m=>m+1);setCombo(0);setServed(s=>s+1);setPatience(100);setMessage('Customer left! Next guest is waiting.');playTone(180)},[patience,served,paused]);
 const guest=customers[served];
 const add=(drink:Drink)=>{if(preparing||paused||!guest)return;setPreparing(drink);setProgress(0);setMessage('Dispensing '+drink+'…');playTone(430);};
 const canServe=!!guest&&guest.order.every((d,i)=>tray.filter(x=>x===d).length>=guest.order.filter(x=>x===d).length);
 const serve=()=>{if(!guest||!canServe)return;const left=[...tray];guest.order.forEach(d=>left.splice(left.indexOf(d),1));setTray(left);setScore(s=>s+100+Math.round(patience)+combo*25);setCombo(c=>c+1);setPatience(100);setServed(s=>s+1);playTone(960);setMessage('Order served! Combo bonus earned.');};
 return <div className="app">
  <header><div><strong>CYBER-PLEX 64</strong><small>THE GRAND CINEMA · 3D ARCADE SHIFT</small></div><span>★ {score} &nbsp; {served}/5 GUESTS</span></header>
  <main><Scene onSelect={add} onServe={serve} canServe={canServe&&!paused} served={served} active={preparing}/></main>
  <section className="hud"><div className="order"><b>{guest?guest.name+' · '+guest.order.join(' + '):'SHIFT COMPLETE'}</b><p>{message}</p><p>Pickup tray: {tray.length?tray.join(', '):'Empty'} · COMBO x{combo} · MISSED {missed}</p><div className='patience'><span style={{width:patience+'%',background:patience>40?'#72d5c0':'#f29c81'}}/></div>{preparing&&<p className='progress'>Dispensing {preparing}: {progress}% <span style={{width:progress+'%'}}/></p>}</div><div className="actions"><button onClick={()=>setPaused(p=>!p)}>{paused?'RESUME':'PAUSE'}</button><button onClick={()=>setSound(v=>!v)}>{sound?'SOUND ON':'MUTED'}</button><button onClick={()=>{setServed(0);setTray([]);setScore(0);setCombo(0);setMissed(0);setPatience(100);setPreparing(null);setProgress(0);setPaused(false);setMessage('New shift started.');}}>RESTART</button></div></section>
 </div>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
