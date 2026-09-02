"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar link to the custom `/admin/calendar` view. Rendered via
 * `admin.components.beforeNavLinks`, so it sits at the top of the nav. Uses
 * Payload's own `nav__link` classes to match the built-in links.
 */
export function CalendarNavLink() {
  const pathname = usePathname();
  const href = "/admin/calendar";
  const isActive = pathname === href;

  return (
    <Link
      className="nav__link"
      href={href}
      id="nav-calendar"
      prefetch={false}
      style={{ marginBottom: 6 }}
    >
      {isActive ? <div className="nav__link-indicator" /> : null}
      <span className="nav__link-label">Calendar</span>
    </Link>
  );
}

export default CalendarNavLink;
