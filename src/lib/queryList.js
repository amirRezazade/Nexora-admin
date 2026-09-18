const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

export function queryList(rows, params, config = {}) {
  const { searchFields = [], filters = {}, defaultSort = null } = config;
  let out = rows;

  const q = (params.get("q") || "").trim().toLowerCase();
  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean);
    out = out.filter((row) =>
      tokens.every((token) =>
        searchFields.some((f) =>
          String(getPath(row, f) ?? "")
            .toLowerCase()
            .includes(token),
        ),
      ),
    );
  }

  Object.entries(filters).forEach(([key, apply]) => {
    const raw = params.getAll(key).filter(Boolean);
    if (!raw.length) return;
    const values = raw.flatMap((v) => v.split(",")).filter((v) => v && v !== "all");
    if (!values.length) return;
    out = out.filter((row) => apply(row, values, params));
  });

  const sortKey = params.get("sort") || defaultSort?.key;
  const dir = (params.get("dir") || defaultSort?.dir || "desc") === "asc" ? 1 : -1;
  if (sortKey) {
    out = [...out].sort((a, b) => {
      const av = getPath(a, sortKey);
      const bv = getPath(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      const ad = Date.parse(av);
      const bd = Date.parse(bv);
      if (!Number.isNaN(ad) && !Number.isNaN(bd) && String(av).includes("-")) return (ad - bd) * dir;
      return String(av).localeCompare(String(bv), "en", { numeric: true }) * dir;
    });
  }

  const total = out.length;
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(params.get("pageSize") || "10", 10)));
  const start = (page - 1) * pageSize;
  const data = out.slice(start, start + pageSize);
  return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
