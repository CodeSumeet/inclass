import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Home,
  BookOpen,
  Bell,
  ClipboardList,
  BarChart2,
  Settings,
  Search,
  Plus,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";

interface Classroom {
  id: string;
  name: string;
  teacherName: string;
  studentsCount: number;
  lastActivity: string;
  subject: string;
  progress: number;
  coverImage?: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  classroomName: string;
  status: "pending" | "submitted" | "late";
  priority: "high" | "medium" | "low";
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: "class" | "assignment" | "exam";
  datetime: string;
  classroomName: string;
}

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const isTeacher = true; // TODO: Get from user role

  // Mock data with more details
  const recentClassrooms: Classroom[] = [
    {
      id: "1",
      name: "Advanced Web Development",
      teacherName: "Dr. Sarah Smith",
      studentsCount: 25,
      lastActivity: "2h ago",
      subject: "Computer Science",
      progress: 65,
      coverImage: "/images/web-dev-cover.jpg",
    },
    // Add more classrooms...
  ];

  const upcomingEvents: UpcomingEvent[] = [
    {
      id: "1",
      title: "React Hooks Workshop",
      type: "class",
      datetime: "Today, 2:00 PM",
      classroomName: "Advanced Web Development",
    },
    // Add more events...
  ];

  const assignments: Assignment[] = [
    {
      id: "1",
      title: "React Components Assignment",
      dueDate: "Tomorrow at 11:59 PM",
      classroomName: "Advanced Web Development",
      status: "pending",
      priority: "high",
    },
    // Add more assignments...
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Inclass Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold">
              <span className="text-primary">In</span>
              <span className="text-gray-900">class</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { icon: <Home size={20} />, label: "Overview", path: "/" },
            {
              icon: <BookOpen size={20} />,
              label: "My Courses",
              path: "/courses",
            },
            {
              icon: <ClipboardList size={20} />,
              label: "Assignments",
              path: "/assignments",
            },
            {
              icon: <Calendar size={20} />,
              label: "Schedule",
              path: "/schedule",
            },
            {
              icon: <BarChart2 size={20} />,
              label: "Progress",
              path: "/progress",
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            {/* <Avatar
              src={user?.photoURL || ""}
              alt={user?.displayName || "User"}
              fallback={user?.displayName?.[0] || "U"}
            /> */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search courses, assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="relative"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="outline">Create New</Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen
                      size={24}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Courses</p>
                    <p className="text-2xl font-semibold">12</p>
                  </div>
                </div>
              </div>
              {/* Add more stat cards */}
            </div>

            {/* Recent Courses */}
            <section className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Courses</h2>
                <Button
                  variant="outline"
                  size="sm"
                >
                  View All
                </Button>
              </div>
              <div className="grid gap-4">
                {recentClassrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/classroom/${classroom.id}`)}
                  >
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      {classroom.coverImage ? (
                        <img
                          src={classroom.coverImage}
                          alt=""
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <GraduationCap
                          size={24}
                          className="text-gray-400"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {classroom.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {classroom.subject}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users size={14} />
                          <span>{classroom.studentsCount} Students</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{classroom.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <MoreVertical size={20} />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <section className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        event.type === "class"
                          ? "bg-primary/10"
                          : event.type === "assignment"
                          ? "bg-yellow-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {event.type === "class" ? (
                        <BookOpen
                          size={20}
                          className="text-primary"
                        />
                      ) : event.type === "assignment" ? (
                        <ClipboardList
                          size={20}
                          className="text-yellow-700"
                        />
                      ) : (
                        <GraduationCap
                          size={20}
                          className="text-purple-700"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.datetime}</p>
                      <p className="text-sm text-gray-500">
                        {event.classroomName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Due Assignments */}
            <section className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-6">Due Assignments</h2>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/assignment/${assignment.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          assignment.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : assignment.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {assignment.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {assignment.classroomName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock
                        size={14}
                        className="text-gray-400"
                      />
                      <span className="text-sm text-gray-500">
                        {assignment.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
