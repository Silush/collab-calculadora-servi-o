import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { 
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }, 
    ...init 
  });
  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch (e) {
    throw new Error(`Failed to parse response: ${res.statusText}`);
  }
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json.data;
}