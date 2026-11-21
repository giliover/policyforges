import { ProgramNode } from "../parser/ast.js";
import { readTemplate } from "./templateReader.js";

/** The server is maintained as actual JavaScript in templates/server/index.js. */
export class ServerGenerator {
  constructor(private readonly ast: ProgramNode) {}

  public generateServerCode(): string {
    return readTemplate("server", "index.js");
  }

  public generatePackageJson(): string {
    return readTemplate("server", "package.json");
  }

  /** Policy-specific data, deliberately separate from executable JavaScript. */
  public generatePermissions(): string {
    const permissions: Record<string, string[]> = Object.create(null);
    for (const route of this.ast.routes) {
      if (!route.isPublic && route.chunkName) {
        permissions[route.chunkName] = route.allowedRoles;
      }
    }
    return JSON.stringify(permissions, null, 2) + "\n";
  }
}
