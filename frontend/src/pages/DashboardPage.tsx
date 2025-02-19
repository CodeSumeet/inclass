import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/ui/Button";
import Sidebar from "../components/Sidebar";

interface Classroom {
  id: string;
  name: string;
  section: string;
  subject: string;
  teacherName: string;
  coverImage?: string;
}

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Mock data - Replace with API call
  const enrolledClassrooms: Classroom[] = [
    {
      id: "1",
      name: "Web Development",
      section: "Section A",
      subject: "Computer Science",
      teacherName: "Dr. Sarah Smith",
    },
    {
      id: "2",
      name: "Mobile Development",
      section: "Section B",
      subject: "Computer Science",
      teacherName: "Prof. John Doe",
    },
  ];

  const handleCreateClass = () => {
    // TODO: Implement create class modal
    console.log("Create class clicked");
  };

  const handleJoinClass = () => {
    // TODO: Implement join class modal
    console.log("Join class clicked");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 lg:ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your classes and assignments
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleJoinClass}
            >
              Join class
            </Button>
            <Button onClick={handleCreateClass}>
              <Plus className="h-5 w-5 mr-2" />
              Create class
            </Button>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledClassrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white p-6 rounded-lg border border-gray-200 
                       hover:border-primary/50 transition-all duration-200 
                       shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => navigate(`/classroom/${classroom.id}`)}
            >
              {/* Class Card Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-lg text-gray-900">
                    {classroom.name}
                  </h3>
                  <p className="text-sm text-gray-500">{classroom.section}</p>
                  <p className="text-sm text-gray-500">
                    {classroom.teacherName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement class options menu
                  }}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Class Card Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">{classroom.subject}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
