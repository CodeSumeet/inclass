import { FC, useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UpdateProfileData } from "../types/user.types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import Input from "../components/ui/Input";
import { toast } from "sonner";
import api from "../services/api";
import { Link } from "react-router-dom";
import { PlusCircle, Users, BookOpen } from "lucide-react";
import { getAvatarUrl } from "../utils/getAvatarUrl";

interface ClassroomData {
  id: string;
  name: string;
  section: string;
  subject: string;
  studentsCount?: number;
  teacherName?: string;
}

const ProfilePage: FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [ownedClassrooms, setOwnedClassrooms] = useState<ClassroomData[]>([]);
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<ClassroomData[]>(
    []
  );
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });

  const avatarUrl = getAvatarUrl({
    name: `${user?.firstName} ${user?.lastName}`,
  });

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const [ownedRes, enrolledRes] = await Promise.all([
          api.get(`/users/${user?.userId}/classrooms`),
          api.get(`/users/${user?.userId}/enrollments`),
        ]);
        setOwnedClassrooms(ownedRes.data);
        setEnrolledClassrooms(enrolledRes.data);
      } catch (error) {
        toast.error("Failed to fetch classrooms");
      }
    };

    if (user) fetchClassrooms();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    try {
      await updateProfile(formData as UpdateProfileData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const ClassroomCard: FC<{
    classroom: ClassroomData;
    type: "teaching" | "enrolled";
  }> = ({ classroom, type }) => (
    <Link to={`/classroom/${classroom.id}`}>
      <Card className="hover:border-primary transition-all duration-200">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-lg">{classroom.name}</h4>
            {type === "teaching" && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Teaching
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {classroom.subject} • {classroom.section}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{classroom.studentsCount || 0} students</span>
          </div>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-500 mb-4">{user?.email}</p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-medium">{ownedClassrooms.length}</span>
                <span className="text-gray-500 ml-1">Teaching</span>
              </div>
              <div>
                <span className="font-medium">{enrolledClassrooms.length}</span>
                <span className="text-gray-500 ml-1">Enrolled</span>
              </div>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 border-t pt-6"
          >
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button type="submit">Save Changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Classes Section */}
      <div className="space-y-8">
        {/* Teaching Classes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Teaching
            </h2>
            <Link to="/classroom/create">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </Link>
          </div>
          {ownedClassrooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedClassrooms.map((classroom) => (
                <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  type="teaching"
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="p-6 text-center text-gray-500">
                <p>You haven't created any classes yet</p>
                <Link to="/classroom/create">
                  <Button
                    variant="outline"
                    className="mt-2"
                  >
                    Create Your First Class
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Enrolled Classes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enrolled
            </h2>
            <Link to="/classroom/join">
              <Button variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Join Class
              </Button>
            </Link>
          </div>
          {enrolledClassrooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledClassrooms.map((classroom) => (
                <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  type="enrolled"
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="p-6 text-center text-gray-500">
                <p>You haven't joined any classes yet</p>
                <Link to="/classroom/join">
                  <Button
                    variant="outline"
                    className="mt-2"
                  >
                    Join a Class
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
