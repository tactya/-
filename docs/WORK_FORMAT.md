# Work format v1

`formatVersion: 1`. Root: id, title, description, category, cover, updatedAt, phone, apps, data, nodes, variables, mode. See executable Zod definition in src/schema.ts.

Phone includes owner, passcode, wallpaper preset, theme, time, battery, network and notification preference. Apps include stable id, editable name, visible/dock flags, folder and editable icon text. Data maps app IDs to Item arrays. Nodes contain stable ID, type, event/target, typed conditions and logic, actions, successors, once flag and canvas position.

Assets currently use safe image/audio/video data URLs embedded in Items. Work JSON and ZIP backups contain all media, but content-addressed deduplication and separate asset blobs are not yet implemented.

Import constraints: at most 100 MB input / declared total ZIP unpacked size; JSON is rechecked after decoding. Reject unexpected format versions and Zod-invalid data. Reject ZIP path traversal or normalized unsafe original paths. Only allow data URLs for specified raster image and audio/video MIME types; SVG, remote media and script URLs are rejected. Rich text is structured, never injected as raw HTML.

ZIP backup has `work.json` and explanatory README. Independent player ZIP has separate runtime assets and `work.json`, plus licenses. Importing creates a new Work ID to avoid overwriting existing projects.

Version migrations: current release accepts v1 only; no historical versions exist. Unsupported versions fail explicitly. Add tested migrations before introducing v2. Player saves are keyed by Work ID and record updatedAt revision; changed revisions start fresh progress with a message.

## 0.2.0 additive app fields

Each apps[] record includes `installed:boolean` with a true default for old v1 records. `visible` controls only home-screen presence. Uninstall sets installed=false, visible=false, dock=false. Retained data remains under data[appId]; explicit deletion removes that key. Reinstall restores the same app metadata and any retained items, or initializes an empty array. App order, folder, icon (safe raster data URL or text), name and all flags survive JSON/ZIP and standalone export. No IndexedDB namespace is changed, and no legacy app is automatically uninstalled.

## 0.3 additions (compatible v1)

Item.meta: bounded string key/value metadata, default {}. StoryNode.delayMs: optional integer 0–86400000, default scheduling duration1000ms. Runtime.ui stores string/number/boolean/string[] state by app; elapsedMs, clockRemainderMs, scheduled and incomingCall are optional save-only fields. Imported Work does not accept executable scripts or arbitrary HTML.

Item.avatar is an additive v1 string field, defaulting to empty for legacy works. Uploaded PNG/JPEG/WebP data URLs follow the existing media validation rules and travel with JSON/ZIP exports. Runtime read state remains separate from author data.
