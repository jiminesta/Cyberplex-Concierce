import {build} from 'esbuild';
await build({stdin:{contents:"export {gameReducer,initialState,useGameEngine} from './hooks/useGameEngine.ts';export {GuestState,Item} from './types.ts';",resolveDir:process.cwd(),loader:'ts'},outfile:'.test-build/engine.mjs',bundle:true,packages:'external',platform:'node',format:'esm',define:{'process.env.API_KEY':'""'},logLevel:'silent'});
