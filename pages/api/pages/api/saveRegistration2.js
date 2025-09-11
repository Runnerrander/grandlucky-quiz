export default function handler(req, res) {
  const id = (req.query.session_id || "").toString();
  const tail = id ? id.slice(-4).toUpperCase() : "TEST";
  res.status(200).json({
    ok: true,
    username: `GL-${tail}`,
    password: `PASS-${tail}`,
  });
}
