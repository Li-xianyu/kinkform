const ipCache = new Map();
let lastCleanup = Date.now();

export async function onRequestPost(context) {
  const { request, env } = context;
  const now = Date.now();

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

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (ip !== "unknown") {
    if (ipCache.has(ip)) {
      const lastTime = ipCache.get(ip);
      if (now - lastTime < 60000) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请1分钟后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    ipCache.set(ip, now);
  }

  try {
    const reqJson = await request.json();
    const { userName, categories } = reqJson;

    if (!userName || !categories || !Array.isArray(categories) || categories.length === 0) {
      return new Response(JSON.stringify({ error: "数据不完整" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({ userName, categories, timestamp: Date.now() });
    if (payload.length > 50000) {
      return new Response(JSON.stringify({ error: "数据过大" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 6; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (!env.KINKFORM_KV) {
      return new Response(JSON.stringify({ error: "KV 数据库未绑定" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await env.KINKFORM_KV.put(key, payload, { expirationTtl: 86400 });

    return new Response(JSON.stringify({ key }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "无效的请求: " + e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    },
  });
}
