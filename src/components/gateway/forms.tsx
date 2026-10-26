"use client";
import React, {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useFormStatus } from "react-dom";
import { Link as IntlLink, usePathname, useRouter } from "@/i18n/navigation";
import { submitFeature, type ActionResult } from "@/lib/gateway/actions";
type Fn = (...args: never[]) => unknown;
type Result<T> = T extends Fn
  ? Exclude<Awaited<ReturnType<T>>, Response>
  : ActionResult;
const Context = createContext<{
  path: string;
  id: string;
  search: string;
  result?: ActionResult;
  pending: boolean;
  submit: (data: FormData) => Promise<void>;
}>({ path: "", id: "", search: "", pending: false, submit: async () => {} });
export function FeatureForms({
  path,
  id = "",
  search = "",
  children,
}: {
  path: string;
  id?: string;
  search?: string;
  children: React.ReactNode;
}) {
  const [result, setResult] = useState<ActionResult>();
  const [pending, start] = useTransition();
  const submit = useCallback(
    async (data: FormData) => {
      start(async () => {
        setResult(await submitFeature(path, id, data));
      });
    },
    [path, id],
  );
  return (
    <Context.Provider value={{ path, id, search, result, pending, submit }}>
      {children}
    </Context.Provider>
  );
}
export function Form({
  method = "get",
  action,
  onSubmit,
  submit,
  pending,
  ...props
}: Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action?: string;
  submit?: (data: FormData) => Promise<void>;
  pending?: boolean;
}) {
  const context = useContext(Context);
  if (method.toLowerCase() === "get")
    return <form {...props} method="get" action={action} onSubmit={onSubmit} />;
  if (action === "/logout" || action === "/auth/google")
    return (
      <form {...props} method="post" action={action} onSubmit={onSubmit} />
    );
  return (
    <form
      {...props}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (pending ?? context.pending) return;
        const data = new FormData(
          event.currentTarget,
          (event.nativeEvent as SubmitEvent).submitter,
        );
        void (submit ?? context.submit)(data);
      }}
      aria-busy={pending ?? context.pending}
    />
  );
}
export function useFormResult<T = ActionResult>(): Result<T> | undefined {
  return useContext(Context).result as Result<T> | undefined;
}
export function useFormNavigation() {
  const c = useContext(Context);
  const status = useFormStatus();
  return {
    state: c.pending || status.pending ? "submitting" : "idle",
    formMethod: c.pending || status.pending ? "post" : undefined,
  };
}
export function useFeatureForm<T = ActionResult>() {
  const { path, id } = useContext(Context);
  const [data, setData] = useState<ActionResult>();
  const [pending, start] = useTransition();
  const submit = useCallback(
    async (form: FormData) => {
      start(async () => setData(await submitFeature(path, id, form)));
    },
    [path, id],
  );
  return {
    submit,
    data: data as Result<T> | undefined,
    state: pending ? "submitting" : "idle",
  };
}
export function useRefresh() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return {
    state: pending ? "loading" : "idle",
    revalidate: () => start(() => router.refresh()),
  };
}
export function useFeatureLocation() {
  const c = useContext(Context);
  return {
    pathname: usePathname(),
    search: c.search ? "?" + c.search : "",
    hash: useSyncExternalStore(
      subscribeHash,
      () => window.location.hash,
      () => "",
    ),
  };
}
export function useFeatureSearch() {
  return [new URLSearchParams(useContext(Context).search)] as const;
}
export function Link({
  to,
  ...props
}: Omit<React.ComponentProps<typeof IntlLink>, "href"> & { to: string }) {
  return <IntlLink {...props} href={to} />;
}

function subscribeHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
