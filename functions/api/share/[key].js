export async function onRequestGet(context) {
  const { env, params } = context;
  const key = params.key;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!key) {
    return new Response("Missing key", { status: 400, headers: corsHeaders });
  }

  if (!env) {
    return new Response("Context env is undefined", { status: 500, headers: corsHeaders });
  }

  if (!env.KINKFORM_KV) {
    const envKeys = [];
    for (const key in env) {
      envKeys.push(key);
    }
    return new Response(`KV namespace KINKFORM_KV not bound. Available env keys: ${JSON.stringify(envKeys)}. Properties: ${Object.getOwnPropertyNames(env).join(', ')}`, { status: 500, headers: corsHeaders });
  }

  // 从 KV 获取自测表数据
  const data = await env.KINKFORM_KV.get(key);
  if (data === null) {
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }

  return new Response(data, {
    headers: { ...corsHeaders, "Content-Type": "text/plain;charset=UTF-8" },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
