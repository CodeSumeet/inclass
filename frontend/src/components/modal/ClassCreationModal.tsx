import API from "../../services/api";
import { useState } from "react";
import { toast } from "sonner";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import FileUpload from "../ui/FileUpload"; // Import the new FileUpload component
import { useAuthStore } from "../../store/useAuthStore"; // Import your Zustand store

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
  const { user } = useAuthStore(); // Get user from Zustand store
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    subject: "",
    coverImage: null as File | null, // This will now hold the file object
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, coverImage: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("section", formData.section);
    formDataToSend.append("subject", formData.subject);

    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      // Upload the cover image to Cloudinary
      let coverImageUrl = "";
      if (formData.coverImage) {
        const formDataCloudinary = new FormData();
        formDataCloudinary.append("file", formData.coverImage);
        formDataCloudinary.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        ); // Use the upload preset from environment variables

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
        console.log(cloudinaryData);
        coverImageUrl = cloudinaryData.url; // Get the secure URL of the uploaded image
      }

      await API.post("/classrooms/create", {
        name: formData.name,
        section: formData.section,
        subject: formData.subject,
        coverImage: coverImageUrl, // Use the Cloudinary URL
        userId: user.userId, // Use the userId from Zustand store
      });
      toast.success("Class created successfully!");
      onClassCreated(); // Call the function to refresh the class list
      onClose(); // Close the modal
    } catch (error) {
      toast.error("Failed to create class");
      console.error("Error creating class:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create Class</h2>
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
