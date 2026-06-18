export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("Missing url parameter");
    }

    const targetUrl = String(url);

    const headers = {
      "User-Agent": "Mozilla/5.0 Vercel IPTV Stream Proxy",
      "Accept": "*/*"
    };

    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const upstream = await fetch(targetUrl, { headers });

    const contentType =
      upstream.headers.get("content-type") ||
      guessContentType(targetUrl);

    const buffer = Buffer.from(await upstream.arrayBuffer());

    if (!upstream.ok) {
      res.status(upstream.status);
      return res.send(buffer);
    }

    // Rewrite HLS playlists so segment URLs also go through this proxy.
    if (
      contentType.includes("mpegurl") ||
      contentType.includes("m3u") ||
      targetUrl.toLowerCase().includes(".m3u8")
    ) {
      const text = buffer.toString("utf8");
      const rewritten = rewriteM3U8(text, targetUrl, req);

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).send(rewritten);
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store");

    const rangeHeader = upstream.headers.get("content-range");
    if (rangeHeader) {
      res.setHeader("Content-Range", rangeHeader);
      res.setHeader("Accept-Ranges", "bytes");
      res.status(206);
    } else {
      res.status(200);
    }

    return res.send(buffer);

  } catch (err) {
    return res.status(500).send("Stream proxy failed: " + (err.message || String(err)));
  }
}

function guessContentType(url) {
  const lower = String(url).toLowerCase();

  if (lower.includes(".m3u8")) return "application/vnd.apple.mpegurl";
  if (lower.includes(".ts")) return "video/mp2t";
  if (lower.includes(".mp4")) return "video/mp4";

  return "application/octet-stream";
}

function rewriteM3U8(text, baseUrl, req) {
  const origin = `https://${req.headers.host}`;

  return text.split(/\r?\n/).map(line => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return line;
    }

    let absoluteUrl;

    try {
      absoluteUrl = new URL(trimmed, baseUrl).toString();
    } catch {
      return line;
    }

    return `${origin}/api/stream?url=${encodeURIComponent(absoluteUrl)}`;
  }).join("\n");
}
