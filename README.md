# Fast IPTV Channel Viewer + Player for Vercel

This version includes:

- Xtream login support
- M3U playlist URL support
- Vercel proxy for Xtream and M3U loading
- Built-in video player
- HLS.js playback
- Stream proxy with M3U8 segment rewriting
- Category grouping
- Search
- Copy stream URL
- Download single-channel `.m3u`
- Automatic `.ts` / `.m3u8` detection from Xtream `container_extension`

Files:

- `index.html`
- `api/xtream.js`
- `api/stream.js`
- `package.json`

Notes:

Vercel can be used for testing, but live video proxying may hit bandwidth/time limits. If playback fails but Copy URL or Download .M3U works in VLC, the provider or Vercel may be blocking/protecting the stream.
