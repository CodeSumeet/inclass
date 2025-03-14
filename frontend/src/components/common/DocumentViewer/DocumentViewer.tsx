import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { X, Download, ExternalLink, FileText } from "lucide-react";
import { getOptimizedUrl, getDownloadUrl } from "@/utils/cloudinaryUtils";

interface DocumentViewerProps {
  url: string;
  fileName?: string;
  fileType?: string;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  url,
  fileName = "Document",
  fileType = "",
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the optimized URL for viewing (without fl_attachment flag)
  const optimizedUrl = getOptimizedUrl(url, fileType);

  // Create Google Docs viewer URL
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    optimizedUrl
  )}&embedded=true`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const isPdf = url.toLowerCase().endsWith(".pdf") || fileType?.includes("pdf");
  const isOfficeDoc =
    /\.(docx?|xlsx?|pptx?|txt)$/i.test(url) ||
    fileType?.includes("word") ||
    fileType?.includes("excel") ||
    fileType?.includes("powerpoint") ||
    fileType?.includes("text/plain");

  const handleDownload = () => {
    const downloadUrl = getDownloadUrl(url, fileType);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderViewer = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex items-center justify-center flex-col">
          <div className="bg-gray-100 p-8 rounded-lg text-center max-w-md">
            <FileText className="h-16 w-16 mx-auto text-primary mb-4" />
            <p className="text-red-500 mb-4">
              {error || "Unable to preview this document."}
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => window.open(viewerUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <iframe
        src={viewerUrl}
        className="w-full h-full"
        title={fileName}
        onError={() =>
          setError("Failed to load document. Try downloading instead.")
        }
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white rounded-lg w-full max-w-5xl h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            {fileName}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(viewerUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-1" /> Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">{renderViewer()}</div>
      </div>
    </div>
  );
};

export default DocumentViewer;
