/** A single mapping is used by the scaffold, React routes and secure build. */
export function routeModuleName(routePath: string): string {
  const name = routePath
    .split("/")
    .filter(Boolean)
    .flatMap((part) => part.split(/[^a-zA-Z0-9]+/).filter(Boolean))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return name ? (/^[a-zA-Z_$]/.test(name) ? name : `Route${name}`) : "Home";
}
