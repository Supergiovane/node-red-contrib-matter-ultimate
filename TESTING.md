# Standalone beta validation

- `npm test`: 241 tests passed, including migration confirmation, backup failure, locked flows, atomic rollback and undo metadata.
- All registered runtime modules and editor scripts pass the syntax check.
- The npm tarball installs with production dependencies only, without KNX Ultimate or the KNX engine.
- Node-RED 5.0.4 on Node.js 24.13.0 loads all standalone node types with KNX Ultimate excluded.
- Installing KNX Ultimate alongside the two packages resolves the optional KNX engine and preserves separate old/new registrations.
- An isolated Node-RED Deploy from legacy HUE configuration to the standalone type preserves the original ID and dummy bridge credentials.
- Matter live-engine adoption has a focused unit test; physical commissioning and device communication were not exercised.
- Browser automation was unavailable, so graphical editor interaction remains to be checked. Migration interaction and notifications are covered by JavaScript tests.

No production flows or physical devices were modified during these checks.

## Node-RED messages and KNX mode validation

- Native topic/payload light commands, RAW compatibility, mapped state output and explicit gateway selection are covered by runtime tests.
- Matter thermostat mappings and virtual bridge status/command topics are covered without configured DPTs.
- Both packed packages were installed with production dependencies only; KNX Ultimate and the KNX engine were absent. All 18 focused runtime tests passed against that installation.
- Graphical editor and physical-device checks remain manual.

## Public beta release validation — 2026-09-17

- Production-only installation of both release tarballs in a fresh directory succeeded.
- Node-RED 5.0.4 on Node.js 24.13.0 loaded all six runtime/editor node types and both migration plugins, with KNX Ultimate and the KNX engine absent.
- Documentation builds passed for both packages.
