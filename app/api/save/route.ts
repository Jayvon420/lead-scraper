import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { store_name, website, emails, page_url } = await req.json();

    if (!emails?.length) {
      return new Response(JSON.stringify({ message: "No emails found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let inserted = 0;
    let skipped = 0;

    for (const email of emails) {
      const result = await db.execute({
        sql: `
          INSERT OR IGNORE INTO leads
          (store_name, website, email, page_url)
          VALUES (?, ?, ?, ?)
        `,
        args: [store_name, website, email, page_url],
      });

      result.rowsAffected === 1 ? inserted++ : skipped++;
    }

    return new Response(JSON.stringify({ success: true, inserted, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);

    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
