import { getSupabaseAdmin } from "./_supabase.js";

export default async function handler(req, res) {
  try {
    const supabase = getSupabaseAdmin();

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("id", { ascending: false })
        .limit(200);

      if (error) throw error;
      return res.status(200).json({ data });
    }

    if (req.method === "PATCH") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { id, status } = body || {};

      if (!id || !status) {
        return res.status(400).json({ error: "id and status are required" });
      }

      const { data, error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return res.status(200).json({ data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("tickets api error:", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
}
