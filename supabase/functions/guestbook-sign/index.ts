const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const HCAPTCHA_SECRET = Deno.env.get('HCAPTCHA_SECRET') ?? '';
const HCAPTCHA_SITEKEY = Deno.env.get('HCAPTCHA_SITEKEY') ?? '';
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://arch2kx.pages.dev')
  .split(',')
  .map(o => o.trim())
  .filter(o => o !== '');

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Vary': 'Origin',
  };
  if (origin !== null && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

async function verifyCaptcha(token: string, ip: string | null): Promise<boolean> {
  const params = new URLSearchParams({ secret: HCAPTCHA_SECRET, response: token });
  if (HCAPTCHA_SITEKEY !== '') params.set('sitekey', HCAPTCHA_SITEKEY);
  if (ip !== null) params.set('remoteip', ip);

  const res = await fetch('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' }, origin);
  if (origin === null || !ALLOWED_ORIGINS.includes(origin)) return json(403, { error: 'forbidden' }, origin);
  if (HCAPTCHA_SECRET === '' || SERVICE_ROLE_KEY === '') return json(500, { error: 'not_configured' }, origin);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'bad_json' }, origin);
  }

  const { name, message, tz_offset, captcha } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== 'string' || typeof message !== 'string' || typeof captcha !== 'string') {
    return json(400, { error: 'bad_input' }, origin);
  }

  const cleanName = name.trim();
  const cleanMessage = message.trim();
  const offset = typeof tz_offset === 'number' && Number.isInteger(tz_offset) ? tz_offset : 0;

  if ([...cleanName].length < 1 || [...cleanName].length > 50) return json(400, { error: 'bad_name' }, origin);
  if ([...cleanMessage].length < 1 || [...cleanMessage].length > 280) return json(400, { error: 'bad_message' }, origin);
  if (offset < -720 || offset > 840) return json(400, { error: 'bad_tz_offset' }, origin);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  let captchaOk = false;
  try {
    captchaOk = await verifyCaptcha(captcha, ip);
  } catch {
    return json(502, { error: 'captcha_unavailable' }, origin);
  }
  if (!captchaOk) return json(403, { error: 'captcha_failed' }, origin);

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ name: cleanName, message: cleanMessage, tz_offset: offset }),
    });
  } catch {
    return json(502, { error: 'insert_failed' }, origin);
  }

  if (!res.ok) {
    const status = res.status === 400 && (await res.text()).includes('rate limit') ? 429 : 500;
    return json(status, { error: status === 429 ? 'rate_limited' : 'insert_failed' }, origin);
  }

  const rows = (await res.json()) as { name: string; message: string; created_at: string; tz_offset: number }[];
  const row = rows[0];
  return json(200, row === undefined ? {} : {
    name: row.name,
    message: row.message,
    created_at: row.created_at,
    tz_offset: row.tz_offset,
  }, origin);
});
