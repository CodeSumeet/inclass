import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import Input from "../components/ui/Input";
import ClassCreationModal from "../components/modal/ClassCreationModal"; // Import the modal
import API from "../services/api"; // Import the API service
import { useAuthStore } from "../store/useAuthStore";

// Define the Classroom interface based on your backend model
interface Classroom {
  id: string;
  name: string;
  section?: string;
  subject?: string;
  coverImage?: string;
  teacher?: string; // Assuming you have a teacher field
}

const ClassesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [classes, setClasses] = useState<Classroom[]>([]); // State to hold fetched classes

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await API.get(`/classrooms/user/${user?.userId}`); // Replace with actual user ID
        setClasses(response.data); // Set the fetched classes
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassCreated = async () => {
    // Fetch the updated class list after a new class is created
    try {
      const response = await API.get("/classrooms/user/currentUserId"); // Replace with actual user ID
      setClasses(response.data); // Update the state with the new class list
    } catch (error) {
      console.error("Failed to refresh classes:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Your Classes</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-xl"
        />
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

      {/* Class Creation Modal */}
      <ClassCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={handleClassCreated}
      />
    </div>
  );
};

export default ClassesPage;
