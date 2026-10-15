# Cyber-Plex Concierge

React/Vite concession-management game. The original game is at `/`; the existing 3D concession prototype remains at `/cyberplex-3d.html`.

## Develop and validate

```
npm ci
npm test
npm run check:types
npm run build
npm run dev
```

The game runs without an AI key. Optional generated posters use the existing Gemini configuration only when explicitly configured; no key is required to start or play.

## Reliability update · October 15, 2026

Based on verified `feature/cyberplex-3d-foundation` commit `8df31f9c1700a80a733b391ada4168461102dff1`, retaining its 3D files, dependencies and Vite entries. The original game now starts each shift with a visible presale guest. Customer cadence advances with the simulation clock instead of an interval reset by the rush countdown. Preparation/refill timeouts survive countdown updates and are cancelled on shift end/unmount. AI SDK construction no longer occurs during menu rendering without credentials.

Five regression tests cover keyless menu rendering, initial/next-shift customer spawning, rush spawning, presale service and tips, and an actual mounted React hook with fake timers proving preparation completes during rush. Reintroducing the old countdown effect dependency fails the mounted test; restoring the fix passes. Tests use react-test-renderer only as a development dependency (upstream deprecation warning); gameplay does not import it.

This pass does not replace the 3D prototype's separate state loop with the original game's reducer. Its large Three/R3F build remains an optimization target, and physical mobile Safari performance has not been verified. No Yuka/Rapier/game-engine migration was installed. Production domains and main are unchanged.
