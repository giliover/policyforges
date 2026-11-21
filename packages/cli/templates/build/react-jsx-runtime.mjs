// JSX runtime adapter for remote chunks.
// Keep React 18/19 JSX creation on the HOST's React instance instead of
// bundling the react/jsx-runtime package from the CLI's node_modules.
// This file is resolved as the virtual module `react/jsx-runtime` by esbuild.

function hostReact() {
  const react = typeof window !== "undefined" ? window.React : undefined;
  if (!react || typeof react.createElement !== "function") {
    throw new Error(
      "PolicyForges: window.React is unavailable. Mount AuthProvider before loading protected modules.",
    );
  }
  return react;
}

// React's JSX transform supplies the key separately from props.
// createElement handles key/ref/children across React 18 and React 19.
export function jsx(type, props, key) {
  const react = hostReact();
  const config = props == null ? {} : { ...props };
  if (key !== undefined) config.key = key;
  return react.createElement(type, config);
}

export const jsxs = jsx;
export const jsxDEV = jsx;

// A Fragment symbol is stable across supported React versions.
// Using Symbol.for avoids accessing window.React at module evaluation time.
export const Fragment = Symbol.for("react.fragment");
