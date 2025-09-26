import type { Transport } from "../types";

export function httpTransport(targetUrl: string, fetchImplementation?: typeof fetch): Transport {
  const globalFetch = (globalThis as { fetch?: typeof fetch }).fetch;
  const fetchFunction = fetchImplementation ?? globalFetch;
  return ({ record, formatted }) => {
    if (!fetchFunction) return;
    const body = JSON.stringify(formatted.json ?? record);
    fetchFunction(targetUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    }).catch(() => {});
  };
}
