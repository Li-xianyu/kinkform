const ipCache = new Map();
let lastCleanup = Date.now();

export default {
  async fetch(request, env, ctx) {
    const now = Date.now();
    
    // 定期清理内存防止泄漏
    if (now - lastCleanup > 60000) {
      for (const [ip, time] of ipCache.entries()) {
        if (now - time > 60000) {
          ipCache.delete(ip);
        }
      }
      lastCleanup = now;
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // POST /api/share -> Create or Extend short key
    if (url.pathname === "/api/share" && request.method === "POST") {
      try {
        // 1. IP Rate Limiting (In-Memory)
        const ip = request.headers.get("cf-connecting-ip") || "unknown";
        const now = Date.now();
        if (ip !== "unknown") {
          if (ipCache.has(ip)) {
            const lastTime = ipCache.get(ip);
            if (now - lastTime < 60000) { // 60 seconds cooldown
              return new Response(JSON.stringify({ error: "请求过于频繁，请1分钟后再试" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
          }
          ipCache.set(ip, now);
        }

        // 2. Parse JSON
        const reqJson = await request.json();
        const text = reqJson.text;
        let reqKey = reqJson.key;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          return new Response(JSON.stringify({ error: "内容不能为空" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 3. Size check
        if (text.length > 5000) {
          return new Response(JSON.stringify({ error: "内容过长，不能超过5000字符" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 4. Generate or reuse key
        let key = '';
        if (reqKey && typeof reqKey === 'string' && reqKey.length === 6 && /^[a-zA-Z0-9]+$/.test(reqKey)) {
          key = reqKey; // reuse key for extending expiration
        } else {
          const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          for (let i = 0; i < 6; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
          }
        }

        // 5. Store in KV (1 day = 86400 seconds)
        await env.KINKFORM_KV.put(key, text, { expirationTtl: 86400 });

        return new Response(JSON.stringify({ key: key }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "无效的请求" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // GET /api/share/:key -> Retrieve
    if (url.pathname.startsWith("/api/share/") && request.method === "GET") {
      const key = url.pathname.split("/").pop();
      if (!key) {
        return new Response("Missing key", { status: 400, headers: corsHeaders });
      }

      const data = await env.KINKFORM_KV.get(key);
      if (data === null) {
        return new Response("Not found", { status: 404, headers: corsHeaders });
      }

      return new Response(data, {
        headers: { ...corsHeaders, "Content-Type": "text/plain;charset=UTF-8" },
      });
    }

    // GET / -> Flashy Warning Page
    if (url.pathname === "/") {
      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WARNING</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Arial Black', sans-serif;
      overflow: hidden;
    }
    h1 {
      font-size: clamp(3rem, 10vw, 8rem);
      color: #fff;
      text-align: center;
      text-transform: uppercase;
      text-shadow: 
        0 0 10px #ff003c,
        0 0 20px #ff003c,
        0 0 40px #ff003c,
        0 0 80px #ff003c,
        0 0 120px #ff003c;
      animation: glitch 1s infinite alternate;
      user-select: none;
    }
    @keyframes glitch {
      0% { transform: translate(0) skew(0deg); opacity: 1; }
      20% { transform: translate(-5px, 5px) skew(-5deg); opacity: 0.8; }
      40% { transform: translate(5px, -5px) skew(5deg); opacity: 0.9; }
      60% { transform: translate(-2px, 2px) skew(-2deg); opacity: 1; }
      80% { transform: translate(2px, -2px) skew(2deg); opacity: 0.9; text-shadow: 0 0 10px #0ff, 0 0 40px #0ff; }
      100% { transform: translate(0) skew(0deg); opacity: 1; }
    }
  </style>
</head>
<body>
  <h1>来这里干嘛！</h1>
</body>
</html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
