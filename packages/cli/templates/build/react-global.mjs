// Virtual ESM shim used while bundling protected browser modules.
// Maintained as JavaScript so editors can lint and format it.
const R = typeof window !== "undefined" ? window.React : undefined;
if (!R || typeof R.createElement !== "function") {
  throw new Error(
    "PolicyForges: window.React is unavailable. Mount AuthProvider before loading protected modules.",
  );
}

// Expose the actual React object, not a proxy or a second React installation.
export default R;
export const {
  createElement,
  cloneElement,
  isValidElement,
  createContext,
  Fragment,
  StrictMode,
  Suspense,
  Profiler,
  Component,
  PureComponent,
  Children,
  createRef,
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useDebugValue,
  useDeferredValue,
  useTransition,
  useId,
  useSyncExternalStore,
  useInsertionEffect,
  useActionState,
  useOptimistic,
  use,
  memo,
  forwardRef,
  lazy,
  startTransition,
  act,
  version,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  __SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} = R;
