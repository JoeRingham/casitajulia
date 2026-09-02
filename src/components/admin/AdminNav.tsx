"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

/**
 * The full admin sidebar nav, in the order we want it. Rendered via
 * `admin.components.beforeNavLinks`; every collection/global sets
 * `admin.group: false` so Payload's own auto-nav stays empty and this is the
 * whole list.
 */
const SECTIONS: {
  heading: string | null;
  links: { label: string; href: string }[];
}[] = [
  {
    heading: null,
    links: [{ label: "Bookings", href: "/admin/collections/bookings" }],
  },
  {
    heading: "Content",
    links: [
      { label: "General", href: "/admin/globals/general" },
      { label: "The Villa", href: "/admin/collections/villaContent" },
      { label: "Stay Guide", href: "/admin/collections/stayGuideContent" },
      { label: "Media", href: "/admin/collections/media" },
    ],
  },
  {
    heading: "Admin",
    links: [{ label: "Users", href: "/admin/collections/users" }],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <Fragment>
      {SECTIONS.map((section) => (
        <div key={section.heading ?? "top"} style={{ marginBottom: 10 }}>
          {section.heading ? (
            <div
              style={{
                padding: "10px 0 4px",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--theme-elevation-450)",
              }}
            >
              {section.heading}
            </div>
          ) : null}
          {section.links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                className="nav__link"
                href={link.href}
                prefetch={false}
              >
                {active ? <div className="nav__link-indicator" /> : null}
                <span className="nav__link-label">{link.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </Fragment>
  );
}

export default AdminNav;
