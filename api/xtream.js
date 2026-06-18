export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { host, user, pass, action, playlist } = req.query;

    let targetUrl = "";

    if (playlist) {
      targetUrl = String(playlist);
    } else {
      if (!host || !user || !pass || !action) {
        return res.status(400).json({
          error: "Missing parameters",
          required: ["host", "user", "pass", "action"]
        });
      }

      const cleanHost = String(host).replace(/\/$/, "");

      const params = new URLSearchParams();
      params.set("username", String(user));
      params.set("password", String(pass));
      params.set("action", String(action));

      // Pass through optional Xtream parameters like category_id
      for (const [key, value] of Object.entries(req.query)) {
        if (!["host", "user", "pass", "action", "playlist"].includes(key)) {
          params.set(key, String(value));
        }
      }

      targetUrl = `${cleanHost}/player_api.php?${params.toString()}`;
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 Vercel IPTV Proxy",
        "Accept": "*/*"
      }
    });

    const contentType = response.headers.get("content-type") || "text/plain";
    const body = await response.text();

    res.setHeader("Content-Type", contentType);

    // Make upstream failures visible instead of hiding them
    if (!response.ok) {
      return res.status(response.status).send(body || `Upstream error ${response.status}`);
    }

    return res.status(200).send(body);

  } catch (err) {
    return res.status(500).json({
      error: "Proxy failed",
      message: err.message || String(err)
    });
  }
}
