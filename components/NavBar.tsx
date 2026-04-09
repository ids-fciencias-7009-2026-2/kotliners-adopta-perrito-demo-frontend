"use client";

import Link from "next/link";

interface NavBarProps {
  onLogout: () => void;
}

export default function NavBar({ onLogout }: NavBarProps) {
  return (
    <div className="navbar bg-primary text-primary-content shadow-md px-4">
      <div className="flex-1">
        <span className="text-xl font-bold">🐾 Colitas Felices</span>
      </div>
      <div className="flex-none gap-2">
        <Link href="/perfil" className="btn btn-ghost btn-sm">
          👤 Mi perfil
        </Link>
        <button onClick={onLogout} className="btn btn-secondary btn-sm">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
