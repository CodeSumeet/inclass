import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Settings, LogOut, User } from "lucide-react";
import { Button } from "./ui/Button";
import Input from "./ui/Input";
import { useAuthStore } from "../store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

const Header: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.firstName?.charAt(0) || ""} ${user?.lastName?.charAt(0) || ""}`
  )}&background=random`;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageTitle(location.pathname)}
          </h1>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 bg-gray-50"
            />
          </div>
        </div>

        {/* Right Section - Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full"
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
          >
            <div className="flex items-center gap-3 p-2">
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {user?.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/dashboard":
      return "Dashboard";
    case "/classes":
      return "My Classes";
    case "/calendar":
      return "Calendar";
    case "/notifications":
      return "Notifications";
    case "/settings":
      return "Settings";
    default:
      if (pathname.startsWith("/classroom/")) {
        return "Classroom";
      }
      return "";
  }
};

export default Header;
