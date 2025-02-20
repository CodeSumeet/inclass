import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, BookOpen, Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import Logo from "../assets/inclasslogo.svg";

interface SidebarProps {
  className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200",
        className
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <img
            src={Logo}
            alt="Logo"
            className="h-8 w-8"
          />
          <span className="text-xl font-semibold">
            <span className="text-primary">In</span>
            <span className="text-gray-900">class</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col gap-1 p-4">
        {/* Quick Actions */}
        <div className="mb-4">
          <Button
            className="w-full justify-start gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Create Class
          </Button>
        </div>

        {/* Primary Navigation */}
        <NavLink
          to="/dashboard"
          icon={<Home className="h-4 w-4" />}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/classes"
          icon={<BookOpen className="h-4 w-4" />}
        >
          My Classes
        </NavLink>
        <NavLink
          to="/calendar"
          icon={<Calendar className="h-4 w-4" />}
        >
          Calendar
        </NavLink>

        {/* Enrolled Classes */}
        <div className="mt-6">
          <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            My Classes
          </h3>
          <div className="space-y-1">
            <NavLink
              to="/classroom/1"
              className="pl-3"
            >
              <div className="truncate">
                <div className="font-medium truncate">Web Development</div>
                <div className="text-xs text-gray-500 truncate">Section A</div>
              </div>
            </NavLink>
            <NavLink
              to="/classroom/2"
              className="pl-3"
            >
              <div className="truncate">
                <div className="font-medium truncate">Mobile Development</div>
                <div className="text-xs text-gray-500 truncate">Section B</div>
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
};

// NavLink Component
interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const NavLink: FC<NavLinkProps> = ({ to, icon, children, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
        "transition-colors duration-200",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-700 hover:bg-gray-100",
        className
      )}
    >
      {icon}
      {children}
    </Link>
  );
};

export default Sidebar;
