import React, { useState } from "react";
import InclassLogo from "../assets/inclasslogo.svg";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/Button";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full h-[68px] text-black bg-white border-b border-black">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={InclassLogo}
            alt="Inclass Logo"
            className="h-8"
          />
          <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Inclass
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-12">
          <a
            href="#features"
            className="hover:text-secondary transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-secondary transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="hover:text-secondary transition-colors"
          >
            Pricing
          </a>
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="outline"
            size="md"
          >
            <Link to="/login">Log In</Link>
          </Button>
          <Button
            variant="filled"
            size="md"
          >
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 bg-white border-t border-borderColor py-4">
          <a
            href="#features"
            className="hover:text-secondary transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-secondary transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="hover:text-secondary transition-colors"
          >
            Pricing
          </a>
          <Link
            to="/login"
            className="px-4 py-2 text-secondary border border-secondary rounded-full hover:bg-secondary/10 transition-colors w-[80%] text-center"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-white rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-colors w-[80%] text-center"
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
