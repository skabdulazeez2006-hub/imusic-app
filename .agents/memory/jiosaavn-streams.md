---
name: JioSaavn full stream URLs
description: How to get full 320kbps song streams from JioSaavn's web API for iMusic
---

## The rule
JioSaavn's public web API at `www.jiosaavn.com/api.php` is accessible from Replit and returns encrypted stream URLs. Decrypt with DES-ECB key `38346591`, strip padding bytes `[\x00-\x08]`, replace `_96.mp4` → `_320.mp4`.

## Flow
1. Search: `GET https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=<song+artist>`
2. Extract `songs.data[0].id`
3. Details: `GET https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=<id>`
4. Extract `[id].encrypted_media_url`
5. Decrypt: `crypto.createDecipheriv("des-ecb", Buffer.from("38346591"), "")`, `setAutoPadding(false)`
6. Strip trailing `[\x00-\x08]` padding bytes
7. Replace `_96.mp4` or `_160.mp4` → `_320.mp4`

**Why:** Node.js 24 uses OpenSSL 3 which disables legacy ciphers including DES-ECB. Must set `NODE_OPTIONS=--openssl-legacy-provider` in the API server start script.

**How to apply:** `artifacts/api-server/package.json` start script has the flag. `/songs/:id` route calls `getJioSaavnStreamUrl(name, artist)` and overwrites `streamUrl`; falls back to iTunes 30s preview if JioSaavn lookup fails.
