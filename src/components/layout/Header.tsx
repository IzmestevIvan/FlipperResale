"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { MessageSquare, Plus, User, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🐬</span>
          <span className="font-bold text-lg text-gray-900 hidden sm:block">FlipperMarket</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск Flipper Zero..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          {session ? (
            <>
              <Link href="/listings/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Продать
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" size="sm">Войти</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
