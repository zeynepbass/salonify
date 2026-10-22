const TURKISH_MAP = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u" };

export function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[çğıiöşü]/g, (char) => TURKISH_MAP[char])
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(query) {
  const normalized = normalizeText(query);
  return normalized ? normalized.split(" ") : [];
}

export function matchesSearch(fields, query) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return true;

  const haystack = fields.map(normalizeText).join(" ");
  return tokens.every((token) => haystack.includes(token));
}

export function filterBySearch(items, query, getFields) {
  if (!Array.isArray(items)) return [];
  if (tokenize(query).length === 0) return items;
  return items.filter((item) => matchesSearch(getFields(item), query));
}
