import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import InclassLogo from "../assets/inclasslogo.svg";
import { Button } from "./ui/Button";

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
    <header className="w-full h-[68px] bg-white border-b border-black relative shadow-sm">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center"
        >
          <img
            src={InclassLogo}
            alt="Inclass Logo"
            className="inclass-logo h-8"
          />
          <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Inclass
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex space-x-10"
          role="navigation"
        >
          {navItems.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-gray-700 hover:text-secondary transition-all duration-200"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="outline"
            size="md"
          >
            <Link to="/auth/sign-in">Log In</Link>
          </Button>
          <Button
            variant="filled"
            size="md"
          >
            <Link to="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden focus:outline-none transition-transform"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen ? "true" : "false"}
        >
          {isOpen ? (
            <X
              size={28}
              className="text-primary"
            />
          ) : (
            <Menu size={28} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden"
            onClick={toggleMenu}
          />
          <div
            className={`absolute top-[68px] left-0 w-full bg-white border-t border-border flex flex-col items-center space-y-4 py-6 z-30 shadow-lg transition-transform transform ${
              isOpen ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
            }`}
          >
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-gray-800 hover:text-secondary transition-all duration-200 text-lg"
                onClick={toggleMenu}
              >
                {label}
              </a>
            ))}

            <Button
              variant="outline"
              size="md"
              className="w-[80%]"
            >
              <Link
                to="/auth/sign-in"
                onClick={toggleMenu}
              >
                Log In
              </Link>
            </Button>
            <Button
              variant="filled"
              size="md"
              className="w-[80%]"
            >
              <Link
                to="/auth/sign-up"
                onClick={toggleMenu}
              >
                Sign Up
              </Link>
            </Button>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
