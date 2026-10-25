# App development

App definitions live in `src/registry.ts`. Add a stable ID, display name, engine kind, legal generic Lucide icon, color and navigation tabs. Register app settings in a Work and add default Items. Unknown custom IDs fall back to the document engine.

The shared Phone routes through engine kind, so adding templates does not require rebuilding the phone shell. Each Item supports ID, title/conversation, sender, time, type, text, structured rich text, safe media, folder/tab, hidden status, unlock variable, password, favorites, read flag, fictional likes and comments.

For full app-specific behavior, introduce typed engine records (contacts, threads, group members, replies, order status, playlists) and registered Editor/Player components, with migrations from format v1. Keep messaging and story state separate from UI skins. Existing 47 names are templates, not claims of complete feature parity with their real counterparts.

Brand assets must carry explicit compatible rights. Do not copy official product icon bundles or proprietary fonts. Do not imply affiliation. Replaceable app icon text and color are currently supported; custom icon bitmap upload is supported.

## 0.2.0 app lifecycle and independent skins

Register all catalog identities as before, but use `installed` to control availability and `visible` to control home membership. Use helpers in apps.ts rather than deleting app metadata for uninstall. Explicit content removal is the only uninstall branch that deletes data[appId]. Keep author confirmation and preserve story references for author repair.

WeChat, WhatsApp and Instagram now have independent components in AppSkins.tsx, selected inside existing AppContent. They receive filtered Items and existing read/edit/add callbacks. Add future independent skins at that boundary rather than replacing Phone, store, engine or the exporter. In 0.3.0 skins/catalog.tsx registers 42 further components, grouped into lazy-loaded System/Messaging/Social/Media/Commerce modules. Calculator and settings retain existing dedicated UI. Use fields.ts for bounded app metadata. Use useSkinState for persisted player state and invoke read callbacks on authored content access. Primary page coverage still does not imply full platform parity.

## 0.4 appearance

AppArtwork.tsx has code-redrawn app artwork. Do not call these official files or claim pixel fidelity. AppIcon keeps user-provided image/text overrides first. ios18.css sets canonical device-point metrics with uniform zoom; avoid adding per-viewport internal dimensions again. Keep brand/app skins separate from host Studio styling. Player-only root headers may be visually clipped; detail navigation remains available. BRAND_NOTICE.txt ships with Studio and exported players.
