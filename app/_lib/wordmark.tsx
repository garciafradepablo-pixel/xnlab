"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Brand wordmark used in every header. On the home page, clicking it
// smooth-scrolls to the top (because navigating to "/" from "/" is a
// no-op and looks broken). On every other page, it behaves as a normal
// Next.js Link back home.
export function WordmarkLink({
  children = "XNLAB",
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      style={{
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.42em",
        color: "white",
        textTransform: "uppercase",
        textDecoration: "none",
        cursor: "pointer",
        ...style,
      }}
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }}
    >
      {children}
    </Link>
  );
}
