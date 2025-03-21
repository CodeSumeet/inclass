import { Button, Card, Input } from "@/components";
import { ClassCreationModal, JoinClassModal } from "@/components/common/modal";
import API from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  Users,
  BookOpen,
  School,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface Classroom {
  id: string;
  name: string;
  section?: string;
  subject?: string;
  coverImage?: string;
  teacher?: string;
  ownerId?: string;
  enrollments?: Array<{ userId: string }>;
  studentsCount?: number;
}

const ClassesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const defaultCoverImages = useMemo(
    () => [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    ],
    []
  );

  const fetchClassroomDetails = async (classroomId: string) => {
    try {
      const response = await API.get(`/classrooms/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching classroom details:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/classrooms/user/${user?.userId}`);

        const classroomsWithDetails = await Promise.all(
          response.data.map(async (classroom: Classroom) => {
            if (classroom.enrollments) {
              return {
                ...classroom,
                studentsCount: classroom.enrollments.length,
              };
            }

            if (classroom.ownerId !== user?.userId) {
              const details = await fetchClassroomDetails(classroom.id);
              if (details && details.enrollments) {
                return {
                  ...classroom,
                  enrollments: details.enrollments,
                  studentsCount: details.enrollments.length,
                };
              }
            }

            return {
              ...classroom,
              studentsCount: 0,
            };
          })
        );

        setClasses(classroomsWithDetails);
      } catch (error) {
        toast.error("Failed to fetch classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchClasses();
    }
  }, [user?.userId]);

  const filteredClasses = useMemo(
    () =>
      classes
        .map((classItem, index) => ({
          ...classItem,
          originalIndex: index,
        }))
        .filter((classItem) =>
          classItem.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [classes, searchTerm]
  );

  const handleClassCreated = async () => {
    try {
      const response = await API.get(`/classrooms/user/${user?.userId}`);

      const processedClasses = await Promise.all(
        response.data.map(async (classroom: Classroom) => {
          if (classroom.enrollments) {
            return {
              ...classroom,
              studentsCount: classroom.enrollments.length,
            };
          }

          if (classroom.ownerId !== user?.userId) {
            const details = await fetchClassroomDetails(classroom.id);
            if (details && details.enrollments) {
              return {
                ...classroom,
                enrollments: details.enrollments,
                studentsCount: details.enrollments.length,
              };
            }
          }

          return {
            ...classroom,
            studentsCount: 0,
          };
        })
      );

      setClasses(processedClasses);
      toast.success("Class created successfully!");
    } catch (error) {
      toast.error("Failed to refresh classes. Please try again.");
    }
  };

  const handleClassJoined = async () => {
    try {
      const response = await API.get(`/classrooms/user/${user?.userId}`);

      const processedClasses = await Promise.all(
        response.data.map(async (classroom: Classroom) => {
          if (classroom.enrollments) {
            return {
              ...classroom,
              studentsCount: classroom.enrollments.length,
            };
          }

          if (classroom.ownerId !== user?.userId) {
            const details = await fetchClassroomDetails(classroom.id);
            if (details && details.enrollments) {
              return {
                ...classroom,
                enrollments: details.enrollments,
                studentsCount: details.enrollments.length,
              };
            }
          }

          return {
            ...classroom,
            studentsCount: 0,
          };
        })
      );

      setClasses(processedClasses);
      toast.success("Successfully joined the class!");
    } catch (error) {
      toast.error("Failed to refresh classes. Please try again.");
    }
  };

  const taughtClasses = filteredClasses.filter(
    (c) => c.ownerId === user?.userId
  );
  const enrolledClasses = filteredClasses.filter(
    (c) => c.ownerId !== user?.userId
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Classes</h1>
          <p className="text-gray-500 mt-1">
            Manage and access your classrooms
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setIsJoinModalOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Users size={18} />
            Join Class
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <PlusCircle size={18} />
            Create Class
          </Button>
        </div>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="w-full pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-10">
          {taughtClasses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <School className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Classes You Teach</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {taughtClasses.map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    classroom={classItem}
                    defaultImage={
                      defaultCoverImages[
                        classItem.originalIndex % defaultCoverImages.length
                      ]
                    }
                    isTeaching
                  />
                ))}
              </div>
            </div>
          )}

          {enrolledClasses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  Classes You're Enrolled In
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledClasses.map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    classroom={classItem}
                    defaultImage={
                      defaultCoverImages[
                        classItem.originalIndex % defaultCoverImages.length
                      ]
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {filteredClasses.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No classes found
              </h3>
              <p className="text-gray-500 mb-6">
                Start by creating or joining a class
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setIsJoinModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Users size={16} />
                  Join Class
                </Button>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  className="gap-2"
                >
                  <PlusCircle size={16} />
                  Create Class
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ClassCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={handleClassCreated}
      />

      <JoinClassModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onClassJoined={handleClassJoined}
      />
    </div>
  );
};

interface ClassCardProps {
  classroom: Classroom & { originalIndex?: number };
  isTeaching?: boolean;
  defaultImage: string;
}

const ClassCard: React.FC<ClassCardProps> = ({
  classroom,
  isTeaching = false,
  defaultImage,
}) => {
  return (
    <Link to={`/classroom/${classroom.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow duration-200 flex flex-col">
        <div
          className="h-32 bg-cover bg-center"
          style={{
            backgroundImage: `url(${classroom.coverImage || defaultImage})`,
          }}
        >
          <div className="w-full h-full bg-black/10 flex items-end">
            <div className="p-4 bg-gradient-to-t from-black/70 to-transparent w-full">
              <h3 className="font-medium text-lg text-white">
                {classroom.name}
              </h3>
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            {classroom.subject && (
              <div className="text-sm font-medium text-primary mb-1">
                {classroom.subject}
              </div>
            )}
            {classroom.section && (
              <div className="text-sm text-gray-600">
                Section: {classroom.section}
              </div>
            )}
            {classroom.teacher && !isTeaching && (
              <div className="text-sm text-gray-600">
                Teacher: {classroom.teacher}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Users
                size={14}
                className="mr-1"
              />
              {classroom.studentsCount || 0} students
            </div>
            <div className="flex items-center text-xs font-medium">
              {isTeaching ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <School size={14} />
                  Teaching
                </span>
              ) : (
                <span className="flex items-center gap-1 text-blue-600">
                  <GraduationCap size={14} />
                  Enrolled
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ClassesPage;
