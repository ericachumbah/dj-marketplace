"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function Navigation() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Extract locale from pathname
  const locale = pathname.split("/")[1] || "en";

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl">
            <Image 
              src="/logo.svg" 
              alt="Mix Factory" 
              width={40} 
              height={40}
              className="h-10 w-10"
            />
            Mix Factory
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}/dj/listing`} className="hover:text-blue-100">
              Browse DJs
            </Link>
            {session?.user ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="hover:text-blue-100"
                >
                  Dashboard
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href={`/${locale}/admin`}
                    className="hover:text-blue-100"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 hover:text-blue-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href={`/${locale}/auth/signin`}
                className="flex items-center gap-2 hover:text-blue-100"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
            <div className="pl-4 border-l border-blue-400">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href={`/${locale}/dj/listing`}
              className="block px-2 py-2 hover:bg-blue-700 rounded"
            >
              Browse DJs
            </Link>
            {session?.user ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="block px-2 py-2 hover:bg-blue-700 rounded"
                >
                  Dashboard
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href={`/${locale}/admin`}
                    className="block px-2 py-2 hover:bg-blue-700 rounded"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-2 py-2 hover:bg-blue-700 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href={`/${locale}/auth/signin`}
                className="block px-2 py-2 hover:bg-blue-700 rounded"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
