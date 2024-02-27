/* eslint-disable @typescript-eslint/no-explicit-any */
import { ofetch } from "ofetch";

type P<T> = Parameters<typeof ofetch<T, any>>;
type R<T> = ReturnType<typeof ofetch<T, any>>;

const baseFetch = ofetch.create({
  retry: 0,
  ignoreResponseError: true,
});

export function mwFetch<T>(url: string, ops: P<T>[1] = {}): R<T> {
  return baseFetch<T>(url, ops);
}
