import test from 'node:test';import assert from 'node:assert/strict';
import React,{act} from 'react';import {create} from 'react-test-renderer';
import {useGameEngine,Item} from '../.test-build/engine.mjs';
test('mounted game completes real preparation timers across rush countdown updates',async t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const original=Math.random;Math.random=()=>0;globalThis.IS_REACT_ACT_ENVIRONMENT=true;let engine,root;
 function Harness(){engine=useGameEngine();return null;}
 try{
  await act(async()=>{root=create(React.createElement(Harness));});
  await act(async()=>engine.startGame());
  await act(async()=>t.mock.timers.tick(100));assert.ok(engine.gameState.rushHourRemaining>0);
  await act(async()=>engine.dispatch({type:'PREPARE_ITEM',payload:Item.Soda}));
  for(let i=0;i<21;i++)await act(async()=>t.mock.timers.tick(100));
  assert.ok(engine.gameState.preparedItems.includes(Item.Soda),'timeout survives rerenders during rush countdown');
  for(let i=0;i<60;i++)await act(async()=>t.mock.timers.tick(100));
  assert.ok(engine.gameState.guests.length>1,'mounted game keeps spawning customers during rush');
 }finally{if(root)await act(async()=>root.unmount());Math.random=original;delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
