import type { AppRoute, Screen } from "./types";

const LISTS_PATH = "/lists";

export function routeFromLocation(pathname: string): AppRoute {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/" || normalized === "") {
    return { screen: "landing" };
  }

  if (normalized === LISTS_PATH) {
    return { screen: "pickList" };
  }

  const match = normalized.match(/^\/lists\/([^/]+)(?:\/(loading|results))?$/);
  if (match) {
    const listId = decodeURIComponent(match[1]);
    const suffix = match[2];
    if (suffix === "loading") {
      return { screen: "loadingResults", listId };
    }
    if (suffix === "results") {
      return { screen: "results", listId };
    }
    return { screen: "modifyList", listId };
  }

  return { screen: "landing" };
}

export function pathFromRoute(route: AppRoute): string {
  switch (route.screen) {
    case "landing":
      return "/";
    case "pickList":
      return LISTS_PATH;
    case "modifyList":
      return route.listId ? `/lists/${encodeURIComponent(route.listId)}` : LISTS_PATH;
    case "loadingResults":
      return route.listId ? `/lists/${encodeURIComponent(route.listId)}/loading` : LISTS_PATH;
    case "results":
      return route.listId ? `/lists/${encodeURIComponent(route.listId)}/results` : LISTS_PATH;
  }
}

export function routeTitle(route: AppRoute) {
  switch (route.screen) {
    case "landing":
      return "Shopping Saver";
    case "pickList":
      return "Pick List";
    case "modifyList":
      return "Edit List";
    case "loadingResults":
      return "Loading Results";
    case "results":
      return "Comparison Results";
  }
}

export function isWeb() {
  return typeof window !== "undefined" && typeof window.history !== "undefined";
}

export function pushRoute(route: AppRoute, replace = false) {
  if (!isWeb()) return;
  const path = pathFromRoute(route);
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
}

export function getCurrentRoute(): AppRoute {
  if (!isWeb()) {
    return { screen: "landing" };
  }
  return routeFromLocation(window.location.pathname);
}
