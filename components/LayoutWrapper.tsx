"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login" || pathname === "/registro";

  return (
    <>
      {!hideNavbar && <NavBar />}
      {children}
    </>
  );
}