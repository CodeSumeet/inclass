import { FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

const AppLayout: FC = () => {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="fixed inset-y-0 left-0 z-30 hidden lg:block w-64" />

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className="w-full">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
