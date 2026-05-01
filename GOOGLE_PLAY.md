# FluffyQuest — Google Play Store Deployment Guide

## Overview

FluffyQuest is a Progressive Web App (PWA) that can be published to Google Play
using a **Trusted Web Activity (TWA)** — a Chrome Custom Tab that renders the
game full-screen, indistinguishable from a native app.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| Android Studio | latest | https://developer.android.com/studio |
| Bubblewrap CLI | latest | `npm i -g @bubblewrap/cli` |
| Java JDK | ≥ 11 | bundled with Android Studio |

---

## Step 1 — Host the game publicly

The TWA app **loads a live URL**, so you need the game deployed to HTTPS.

### Option A — GitHub Pages (free, easy)
```bash
git push origin main:gh-pages
# Your game will be at: https://<you>.github.io/<repo>/
```

### Option B — Any HTTPS host
Upload the following files/folders to your web host:
```
index.html
game.js
phaser.min.js
manifest.json
sw.js
icons/
assets/
.well-known/
```

---

## Step 2 — Prepare app icons

Replace the placeholder icons before publishing:

| File | Size | Usage |
|------|------|-------|
| `icons/icon-192.png` | 192×192 | Android home-screen icon |
| `icons/icon-512.png` | 512×512 | Play Store listing |

Also create `icons/icon-maskable-512.png` (512×512 with 20% safe-zone padding
around the artwork) for adaptive icon support.

Update `manifest.json` `icons` array to reference the maskable version:
```json
{ "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
```

---

## Step 3 — Link your domain to your Play Store app

Edit `.well-known/assetlinks.json` and replace the placeholders:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourcompany.fluffyquest",
      "sha256_cert_fingerprints": [
        "AB:CD:EF:..."
      ]
    }
  }
]
```

To get the SHA-256 fingerprint:
```bash
# From your Play Store upload keystore:
keytool -list -v -keystore upload-keystore.jks -alias upload
```
Or find it in **Google Play Console → App Integrity → App signing → SHA-256**.

The `assetlinks.json` file **must be reachable** at:
`https://yourdomain.com/.well-known/assetlinks.json`

---

## Step 4 — Generate the Android project with Bubblewrap

```bash
cd /path/to/output-directory
bubblewrap init --manifest https://yourdomain.com/manifest.json
```

Bubblewrap will prompt you for:
- **Package name** e.g. `com.yourcompany.fluffyquest`
- **App version** e.g. `1`
- **Signing key** — create one or use an existing keystore
- **Minimum API level** — use `21` (Android 5.0+)

After `init`:
```bash
bubblewrap build
```

This produces an `app-release-signed.apk` and `app-release-signed.aab`
(Android App Bundle — required for Play Store submission).

---

## Step 5 — Submit to Google Play Console

1. Go to https://play.google.com/console and create a new app.
2. Upload the `.aab` file under **Production → Create new release**.
3. Fill in store listing: title, description, screenshots, rating questionnaire.
4. Set **Content rating** (likely Everyone / Everyone 10+).
5. **Required screenshots**: phone (at least 2), tablet optional.
6. Submit for review (typically 1–3 business days).

---

## Updating the game

1. Bump the version string in `index.html`:
   ```html
   <script src="game.js?v=1.0.1" defer></script>
   ```
2. Bump `CACHE_VERSION` in `sw.js`:
   ```js
   const CACHE_VERSION = 'v1.0.1';
   ```
3. Deploy updated files to your host.
4. For a new Play Store release, increment the `versionCode` in the Bubblewrap
   project's `twa-manifest.json` and rebuild.

---

## Alternative: Capacitor (full native wrapper)

If you need native APIs (push notifications, in-app purchases, etc.):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init FluffyQuest com.yourcompany.fluffyquest --web-dir .
npx cap add android
npx cap sync
npx cap open android   # Opens Android Studio
```

In Android Studio → Build → Generate Signed Bundle/APK for Play Store.

---

## Performance Summary

The following optimisations are already applied:

| Change | Before | After |
|--------|--------|-------|
| Total web-served assets | 242 MB | 27 MB |
| FrostTile.png | 7.4 MB | 1.4 MB |
| ZapTile.png | 7.6 MB | 1.8 MB |
| flametile.png | 7.0 MB | 1.5 MB |
| Shopkeeper.png | 11 MB | 2.8 MB |
| Forest.png | 6.8 MB | 2.6 MB |
| Town.png | 5.0 MB | 2.0 MB |
| guineapiglich.png | 2.0 MB | 616 KB |
| raccoonbandit.png | 2.0 MB | 500 KB |
| rangersheet.png | 2.5 MB | 692 KB |
| wizardsheet.png | 2.4 MB | 660 KB |
| All _anim sprites | 500-700 KB each | 144-216 KB each |
| Skill icons | 460-490 KB each | 140-160 KB each |
| Phaser.js | CDN (network req) | Local (cached) |
| Repeat loads | No caching (Date.now) | Service Worker + cache-first |
| Special tile 404s | 3 per load | 0 |

Unused source art (original 22-27 MB sprite sheets, duplicate Load Screen.png, etc.)
has been moved to `source_art/` — it is not served to web users or bundled in the
TWA/Capacitor app.
