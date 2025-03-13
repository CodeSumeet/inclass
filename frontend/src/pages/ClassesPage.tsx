import { Button, Card, Input } from "@/components";
import { ClassCreationModal, JoinClassModal } from "@/components/common/modal";
import API from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Classroom {
  id: string;
  name: string;
  section?: string;
  subject?: string;
  coverImage?: string;
  teacher?: string;
}

const ClassesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/classrooms/user/${user?.userId}`);
        setClasses(response.data);
      } catch (error) {
        setError("Failed to fetch classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.userId]);

  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassCreated = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/classrooms/user/${user?.userId}`);
      setClasses(response.data);
      setSuccessMessage("Class created successfully!");
    } catch (error) {
      setError("Failed to refresh classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClassJoined = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/classrooms/user/${user?.userId}`);
      setClasses(response.data);
      setSuccessMessage("Successfully joined the class!");
    } catch (error) {
      setError("Failed to refresh classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Your Classes</h1>
      {loading && <p>Loading classes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-xl"
        />
        <Button onClick={() => setIsJoinModalOpen(true)}>Join Class</Button>
        <Button onClick={() => setIsModalOpen(true)}>Create Class</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem) => (
            <Card
              key={classItem.id}
              className="p-4"
            >
              <Link to={`/classroom/${classItem.id}`}>
                <img
                  src={classItem.coverImage}
                  alt={`${classItem.name} cover`}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="font-medium text-lg">{classItem.name}</h3>
                <p className="text-sm text-gray-500">{classItem.subject}</p>
                <p className="text-sm text-gray-500">
                  Section: {classItem.section}
                </p>
                <p className="text-sm text-gray-500">{classItem.teacher}</p>
              </Link>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-center">
            <p>No classes found.</p>
          </Card>
        )}
      </div>

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

export default ClassesPage;
