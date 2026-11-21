// Virtual ESM shim used while bundling protected browser modules.
// Maintained as JavaScript so editors can lint and format it.
const R = (typeof window !== 'undefined' && window.React) || {};
export default new Proxy(R, { get: (target, prop) => target[prop] });
export const {
  createElement, cloneElement, isValidElement, createContext,
  Fragment, StrictMode, Suspense, Profiler, Component, PureComponent,
  Children, createRef, useState, useEffect, useContext, useReducer,
  useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect,
  useDebugValue, useDeferredValue, useTransition, useId,
  useSyncExternalStore, useInsertionEffect, useActionState,
  useOptimistic, use, memo, forwardRef, lazy, startTransition, act, version,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  __SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
} = R;
