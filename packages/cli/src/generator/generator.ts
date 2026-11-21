import { ProgramNode, RouteNode } from "../parser/ast.js";
import { routeModuleName } from "./routeModuleName.js";
import { markedLine, readTemplate, replaceMarkedLine } from "./templateReader.js";

export interface GeneratedFiles {
  authTypesCode: string;
  appRoutesCode: string;
}

/** Renders real .ts/.tsx source templates; only DSL-driven values are generated. */
export class CodeGenerator {
  constructor(
    private readonly ast: ProgramNode,
    private readonly modulesImportPath: string = "../modules",
  ) {}

  public generate(): GeneratedFiles {
    return {
      authTypesCode: this.generateAuthTypes(),
      appRoutesCode: this.generateAppRoutes(),
    };
  }

  private generateAuthTypes(): string {
    const template = readTemplate("react", "routes-rbac", "authTypes.ts");
    const roles = ['"PUBLIC"', ...this.ast.profiles.map((p) => JSON.stringify(p.name))];
    return replaceMarkedLine(template, "@policyforges:roles", `export type AppRole = ${roles.join(" | ")};`);
  }

  private generateAppRoutes(): string {
    let template = readTemplate("react", "routes-rbac", "AppRoutes.tsx");
    const importExample = markedLine(template, "@policyforges:public-import");
    const publicExample = markedLine(template, "@policyforges:public-route");
    const protectedExample = markedLine(template, "@policyforges:protected-route");

    const imports = this.ast.routes.filter((route) => route.isPublic).map((route) => {
      const component = routeModuleName(route.path);
      return importExample
        .replaceAll("ExampleScreen", component)
        .replace(`../modules/${component}`, `${this.modulesImportPath}/${component}`);
    });

    const declarations = this.ast.routes.map((route) =>
      this.buildRouteJSX(route, route.isPublic ? publicExample : protectedExample),
    );
    template = replaceMarkedLine(template, "@policyforges:public-import", imports.join("\n"));
    template = replaceMarkedLine(template, "@policyforges:public-route", "");
    template = replaceMarkedLine(template, "@policyforges:protected-route", declarations.join("\n"));
    return template;
  }

  private buildRouteJSX(route: RouteNode, example: string): string {
    if (route.isPublic) {
      return example.replaceAll("ExampleScreen", routeModuleName(route.path))
        .replace('"/public-example"', JSON.stringify(route.path));
    }
    return example.replace('"/protected-example"', JSON.stringify(route.path))
      .replace('chunkName="example-chunk"', `chunkName={${JSON.stringify(route.chunkName)}}`);
  }
}
