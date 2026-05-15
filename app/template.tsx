"use client";
import { motion } from "framer-motion";

// Subtle fade between routes. 280ms keeps it perceptual but never blocks
// interaction — the previous page is already gone visually before the user
// thinks about scrolling.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
