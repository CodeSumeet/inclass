import API from "../../services/api";
import { useState } from "react";
import { toast } from "sonner";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import FileUpload from "../ui/FileUpload";
import { useAuthStore } from "../../store/useAuthStore";

interface ClassCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: () => void;
}

const ClassCreationModal: React.FC<ClassCreationModalProps> = ({
  isOpen,
  onClose,
  onClassCreated,
}) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    subject: "",
    coverImage: null as File | null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, coverImage: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("section", formData.section);
    formDataToSend.append("subject", formData.subject);

    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      let coverImageUrl = "";
      if (formData.coverImage) {
        const formDataCloudinary = new FormData();
        formDataCloudinary.append("file", formData.coverImage);
        formDataCloudinary.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method: "POST",
            body: formDataCloudinary,
          }
        );

        const cloudinaryData = await cloudinaryResponse.json();
        coverImageUrl = cloudinaryData.url;
      }

      await API.post("/classrooms/create", {
        name: formData.name,
        section: formData.section,
        subject: formData.subject,
        coverImage: coverImageUrl,
        userId: user.userId,
      });
      toast.success("Class created successfully!");
      onClassCreated();
      onClose();
    } catch (error) {
      setError("Failed to create class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create Class</h2>
        {loading && <p>Creating class...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Class Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            type="text"
            name="section"
            placeholder="Section"
            value={formData.section}
            onChange={handleInputChange}
            required
          />
          <Input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
          <FileUpload
            label="Upload Cover Image"
            onChange={handleFileChange}
          />
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit">Create Class</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassCreationModal;
