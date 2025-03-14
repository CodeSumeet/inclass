import { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PlusCircle, Users, BookOpen, Upload, Camera } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAvatarUrl } from "@/utils/getAvatarUrl";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import API from "@/services/api";
import { UpdateProfileData } from "@/types/user.types";
import { Button, Card, Input } from "@/components";

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
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Use user's profile pic if available, otherwise use avatar
  const avatarUrl =
    user?.profilePic ||
    getAvatarUrl({
      name: `${user?.firstName} ${user?.lastName}`,
    });

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const [ownedRes, enrolledRes] = await Promise.all([
          API.get(`/users/${user?.userId}/classrooms`),
          API.get(`/users/${user?.userId}/enrollments`),
        ]);
        setOwnedClassrooms(ownedRes.data);
        setEnrolledClassrooms(enrolledRes.data);
      } catch (error) {
        toast.error("Failed to fetch classrooms");
      }
    };

    if (user) fetchClassrooms();
  }, [user]);

  useEffect(() => {
    // Create preview URL for the selected profile picture
    if (profilePic) {
      const objectUrl = URL.createObjectURL(profilePic);
      setPreviewUrl(objectUrl);

      // Clean up the URL when component unmounts or when file changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [profilePic]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (file: File | null) => {
    setProfilePic(file);
  };

  const handleProfilePicUpload = async () => {
    if (!profilePic || !user) return;

    setUploadingProfilePic(true);
    try {
      const result = await uploadToCloudinary({
        file: profilePic,
        fileType: "profile",
        userId: user.userId,
      });

      // Update user profile with new image URL
      await updateProfile({
        ...formData,
        profilePic: result.secure_url,
      } as UpdateProfileData);

      toast.success("Profile picture updated successfully");
      setProfilePic(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture"
      );
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    try {
      // If there's a profile pic, upload it first
      if (profilePic && user) {
        await handleProfilePicUpload();
      } else {
        // Otherwise just update the profile data
        await updateProfile(formData as UpdateProfileData);
      }

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
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                <label
                  htmlFor="profile-pic-upload"
                  className="cursor-pointer"
                >
                  <div className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors">
                    <Camera className="h-5 w-5" />
                  </div>
                  <input
                    id="profile-pic-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProfilePicChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            )}
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

            {profilePic && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="mr-3">
                    <img
                      src={previewUrl || ""}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{profilePic.name}</p>
                    <p className="text-xs text-gray-500">
                      {(profilePic.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <Button
                type="submit"
                loading={uploadingProfilePic}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                  });
                  setProfilePic(null);
                  setPreviewUrl(null);
                }}
                disabled={uploadingProfilePic}
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
