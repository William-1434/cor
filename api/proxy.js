export default async function handler(req, res) {

    const target = req.query.url;

    if (!target) {
        return res.status(400).send("Missing URL");
    }

    try {

        const response = await fetch(target, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const contentType =
            response.headers.get("content-type") || "";

        let body;

        if (
            target.includes(".m3u8") ||
            contentType.includes("mpegurl") ||
            contentType.includes("application/vnd.apple")
        ) {

            body = await response.text();

            const baseUrl = new URL(target);

            body = body
                .split("\n")
                .map(line => {

                    line = line.trim();

                    if (
                        !line ||
                        line.startsWith("#")
                    ) {
                        return line;
                    }

                    const absolute =
                        new URL(line, baseUrl).href;

                    return `/api/proxy?url=${encodeURIComponent(
                        absolute
                    )}`;

                })
                .join("\n");

            res.setHeader(
                "Content-Type",
                "application/vnd.apple.mpegurl"
            );

            res.setHeader(
                "Access-Control-Allow-Origin",
                "*"
            );

            res.setHeader(
                "Cache-Control",
                "public,max-age=5"
            );

            return res.send(body);

        }

        const arrayBuffer =
            await response.arrayBuffer();

        const buffer =
            Buffer.from(arrayBuffer);

        res.setHeader(
            "Content-Type",
            contentType || "application/octet-stream"
        );

        res.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );

        res.setHeader(
            "Cache-Control",
            "public,max-age=5"
        );

        return res.send(buffer);

    } catch (err) {

        return res.status(500).send(
            "Proxy Error: " + err.message
        );

    }

}
