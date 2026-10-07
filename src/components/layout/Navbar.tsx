"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logomark } from "@/components/layout/Logomark";
import { SyntheticDataBadge } from "@/components/layout/SyntheticDataBadge";

const links = [
  { href: "/upload", label: "Upload Data" },
  { href: "/screening", label: "Screening" },
  { href: "/match", label: "Trial Matching" },
  { href: "/protocol-intelligence", label: "Protocol Intelligence" },
  { href: "/recruitment-radar", label: "Recruitment Radar" },
  { href: "/validation", label: "Validation" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-navy-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logomark />
          <span className="text-base font-semibold tracking-tight text-navy-900">
            TrialFit <span className="text-teal-600">AI</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-navy-800 text-white"
                    : "text-navy-700 hover:bg-navy-900/5 hover:text-navy-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <SyntheticDataBadge className="hidden sm:inline-flex" />
        </div>
      </div>

      <nav aria-label="Primary, mobile" className="flex gap-1 overflow-x-auto border-t border-navy-900/5 px-4 py-2 lg:hidden">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ${
                active ? "bg-navy-800 text-white" : "text-navy-700"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
