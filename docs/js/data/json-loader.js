/**
 * Fetches and parses a JSON resource.
 *
 * @param {string|URL} url
 * @returns {Promise<any>}
 */
export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url}: HTTP ${response.status}`);
  }
  return response.json();
}
