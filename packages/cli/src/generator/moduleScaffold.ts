import { RouteNode } from "../parser/ast.js";
import { routeModuleName } from "./routeModuleName.js";
import { readTemplate, replaceMarkedLine } from "./templateReader.js";

/** Minimal editable starter screens; protected screens must not import runtime packages. */
export function scaffoldRouteModule(route: RouteNode, firstProtectedPath?: string): string {
  if (route.isPublic && route.path === "/login") {
    const destination = firstProtectedPath || "/";
    const template = readTemplate("react", "modules", "Login.tsx");
    return replaceMarkedLine(template, "@policyforges:login-target", `    navigate(${JSON.stringify(destination)});`);
  }

  const template = readTemplate("react", "modules", route.isPublic ? "Public.tsx" : "Protected.tsx");
  return template.replaceAll("ExampleScreen", routeModuleName(route.path));
}
