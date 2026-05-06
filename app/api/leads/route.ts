import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";

const db = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limitParam = searchParams.get("limit") || "10";

    const limit = limitParam === "all" ? 999999 : Number(limitParam);

    const offset = (page - 1) * limit;

    let base = `FROM leads`;
    const args: any[] = [];

    if (search) {
      base += ` WHERE store_name LIKE ? OR email LIKE ?`;
      args.push(`%${search}%`, `%${search}%`);
    }

    /* DATA */
    const data = await db.execute({
      sql: `
        SELECT store_name, website, email, page_url
        ${base}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limit, offset],
    });

    /* COUNT */
    const count = await db.execute({
      sql: `
        SELECT COUNT(*) as total
        ${base}
      `,
      args,
    });

    const total = Number(count.rows[0].total);

    return NextResponse.json({
      data: data.rows,
      page,
      limit,
      total,
      hasNext: offset + limit < total,
      hasPrev: page > 1,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await db.execute({
      sql: `DELETE FROM leads`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to delete leads" },
      { status: 500 },
    );
  }
}
