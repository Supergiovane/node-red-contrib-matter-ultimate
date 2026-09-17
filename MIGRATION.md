# Moving existing flows to Matter Ultimate

1. Leave **KNX Ultimate 7** installed and install this package alongside it. Restart Node-RED and reload the editor.
2. The editor detects legacy nodes, including configuration nodes and nodes inside subflow templates, and offers conversion.
3. Choose **Later** to leave everything unchanged, or **Back up and convert**. A flow JSON download is initiated before any change. Allow downloads and retain the file.
4. Review the converted flow. IDs, wiring, layout, settings, gateway selections and shared configuration references are preserved. Use Undo to revert the whole conversion before deployment if needed.
5. Press **Deploy** yourself when ready. Conversion never deploys automatically. Test the converted devices before upgrading KNX Ultimate to 8.

The backup follows Node-RED export rules and excludes protected credentials. It does not replace a backup of the Node-RED user directory. During in-place conversion, configuration IDs and credential schemas are kept, so the runtime retains existing credentials. Importing the JSON into a different installation can require credentials to be entered again.

Locked flows or unavailable target types block conversion before changes. The migration can also be reopened through the Node-RED action `matterUltimate:migrate-legacy-nodes` (action list / command palette). It is offered again after an editor reload while legacy nodes remain.

## Matter commissioning

Conversion keeps configuration IDs, instance IDs (`knxultimate-matter-…` / `knxultimate-bridge-…`) and the existing `knxultimatestorage/matter` directory. Do not delete or relocate this directory: it contains commissioning data. A running legacy bridge is adopted during Deploy rather than duplicated. The controller reopens its original storage after the old controller closes.

The downloaded flow JSON is **not** a Matter storage backup. Use the existing configuration editor storage export as well when moving to another machine. Do not reset or re-pair devices solely for this package migration.

## Type mapping

| Legacy type | Standalone type |
| --- | --- |
| `matter-config` | `matter-ultimate-config` |
| `matterbridge-config` | `matter-ultimate-bridge-config` |
| `knxUltimateMatterControllerDevice` | `matterUltimateController` |
| `knxUltimateMatterBridge` | `matterUltimateBridge` |
