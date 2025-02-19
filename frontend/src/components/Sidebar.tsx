import { FC, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Menu,
  X,
  Home,
  Calendar,
  Plus,
  LogOut,
  BookOpen,
  Settings,
  Bell,
} from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import { Skeleton } from "./ui/Skeleton";

interface ClassroomType {
  id: string;
  name: string;
  section: string | null;
}

interface SidebarProps {
  className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuthStore();

  // Mock data - Replace with API call
  const enrolledClassrooms: ClassroomType[] = [
    {
      id: "1",
      name: "Web Development",
      section: "Section A",
    },
    {
      id: "2",
      name: "Mobile Development",
      section: "Section B",
    },
  ];

  const handleCreateClass = () => {
    // TODO: Implement create class modal
    console.log("Create class clicked");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40",
          "w-64 transform transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-200">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <span className="text-xl font-semibold">
              <span className="text-primary">In</span>
              <span className="text-gray-900">class</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              icon={<Home size={20} />}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/classes"
              icon={<BookOpen size={20} />}
            >
              Classes
            </NavLink>
            <NavLink
              to="/calendar"
              icon={<Calendar size={20} />}
            >
              Calendar
            </NavLink>
            <NavLink
              to="/notifications"
              icon={<Bell size={20} />}
            >
              Notifications
            </NavLink>
            <NavLink
              to="/settings"
              icon={<Settings size={20} />}
            >
              Settings
            </NavLink>
          </div>

          {/* Enrolled Classes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-600">Enrolled</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateClass}
                className="hover:bg-gray-100"
              >
                <Plus size={18} />
              </Button>
            </div>
            <div className="space-y-1">
              {isLoading
                ? // Loading skeletons
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="px-3 py-2"
                    >
                      <Skeleton className="h-5 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))
                : // Enrolled classes
                  enrolledClassrooms.map((classroom) => (
                    <NavLink
                      key={classroom.id}
                      to={`/classroom/${classroom.id}`}
                      className="pl-3"
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">
                          {classroom.name}
                        </div>
                        {classroom.section && (
                          <div className="text-xs text-gray-500 truncate">
                            {classroom.section}
                          </div>
                        )}
                      </div>
                    </NavLink>
                  ))}
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    user?.profilePic ||
                    `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`
                  }
                  alt={user?.firstName}
                  className="h-8 w-8 rounded-full"
                />
                <div className="truncate">
                  <div className="text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-gray-100"
              >
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
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
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
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
