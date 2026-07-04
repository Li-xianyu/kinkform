const ipCache = new Map();
let lastCleanup = Date.now();

export async function onRequestPost(context) {
  const { request, env } = context;
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 1. IP Rate Limiting (In-Memory)
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (ip !== "unknown") {
    if (ipCache.has(ip)) {
      const lastTime = ipCache.get(ip);
      if (now - lastTime < 60000) { // 60 seconds cooldown
        return new Response(JSON.stringify({ error: "请求过于频繁，请1分钟后再试" }), { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }
    ipCache.set(ip, now);
  }

  try {
    // 2. Parse JSON
    const reqJson = await request.json();
    const text = reqJson.text;
    let reqKey = reqJson.key;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "内容不能为空" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 3. Size check
    if (text.length > 5000) {
      return new Response(JSON.stringify({ error: "内容过长，不能超过5000字符" }), { 
        status: 413, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
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
    if (!env.KINKFORM_KV) {
      return new Response(JSON.stringify({ error: "KV 数据库未绑定，请在 Cloudflare Pages 设置中绑定 KINKFORM_KV 命名空间" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    await env.KINKFORM_KV.put(key, text, { expirationTtl: 86400 });

    return new Response(JSON.stringify({ key: key }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "无效的请求: " + e.message }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
