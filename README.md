# Fast Xtream Channel Viewer for Vercel

This is the Xtream-only version.

Files:

- `index.html`
- `api/xtream.js`
- `package.json`
- `README.md`

Features:

- Xtream Codes login only
- No M3U URL input section
- Fast category loading
- Search
- Copy stream URL
- Download single-channel `.m3u`
- Automatic `.ts` / `.m3u8` detection from Xtream `container_extension`
- Vercel proxy included

Deploy:

Upload this folder to GitHub, then import it into Vercel.

Server URL should be the base server only, for example:

http://example.com:8080

Do not include:

/player_api.php
/get.php
/live/username/password/
