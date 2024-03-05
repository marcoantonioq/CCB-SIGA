import { App } from "../app";

export function mergeObjects<T>(target: T, source: T): T {
  for (const key in source) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      target[key] = mergeObjects(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target as T;
}

export function updateApp(app: App, newApp: Partial<App>): void {
  mergeObjects(app, newApp) as App;
}
