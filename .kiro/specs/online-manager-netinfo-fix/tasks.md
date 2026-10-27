# Implementation Plan

## Overview

Bugfix implementation for `onlineManager` connectivity detection on Android/iOS. Follows the exploratory methodology: write tests before the fix to understand the bug, then implement, then validate.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2"] },
    { "wave": 2, "tasks": ["3.1"] },
    { "wave": 3, "tasks": ["3.2"] },
    { "wave": 4, "tasks": ["3.3", "3.4"] },
    { "wave": 5, "tasks": ["3.5", "3.6"] },
    { "wave": 6, "tasks": ["4"] }
  ]
}
```

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - expo-network listener does not fire on connectivity loss
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases: Android/iOS device loses WiFi or mobile data while using `expo-network` listener
  - Mock `expo-network`'s `addNetworkStateListener` so it does NOT fire when connectivity is lost (simulating the real Android behavior)
  - Mock `Network.getNetworkStateAsync` to return `{ isConnected: false, isInternetReachable: false }` (so polling would detect it, but listener-based detection won't)
  - Call `onlineManager.setEventListener` with the current (unfixed) implementation
  - Simulate a network-loss event by NOT calling the expo-network listener callback
  - Assert that `setOnline(false)` is NOT called within 2 seconds (this is the bug: the listener is silent)
  - Document counterexample found: "When WiFi is disabled, expo-network listener does not fire → setOnline(false) never called → onlineManager remains online incorrectly"
  - Also test that the fetch HEAD without AbortController does not abort within 3 s (mock a slow fetch that resolves after 5 s and verify no abort signal is used)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing connectivity behaviors remain unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: on unfixed code, when the app initializes with active connection, `comprobarConexion` calls `setOnline(true)`
  - Observe: on unfixed code, when `AppState` changes to `'active'`, `comprobarConexion` is called again
  - Observe: on unfixed code, when `Network.getNetworkStateAsync` returns `{ isConnected: true, isInternetReachable: true }` and fetch resolves OK, `setOnline(true)` is called
  - Write property-based test: for all network states where `isConnected = true` AND `isInternetReachable !== false`, `setOnline(true)` is called (from Preservation Requirements in design)
  - Write property-based test: for any `AppState` change to `'active'`, connectivity re-check is triggered
  - Write property-based test: for any network state where `isConnected = false` OR `isInternetReachable = false`, `setOnline(false)` is called (polling path still works)
  - Verify all tests PASS on UNFIXED code — these represent the baseline behavior to preserve
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Fix onlineManager — replace expo-network listener with NetInfo + AbortController

  - [x] 3.1 Install `@react-native-community/netinfo` via Expo CLI
    - Run `npx expo install @react-native-community/netinfo` (uses npm since project has package-lock.json, not bun.lock)
    - This resolves the SDK 58-compatible version automatically
    - Verify the package appears in `package.json` dependencies
    - _Requirements: 2.1_

  - [x] 3.2 Rewrite `src/query/onlineManager.ts`
    - Remove `import * as Network from 'expo-network'`
    - Add `import NetInfo from '@react-native-community/netinfo'`
    - Import `queryClient` from `@/query/queryClient`
    - Replace `Network.addNetworkStateListener(...)` with `NetInfo.addEventListener(state => { void comprobarConexion(setOnline) })` inside `setEventListener`
    - Update the cleanup return to call the unsubscribe function returned by `NetInfo.addEventListener` (it returns a function, not an object with `.remove()`)
    - Add `AbortController` to `comprobarConexion`: create controller before fetch, set `setTimeout(() => controller.abort(), 3000)`, pass `signal: controller.signal` to fetch options, call `clearTimeout` in both try and catch blocks
    - Update all `console.log` calls to include `new Date().toISOString()` timestamp (e.g., `[red] sin conexión — 2024-01-15T10:30:00.000Z`)
    - Track previous online state; when `isOnline` transitions from `false` to `true`, call `queryClient.resumePausedMutations()`
    - Keep existing AppState listener and polling interval unchanged (preservation)
    - _Bug_Condition: isBugCondition(event) — event.connectivityLost = true AND listenerSource = EXPO_NETWORK AND onlineManager.isOnline() = true_
    - _Expected_Behavior: expectedBehavior — setOnline(false) called in < 2 s, mutations paused, banner shown_
    - _Preservation: AppState listener, 10 s polling interval, and online-startup behavior must remain identical_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Create `src/components/ConnectionBanner.tsx`
    - Define `useOnlineStatus()` hook in the same file: subscribe with `onlineManager.subscribe(cb)`, initialize state from `onlineManager.isOnline()`, return boolean `isOnline`; unsubscribe on unmount
    - Use `useSharedValue` (Reanimated v4) for `translateY` (banner slides in from top, starts at `-60`) and `opacity` (starts at `0`)
    - Use `useAnimatedStyle` to build the animated style from those shared values
    - On `isOnline` → `false`: animate `translateY` to `0` and `opacity` to `1` with `withTiming` (duration 300 ms)
    - On `isOnline` → `true` (reconnection): show green banner briefly, then animate out with `withDelay(1500, withTiming(-60))` and `withDelay(1500, withTiming(0))`
    - Offline: background `#FF4444`, white text, label "Sin conexión"
    - Reconnection: background `#39FF14`, text color `#0A0A12`, label "Conexión restaurada"
    - Position: absolute top under status bar using `SafeAreaView` or `useSafeAreaInsets`, high `zIndex` (e.g., `9999`)
    - Export `ConnectionBanner` as default export
    - Ensure strict TypeScript types — no `any`
    - _Requirements: 2.2, 2.6_

  - [x] 3.4 Update `src/app/_layout.tsx` to mount ConnectionBanner
    - Add `import ConnectionBanner from '@/components/ConnectionBanner'`
    - Add `<ConnectionBanner />` as a direct child of `ThemeProvider`, placed before `<Stack>` (outside Stack so it doesn't interfere with navigation)
    - No other lines in `_layout.tsx` should change
    - _Requirements: 2.6, 3.4_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - NetInfo listener fires on connectivity loss
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Update the mock in the test to use `NetInfo.addEventListener` instead of `expo-network` (the test now validates the fixed implementation)
    - Simulate connectivity loss by calling the NetInfo listener callback with `{ isConnected: false, isInternetReachable: false }`
    - Assert `setOnline(false)` is called within 2 seconds
    - Assert fetch HEAD with AbortController aborts after 3 s (mock a slow fetch and verify the abort signal is triggered)
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing connectivity behaviors remain unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm AppState-triggered re-check, online startup, and normal query behavior are all unaffected
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 4. Checkpoint — Ensure all tests pass and project builds
  - Run `npx expo lint` — fix any lint errors before proceeding
  - Run `npx tsc --noEmit` — fix any TypeScript errors before proceeding
  - Ensure all tests pass (bug condition exploration test + preservation tests)
  - Ask the user if questions arise

## Notes

- Install `@react-native-community/netinfo` with `npx expo install` (not npm/yarn) so Expo resolves the SDK 58-compatible version.
- `react-native-reanimated` v4 is already installed — do not reinstall or change its version.
- The project uses npm (package-lock.json present, no bun.lock), so use `npx` for all Expo CLI commands.
- Tasks 1 and 2 must be completed on UNFIXED code before any implementation changes.
- The `NetInfo.addEventListener` cleanup returns a plain function (not an object with `.remove()`), unlike `expo-network`.
