import type { Metadata } from "next";
import NotFoundClient from "./_not-found-client";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundClient />;
}
