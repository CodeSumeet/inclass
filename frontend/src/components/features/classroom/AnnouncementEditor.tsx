import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { Button } from "../../common/Button/Button";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface AnnouncementEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
  disabled?: boolean;
}

const AnnouncementEditor: React.FC<AnnouncementEditorProps> = ({
  value,
  onChange,
  placeholder = "Announce something to your class...",
  onCancel,
  onSubmit,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [quillReady, setQuillReady] = useState(false);

  // Initialize Quill modules safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only run this code on the client side
      const Quill = ReactQuill.Quill;
      if (Quill) {
        // Register custom image handler
        const toolbar = Quill.import("modules/toolbar");
        if (toolbar && toolbar.prototype) {
          toolbar.prototype.handlers = {
            ...toolbar.prototype.handlers,
            image: function () {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();

              input.onchange = async () => {
                if (input.files && input.files[0]) {
                  const file = input.files[0];

                  // Check file size
                  if (file.size > 10 * 1024 * 1024) {
                    // 10MB limit
                    toast.error("File size should be less than 10MB");
                    return;
                  }

                  try {
                    setIsUploading(true);
                    toast.loading("Uploading image...");

                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append(
                      "upload_preset",
                      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
                        "inclass_uploads"
                    );

                    const response = await fetch(
                      `https://api.cloudinary.com/v1_1/${
                        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
                        "your-cloud-name"
                      }/image/upload`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    const data = await response.json();

                    if (data.secure_url) {
                      toast.dismiss();
                      toast.success("Image uploaded successfully");

                      // Get the Quill editor instance
                      const quillEditor = this.quill;
                      const range = quillEditor.getSelection(true);

                      // Insert image at cursor position
                      quillEditor.insertEmbed(
                        range.index,
                        "image",
                        data.secure_url
                      );

                      // Move cursor after image
                      quillEditor.setSelection(range.index + 1);
                    } else {
                      throw new Error("Upload failed");
                    }
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    toast.dismiss();
                    toast.error("Failed to upload image. Please try again.");
                  } finally {
                    setIsUploading(false);
                  }
                }
              };
            },
          };
        }
      }
      setQuillReady(true);
    }
  }, []);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  // Quill formats
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  if (!quillReady && typeof window !== "undefined") {
    return (
      <div className="announcement-editor">
        <div className="border border-gray-200 rounded-md p-4 min-h-[150px] flex items-center justify-center">
          <p className="text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcement-editor">
      <ReactQuill
        className="quill-editor"
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled || isUploading}
      />

      {(onSubmit || onCancel) && (
        <div className="flex justify-end space-x-2 p-3 bg-gray-50 border-t">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              type="button"
              disabled={isUploading}
            >
              Cancel
            </Button>
          )}
          {onSubmit && (
            <Button
              onClick={onSubmit}
              disabled={disabled || isUploading || !value.trim()}
              type="button"
            >
              <Send className="h-4 w-4 mr-2" /> Post
            </Button>
          )}
        </div>
      )}

      <style>{`
        .announcement-editor {
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        /* Quill editor customizations */
        .quill-editor {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .ql-container {
          font-size: 15px;
          min-height: 150px;
          max-height: 400px;
          overflow-y: auto;
          border: none !important;
        }
        
        .ql-editor {
          min-height: 150px;
          max-height: 400px;
          padding: 1rem 1.5rem;
          line-height: 1.5;
          color: #374151;
        }
        
        .ql-toolbar {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          padding: 0.5rem !important;
        }
        
        .ql-toolbar button {
          height: 28px;
          width: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
          color: #4b5563;
        }
        
        .ql-toolbar button:hover {
          background-color: #f3f4f6;
        }
        
        .ql-toolbar button.ql-active {
          background-color: #eff6ff;
          color: #2563eb;
        }
        
        .ql-toolbar .ql-formats {
          margin-right: 10px;
        }
        
        .ql-snow .ql-picker {
          color: #4b5563;
        }
        
        .ql-snow .ql-stroke {
          stroke: #4b5563;
        }
        
        .ql-snow .ql-fill {
          fill: #4b5563;
        }
        
        .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        
        .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
        
        .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-color: #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 0.375rem;
        }
        
        /* Fix for placeholder */
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementEditor;
