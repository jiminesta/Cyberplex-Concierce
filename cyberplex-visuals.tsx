import React, {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';

export type CupKind='Soda'|'Icee'|'Shake'|'Water';
const colors:Record<CupKind,string>={Soda:'#bc6b77',Icee:'#55b9df',Shake:'#e5adc9',Water:'#6fcfc6'};

export function DrinkCup({drink,position,fill=1}:{drink:CupKind;position:[number,number,number];fill?:number}){
 const height=Math.max(.01,.34*Math.min(1,Math.max(0,fill)));
 return <group position={position}>
  <mesh position={[0,.21,0]}><cylinderGeometry args={[.16,.12,.42,12]}/><meshStandardMaterial color="#eee5d7" transparent opacity={.72} roughness={.25}/></mesh>
  <mesh position={[0,.03+height/2,0]}><cylinderGeometry args={[.14,.11,height,12]}/><meshStandardMaterial color={colors[drink]} transparent opacity={.9}/></mesh>
  <mesh position={[0,.43,0]}><cylinderGeometry args={[.17,.17,.035,12]}/><meshStandardMaterial color="#f9eddd"/></mesh>
  <mesh position={[.07,.55,0]} rotation={[0,0,-.18]}><cylinderGeometry args={[.015,.015,.27,7]}/><meshStandardMaterial color="#f9eddd"/></mesh>
 </group>;
}
export function WalkingGuest({customerIndex,finished}:{customerIndex:number;finished:boolean}){
 const group=useRef<THREE.Group>(null);
 useFrame((state,delta)=>{
  if(!group.current)return;
  const target=finished?8:2.1;
  group.current.position.x=THREE.MathUtils.damp(group.current.position.x,target,2.2,delta);
  group.current.position.y=-.1+Math.sin(state.clock.elapsedTime*3)*.025;
 });
 return <group key={customerIndex} ref={group} position={[8,-.1,4.3]}>
  <mesh position={[0,.45,0]}><capsuleGeometry args={[.31,.75,4,10]}/><meshStandardMaterial color={['#c778a1','#70abc8','#d6a36b','#81b68d','#ac8bc7'][customerIndex%5]}/></mesh>
  <mesh position={[0,1.45,0]}><sphereGeometry args={[.31,14,12]}/><meshStandardMaterial color={['#d6a481','#ae795c','#9a654e','#e2bb91','#a77563'][customerIndex%5]}/></mesh>
  <mesh position={[0,1.69,0]} scale={[1,.38,1]}><sphereGeometry args={[.32,12,10]}/><meshStandardMaterial color="#292331"/></mesh>
  {[-.18,.18].map(x=><mesh key={x} position={[x,-.32,0]}><capsuleGeometry args={[.11,.5,4,8]}/><meshStandardMaterial color="#263247"/></mesh>)}
 </group>;
}
