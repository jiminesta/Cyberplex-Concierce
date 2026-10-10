import React, { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, RoundedBox, Text } from '@react-three/drei';
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
function Machine({name,color,position,onSelect}:{name:Drink;color:string;position:[number,number,number];onSelect:(name:Drink)=>void}){
 return <group position={position} onClick={e=>{e.stopPropagation();onSelect(name);}}>
  <RoundedBox args={[1.65,2.25,.85]} position={[0,1.2,0]} radius={.12} smoothness={3}><meshStandardMaterial color="#4a6579" metalness={.65} roughness={.28}/></RoundedBox>
  <mesh position={[0,1.85,.45]}><boxGeometry args={[1.35,.48,.06]}/><meshStandardMaterial color="#152b40" emissive={color} emissiveIntensity={.18}/></mesh>
  <Text position={[0,1.85,.49]} fontSize={.23} color="#fff4dc" anchorX="center" anchorY="middle">{name.toUpperCase()}</Text>
  <mesh position={[0,1.12,.45]}><boxGeometry args={[1.05,.75,.06]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.23}/></mesh>
  <mesh position={[0,.65,.5]}><cylinderGeometry args={[.11,.11,.16,12]}/><meshStandardMaterial color="#e8d4b7" metalness={.6}/></mesh>
  <mesh position={[0,.3,.5]}><cylinderGeometry args={[.22,.17,.36,12]}/><meshStandardMaterial color="#f3eadb"/></mesh>
  <Html position={[0,2.55,.1]} center distanceFactor={10}><button className="machine-btn" onClick={()=>onSelect(name)} aria-label={'Prepare '+name}>{name} +</button></Html>
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
function Scene({onSelect,served}:{onSelect:(name:Drink)=>void;served:number}){
 return <Canvas shadows camera={{position:[0,4.7,10],fov:48}} gl={{antialias:true}}>
  <color attach="background" args={['#101827']}/><fog attach="fog" args={['#101827',14,28]}/>
  <ambientLight intensity={1.1}/><hemisphereLight args={['#b2d6ef','#53364c',1.3]}/>
  <spotLight position={[-4,8,5]} intensity={85} angle={.7} penumbra={.9} castShadow color="#f4c69b"/>
  <pointLight position={[3,3,-1]} intensity={13} color="#7acbc9"/>
  <mesh position={[0,-.55,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[25,25]}/><meshStandardMaterial color="#615368" roughness={.9}/></mesh>
  <mesh position={[0,2,-2.45]}><boxGeometry args={[18,7,.3]}/><meshStandardMaterial color="#40364f"/></mesh>
  <mesh position={[0,3.75,-2.23]}><boxGeometry args={[8.4,.8,.15]}/><meshStandardMaterial color="#1b3644" emissive="#183a42" emissiveIntensity={.4}/></mesh>
  <Text position={[0,3.75,-2.12]} fontSize={.55} color="#f5d4a5" anchorX="center">CYBER-PLEX 64</Text>
  {drinks.map(d=><Machine key={d.name} {...d} onSelect={onSelect}/>)}
  <Person position={[-.5,.2,.5]} shirt="#2d9d98" skin="#b88165"/>
  <mesh position={[0,.15,2.2]} castShadow><boxGeometry args={[9,1.4,1.25]}/><meshStandardMaterial color="#55405c" metalness={.3} roughness={.45}/></mesh>
  <mesh position={[0,.9,2.2]} castShadow><boxGeometry args={[9,.13,1.5]}/><meshStandardMaterial color="#d8b28d" roughness={.35}/></mesh>
  <Text position={[0,.22,2.84]} fontSize={.3} color="#f2d9ac">CONCESSIONS</Text>
  {served<customers.length&&<Person position={[2,-.1,4.3]} shirt="#c778a1" skin="#d6a481"/>}
  <OrbitControls enablePan={false} minDistance={7} maxDistance={15} minPolarAngle={.7} maxPolarAngle={1.35} target={[0,1,0]}/>
 </Canvas>;
}
function Preview(){
 const [served,setServed]=useState(0);
 const [tray,setTray]=useState<Drink[]>([]);
 const [score,setScore]=useState(0);
 const [message,setMessage]=useState('Tap a machine behind the counter to prepare a drink.');
 const guest=customers[served];
 const add=(drink:Drink)=>{setTray(t=>[...t,drink]);setMessage(drink+' ready at the pickup counter.');};
 const canServe=!!guest&&guest.order.every((d,i)=>tray.filter(x=>x===d).length>=guest.order.filter(x=>x===d).length);
 const serve=()=>{if(!guest||!canServe)return;const left=[...tray];guest.order.forEach(d=>left.splice(left.indexOf(d),1));setTray(left);setScore(s=>s+100);setServed(s=>s+1);setMessage('Order served! Next guest approaching.');};
 return <div className="app">
  <header><div><strong>CYBER-PLEX 64</strong><small>3D CONCESSION PROTOTYPE · DEVELOPMENT BUILD</small></div><span>★ {score} &nbsp; {served}/5 SERVED</span></header>
  <main><Scene onSelect={add} served={served}/></main>
  <section className="hud"><div><b>{guest?guest.name+' · '+guest.order.join(' + '):'SHIFT COMPLETE'}</b><p>{message}</p><p>Pickup tray: {tray.length?tray.join(', '):'Empty'}</p></div><div className="actions"><button onClick={serve} disabled={!canServe}>SERVE ORDER</button><button onClick={()=>{setServed(0);setTray([]);setScore(0);setMessage('New shift started.');}}>RESTART</button></div></section>
 </div>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
