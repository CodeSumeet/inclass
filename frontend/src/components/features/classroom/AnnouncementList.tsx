import React, { useEffect } from "react";
import { Card } from "../../common/Card";
import AnnouncementCard from "./AnnouncementCard";
import { processAnnouncementContent } from "../../../utils/announcementUtils";

interface AnnouncementListProps {
  announcements: any[];
  isTeacher: boolean;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  isTeacher,
  currentUserId,
  onDelete,
  isDeleting,
}) => {
  useEffect(() => {
    // Process announcement content after render
    setTimeout(processAnnouncementContent, 100);
  }, [announcements]);

  if (!announcements || announcements.length === 0) {
    return (
      <Card className="bg-white">
        <div className="p-8 text-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📢</span>
          </div>
          <p className="font-medium mb-1">No announcements yet</p>
          <p className="text-sm">
            Post something to get the conversation started!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add CSS for rich text rendering */}
      <style>{`
        .announcement-content h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .announcement-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .announcement-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .announcement-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .announcement-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .announcement-content img {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .announcement-content img:hover {
          transform: scale(1.01);
        }
        .announcement-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
        }
        .announcement-content p {
          margin: 0.5rem 0;
        }
        .announcement-content strong {
          font-weight: 600;
        }
        .announcement-content em {
          font-style: italic;
        }
        .announcement-content u {
          text-decoration: underline;
        }
        .announcement-content s {
          text-decoration: line-through;
        }
        .announcement-content .document-link {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          margin: 0.25rem 0;
          transition: background-color 0.2s;
        }
        .announcement-content .document-link:hover {
          background-color: #e5e7eb;
        }
        .announcement-content .document-icon {
          margin-right: 0.5rem;
          font-size: 1.25rem;
        }
        /* React Quill specific styles */
        .announcement-content .ql-align-center {
          text-align: center;
        }
        .announcement-content .ql-align-right {
          text-align: right;
        }
        .announcement-content .ql-align-justify {
          text-align: justify;
        }
        .announcement-content .ql-size-small {
          font-size: 0.75em;
        }
        .announcement-content .ql-size-large {
          font-size: 1.5em;
        }
        .announcement-content .ql-size-huge {
          font-size: 2.5em;
        }
        .announcement-content .table-responsive {
          overflow-x: auto;
          max-width: 100%;
          margin: 1rem 0;
        }
        .announcement-content table {
          border-collapse: collapse;
          width: 100%;
        }
        .announcement-content table td, 
        .announcement-content table th {
          border: 1px solid #e5e7eb;
          padding: 8px;
        }
        .announcement-content table th {
          background-color: #f9fafb;
        }
      `}</style>

      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          isTeacher={isTeacher}
          currentUserId={currentUserId}
          onDelete={onDelete}
          isDeleting={isDeleting === announcement.id}
        />
      ))}
    </div>
  );
};

export default AnnouncementList;
