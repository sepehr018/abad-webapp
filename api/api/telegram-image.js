export default async function handler(req, res) {
  try {
    const fileId = req.query.file_id;
    if (!fileId) return res.status(400).send("file_id is required");

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) return res.status(500).send("Missing BOT_TOKEN env var");

    // 1) getFile => file_path
    const r1 = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const j1 = await r1.json();

    if (!j1.ok) {
      console.error("getFile failed:", j1);
      return res.status(400).json(j1);
    }

    const filePath = j1.result.file_path;

    // 2) دانلود فایل و استریم به کلاینت
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const r2 = await fetch(fileUrl);

    if (!r2.ok) {
      return res.status(400).send("Failed to download file");
    }

    // content-type
    const ct = r2.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", ct);

    // cache کم
    res.setHeader("Cache-Control", "no-store");

    const buf = Buffer.from(await r2.arrayBuffer());
    return res.status(200).send(buf);
  } catch (e) {
    console.error("telegram-image api error:", e);
    return res.status(500).send(e.message || String(e));
  }
}
