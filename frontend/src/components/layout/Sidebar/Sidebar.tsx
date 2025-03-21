import { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Settings } from "lucide-react";
import Logo from "@/assets/inclasslogo.svg";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserClassrooms, getUserEnrollments } from "@/services/api/user";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

interface SidebarProps {
  className?: string;
}

interface Classroom {
  id: string;
  name: string;
  section?: string;
  isTeacher: boolean;
}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  const { user } = useAuthStore();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const location = useLocation();

  const mainNavItems = [
    {
      to: "/classes",
      icon: <BookOpen className="h-5 w-5" />,
      label: "My Classrooms",
    },
  ];

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user?.userId) return;

      try {
        const [ownedClassrooms, enrollments] = await Promise.all([
          getUserClassrooms(user.userId),
          getUserEnrollments(user.userId),
        ]);

        const formattedClassrooms = [
          ...ownedClassrooms.map((classroom: any) => ({
            id: classroom.id,
            name: classroom.name,
            section: classroom.section,
            isTeacher: true,
          })),
          ...enrollments.map((enrollment: any) => ({
            id: enrollment.id,
            name: enrollment.name,
            section: enrollment.section,
            isTeacher: false,
          })),
        ];

        setClassrooms(formattedClassrooms);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchClassrooms();
  }, [user?.userId]);

  const teachingClassrooms = classrooms.filter((c) => c.isTeacher);
  const enrolledClassrooms = classrooms.filter((c) => !c.isTeacher);

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200",
        className
      )}
    >
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
        <Link
          to="/classes"
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

      <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              icon={item.icon}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {teachingClassrooms.length > 0 && (
          <div className="mt-6">
            <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Teaching
            </h3>
            <div className="space-y-1">
              {teachingClassrooms.map((classroom) => {
                const isClassroomActive = location.pathname.includes(
                  `/classroom/${classroom.id}`
                );

                const avatarUrl = getAvatarUrl({
                  name: classroom.name,
                  size: 32,
                  rounded: true,
                  bold: true,
                });

                return (
                  <Link
                    key={classroom.id}
                    to={`/classroom/${classroom.id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
                      "transition-colors duration-200",
                      isClassroomActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <img
                      src={avatarUrl}
                      alt={classroom.name}
                      className="w-9 h-9 rounded-full mt-0.5"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{classroom.name}</span>
                      {classroom.section && (
                        <span className="text-xs text-gray-500">
                          {classroom.section}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {enrolledClassrooms.length > 0 && (
          <div className="mt-6">
            <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Enrolled
            </h3>
            <div className="space-y-1">
              {enrolledClassrooms.map((classroom) => {
                const isClassroomActive = location.pathname.includes(
                  `/classroom/${classroom.id}`
                );

                const avatarUrl = getAvatarUrl({
                  name: classroom.name,
                  size: 32,
                  rounded: true,
                  bold: true,
                });

                return (
                  <Link
                    key={classroom.id}
                    to={`/classroom/${classroom.id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
                      "transition-colors duration-200",
                      isClassroomActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <img
                      src={avatarUrl}
                      alt={classroom.name}
                      className="w-9 h-9 rounded-full mt-0.5"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{classroom.name}</span>
                      {classroom.section && (
                        <span className="text-xs text-gray-500">
                          {classroom.section}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {/* 
        <div className="mt-auto pt-4 border-t border-gray-200">
          <NavLink
            to="/settings"
            icon={<Settings className="h-5 w-5" />}
          >
            Settings
          </NavLink>
        </div> */}
      </div>
    </aside>
  );
};

// NavLink Component remains the same
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
      <figure>{icon}</figure>
      <span className="flex-1">{children}</span>
    </Link>
  );
};

export default Sidebar;
