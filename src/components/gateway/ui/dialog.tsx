"use client";
import React, {
  createContext,
  useContext,
  useId,
  useRef,
  useEffect,
  useState,
} from "react";
import { Modal } from "@/components/ui/modal";
const Context = createContext({
  open: false,
  onOpenChange: (_value: boolean) => {
    void _value;
  },
  title: "",
  description: "",
});
export function Dialog({
  open: controlled,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [local, setLocal] = useState(false);
  const open = controlled ?? local;
  const setOpen = onOpenChange ?? setLocal;
  const title = useId(),
    description = useId();
  return (
    <Context.Provider
      value={{ open, onOpenChange: setOpen, title, description }}
    >
      {children}
    </Context.Provider>
  );
}
export function DialogTrigger({
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  const c = useContext(Context);
  if (!React.isValidElement(children)) return null;
  return React.cloneElement(
    children as React.ReactElement<{ onClick: () => void }>,
    { onClick: () => c.onOpenChange(true) },
  );
}
export function DialogContent({
  children,
  closeDisabled,
  className = "",
}: {
  children: React.ReactNode;
  closeDisabled?: boolean;
  className?: string;
  onCloseAutoFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
}) {
  const c = useContext(Context);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!c.open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = content.current;
    const focusable = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        ) || [],
      );
    focusable()[0]?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        e.preventDefault();
        node?.focus();
        return;
      }
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault();
        items.at(-1)?.focus();
      } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
        e.preventDefault();
        items[0]?.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [c.open]);
  return (
    <Modal
      isOpen={c.open}
      onClose={() => {
        if (!closeDisabled) c.onOpenChange(false);
      }}
      showCloseButton={!closeDisabled}
      className={"m-4 max-w-2xl p-6 sm:p-8 " + className}
    >
      <div
        ref={content}
        role="dialog"
        aria-modal="true"
        aria-labelledby={c.title}
        aria-describedby={c.description}
        tabIndex={-1}
        className="custom-scrollbar max-h-[80vh] space-y-5 overflow-y-auto"
      >
        {children}
      </div>
    </Modal>
  );
}
export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const c = useContext(Context);
  return <h2 {...props} id={c.title} />;
}
export function DialogDescription(
  props: React.HTMLAttributes<HTMLParagraphElement>,
) {
  const c = useContext(Context);
  return <p {...props} id={c.description} />;
}
