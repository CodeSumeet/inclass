import API from "@/services/api";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { FileUpload, Input } from "../Input";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import {
  X,
  PlusCircle,
  FileImage,
  BookOpen,
  Users,
  Layers,
  Upload,
} from "lucide-react";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, coverImage: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Class name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      let coverImageUrl = "";
      if (formData.coverImage) {
        const uploadResult = await uploadToCloudinary({
          file: formData.coverImage,
          fileType: "material",
          classroomId: "covers",
        });

        coverImageUrl = uploadResult.secure_url;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Create a New Class</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter class name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="section"
                    placeholder="e.g. Period 1, Morning Section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Layers className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="subject"
                    placeholder="e.g. Mathematics, Science"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>

              {previewUrl ? (
                <div className="mb-4">
                  <div className="relative w-full h-48 rounded-md overflow-hidden group">
                    <img
                      src={previewUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setFormData((prev) => ({
                            ...prev,
                            coverImage: null,
                          }));
                        }}
                        className="bg-white/90 p-2 rounded-full"
                      >
                        <X className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary/50 transition-colors">
                  <div className="space-y-2 text-center">
                    <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex flex-col items-center text-sm text-gray-600">
                      <p className="mb-1">Drag and drop an image, or</p>
                      <FileUpload
                        label="Browse files"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="text-primary hover:text-primary-dark"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="sm:order-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassCreationModal;
