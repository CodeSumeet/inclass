import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/assets/inclasslogo.svg";
import { Button } from "@/components/common";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="w-full h-[68px] bg-white border-b border-gray-200 relative shadow-sm">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
        >
          <img
            src={Logo}
            alt="Inclass Logo"
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-2xl font-semibold tracking-tight">
            <span className="text-primary">In</span>
            <span className="text-gray-900">class</span>
          </span>
        </Link>

        <nav
          className="hidden md:flex space-x-8"
          role="navigation"
        >
          {navItems.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 hover:border-primary"
          >
            <Link to="/auth/sign-in">Sign in</Link>
          </Button>
          <Button size="sm">
            <Link to="/auth/sign-up">Sign up</Link>
          </Button>
        </div>

        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen ? "true" : "false"}
        >
          {isOpen ? (
            <X
              size={24}
              className="text-gray-700"
            />
          ) : (
            <Menu
              size={24}
              className="text-gray-700"
            />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-[68px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden">
          <div className="px-4 py-4 space-y-4">
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="block text-gray-600 hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                {label}
              </a>
            ))}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                className="border-gray-200 hover:border-primary"
              >
                <Link
                  to="/auth/sign-in"
                  onClick={toggleMenu}
                >
                  Sign in
                </Link>
              </Button>
              <Button
                size="sm"
                fullWidth
              >
                <Link
                  to="/auth/sign-up"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
