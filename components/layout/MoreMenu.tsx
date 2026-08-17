"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MoreMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 hover:underline"
      >
        More <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 flex min-w-48 flex-col rounded-md border border-brand-rose/40 bg-brand-white py-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-lg text-brand-gray hover:bg-brand-rose/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
