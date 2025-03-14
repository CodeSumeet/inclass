import React, { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import {
  Plus,
  FileText,
  Link as LinkIcon,
  Image,
  Video,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { getClassroomMaterials, deleteMaterial } from "@/services/api/material";
import { Material, MaterialType } from "@/types/material.types";
import MaterialUploadModal from "./MaterialUploadModal";
import DocumentViewer from "@components/common/DocumentViewer/DocumentViewer";
import { toast } from "sonner";

interface MaterialsListProps {
  classroomId: string;
  isTeacher: boolean;
}

const MaterialsList: React.FC<MaterialsListProps> = ({
  classroomId,
  isTeacher,
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);

  const getDownloadableUrl = (url: string, fileType?: string): string => {
    if (!url) return "";

    // Check if this is a Cloudinary URL
    if (url.includes("cloudinary.com")) {
      const isPdf =
        fileType?.includes("pdf") || url.toLowerCase().endsWith(".pdf");
      const isDocument =
        fileType?.includes("document") ||
        fileType?.includes("word") ||
        fileType?.includes("powerpoint") ||
        /\.(docx?|pptx?)$/i.test(url);

      if (isPdf || isDocument) {
        // For PDFs and documents, ensure we have the fl_attachment flag
        if (url.includes("/raw/upload/")) {
          return url.replace("/raw/upload/", "/image/upload/fl_attachment/");
        } else if (url.includes("/upload/") && !url.includes("fl_attachment")) {
          return url.replace("/upload/", "/upload/fl_attachment/");
        }
      }
    }

    return url;
  };

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClassroomMaterials(classroomId);
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setError("Failed to load materials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [classroomId]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      setDeletingId(id);
      try {
        await deleteMaterial(id);
        setMaterials(materials.filter((material) => material.id !== id));
        toast.success("Material deleted successfully");
      } catch (error) {
        console.error("Error deleting material:", error);
        toast.error("Failed to delete material");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getFileIcon = (type: MaterialType, fileType?: string) => {
    switch (type) {
      case MaterialType.DOCUMENT:
        if (fileType?.includes("pdf"))
          return <FileText className="h-10 w-10 text-red-500" />;
        if (fileType?.includes("word") || fileType?.includes("doc"))
          return <FileText className="h-10 w-10 text-blue-500" />;
        if (fileType?.includes("presentation") || fileType?.includes("ppt"))
          return <FileText className="h-10 w-10 text-orange-500" />;
        if (fileType?.includes("sheet") || fileType?.includes("xls"))
          return <FileText className="h-10 w-10 text-green-500" />;
        return <FileText className="h-10 w-10 text-gray-500" />;
      case MaterialType.LINK:
        return <LinkIcon className="h-10 w-10 text-blue-500" />;
      case MaterialType.IMAGE:
        return <Image className="h-10 w-10 text-purple-500" />;
      case MaterialType.VIDEO:
        return <Video className="h-10 w-10 text-red-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const canPreview = (material: Material) => {
    // Check if the material can be previewed
    const isPdf =
      material.url.toLowerCase().endsWith(".pdf") ||
      (material.fileType && material.fileType.includes("pdf"));

    const isOfficeDoc =
      /\.(docx?|xlsx?|pptx?|txt)$/i.test(material.url) ||
      (material.fileType &&
        (material.fileType.includes("word") ||
          material.fileType.includes("excel") ||
          material.fileType.includes("powerpoint") ||
          material.fileType.includes("text/plain")));

    return isPdf || isOfficeDoc;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={fetchMaterials}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Class Materials</h3>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Upload Material
          </Button>
        )}
      </div>

      {materials.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No materials yet</h4>
          <p className="text-gray-500 mb-4">
            {isTeacher
              ? "Upload documents, links, and other resources for your students."
              : "Your teacher hasn't uploaded any materials yet."}
          </p>
          {isTeacher && (
            <Button onClick={() => setIsModalOpen(true)}>
              Upload Your First Material
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {materials.map((material) => (
            <Card
              key={material.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0">
                  {getFileIcon(material.type, material.fileType)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="text-lg font-medium text-blue-600">
                          {material.title}
                        </span>
                      </div>
                      {material.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {material.description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span>Added {formatDate(material.createdAt)}</span>
                        {material.fileSize && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{formatFileSize(material.fileSize)}</span>
                          </>
                        )}
                        {material.createdBy && (
                          <>
                            <span className="mx-2">•</span>
                            <span>
                              By {material.createdBy.firstName}{" "}
                              {material.createdBy.lastName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {canPreview(material) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:bg-blue-50"
                          onClick={() => setViewingMaterial(material)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-500 hover:bg-green-50"
                        onClick={() => {
                          const downloadUrl = getDownloadableUrl(
                            material.url,
                            material.fileType
                          );
                          const link = document.createElement("a");
                          link.href = downloadUrl;
                          link.download = material.title;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                      {isTeacher && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(material.id)}
                          disabled={deletingId === material.id}
                        >
                          {deletingId === material.id ? (
                            <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MaterialUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classroomId={classroomId}
        onMaterialUploaded={fetchMaterials}
      />

      {viewingMaterial && (
        <DocumentViewer
          url={viewingMaterial.url}
          fileName={viewingMaterial.title}
          fileType={viewingMaterial.fileType || ""}
          onClose={() => setViewingMaterial(null)}
        />
      )}
    </div>
  );
};

export default MaterialsList;
