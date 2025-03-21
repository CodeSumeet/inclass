import React from "react";
import { Card } from "../../common/Card";
import AnnouncementEditor from "./AnnouncementEditor";

interface AnnouncementInputProps {
  user: any;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  announcement: string;
  setAnnouncement: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const AnnouncementInput: React.FC<AnnouncementInputProps> = ({
  user,
  isEditing,
  setIsEditing,
  announcement,
  setAnnouncement,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <Card className="mb-8 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 overflow-hidden">
            {user ? (
              <img
                src={user.profilePic}
                alt="Teacher"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>T</span>
            )}
          </div>
          <div className="flex-1">
            {!isEditing ? (
              <div
                className="cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <p className="text-gray-500">
                  Announce something to your class...
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                <AnnouncementEditor
                  value={announcement}
                  onChange={setAnnouncement}
                  placeholder="Announce something to your class..."
                  onCancel={() => {
                    setAnnouncement("");
                    setIsEditing(false);
                  }}
                  onSubmit={onSubmit}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnnouncementInput;
