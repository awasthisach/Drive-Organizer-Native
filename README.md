# Drive Organizer Native

Capacitor-based **Android/iOS** shell for Google Drive Organizer with **internal storage + SD card** access.

Web app (Drive API, duplicates, vault): https://github.com/awasthisach/Web-The-Perfect-VVF  
Live web: https://web-the-perfect-vvf.vercel.app

## What this repo adds

| Feature | Web only | This native app |
|---------|----------|-----------------|
| Google Drive | Yes | Yes (same React UI) |
| IndexedDB cache | Yes | Yes |
| **Phone internal storage** | No | **Yes** |
| **SD card** | No | **Yes (Android)** |
| APK / Play Store | No | Yes |

## Quick start (Android)

```bash
git clone https://github.com/awasthisach/Drive-Organizer-Native.git
cd Drive-Organizer-Native
npm install

# Build web assets then sync to Android
npm run build
npx cap add android   # first time only
npx cap sync android
npx cap open android  # opens Android Studio → Run on device/emulator
```

### Requirements
- Node 20+
- Android Studio (SDK 24+)
- On device: grant **Files / Storage** permission when prompted

## Storage permissions (Android 13+)

Already declared in `android/` after `cap add` + our patch files:

- `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` (older APIs)
- `MANAGE_EXTERNAL_STORAGE` (optional full SD access — Play policy sensitive)

Runtime permission is requested via `@capacitor/filesystem` + our `deviceStorage` helper.

## Scripts

| Script | Purpose |
|--------|--------|
| `npm run dev` | Browser only (no native storage) |
| `npm run build` | Vite production build → `dist/` |
| `npm run cap:sync` | `build` + `cap sync` |
| `npm run cap:android` | Open Android Studio |
| `npm run cap:run:android` | Run on connected device |

## Architecture

```
src/
  lib/deviceStorage.ts     # Capacitor Filesystem wrapper (internal + external)
  components/DeviceStorageBrowser.tsx  # UI: browse internal / SD, pick files
  ...                      # Same Drive Organizer UI as web (merge from Web-The-Perfect-VVF)
capacitor.config.ts
```

### Merge with full web app

1. Copy `src/` from `Web-The-Perfect-VVF` into this repo (overwrite overlapping files carefully).
2. Keep `src/lib/deviceStorage.ts` and `DeviceStorageBrowser.tsx`.
3. In `Dashboard.tsx` add a tab **Device Storage** rendering `<DeviceStorageBrowser />`.
4. `npm run cap:sync`.

## SD card notes

- Android exposes external volumes via `Directory.External` / `Directory.ExternalStorage`.
- Some OEMs mount SD under paths like `/storage/XXXX-XXXX/` — our helper lists common roots.
- iOS has no classic SD card; Files app / document picker is used instead.

## License

Private / project use — same as Drive Organizer Web.
