import React from "react";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill styles

interface AnnouncementEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

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

const AnnouncementEditor: React.FC<AnnouncementEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="announcement-editor">
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        className="rounded-t-md"
      />
      <style>{`
        .announcement-editor .ql-container {
          height: 150px;
          font-size: 16px;
          font-family: inherit;
          border: none;
          border-bottom: 1px solid #e5e7eb;
        }
        .announcement-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        .announcement-editor .ql-editor {
          padding: 12px 15px;
        }
        .announcement-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementEditor;
