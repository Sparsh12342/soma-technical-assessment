// lib/pexels.ts
export async function fetchPexelsImage(query: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key || !query?.trim()) return null;

  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");

    const res = await fetch(url.toString(), {
      headers: { Authorization: key },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    const photo = data?.photos?.[0];
    return photo?.src?.medium ?? photo?.src?.original ?? null;
  } catch {
    return null;
  }
}
