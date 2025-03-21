import { Card } from "../../common/Card";
import { Button } from "../../common/Button/Button";
import { Trash2 } from "lucide-react";
import { getAvatarUrl } from "../../../utils/getAvatarUrl";

interface AnnouncementCardProps {
  announcement: any;
  isTeacher: boolean;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isTeacher,
  currentUserId,
  onDelete,
  isDeleting,
}) => {
  let authorName = "User";
  let profilePic = "";

  if (announcement.createdBy) {
    authorName = `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`;
    profilePic = announcement.createdBy.profilePic;
  } else if (announcement.author) {
    authorName = announcement.author.name;
    profilePic = announcement.author.avatar;
  }

  const avatarSrc =
    profilePic ||
    getAvatarUrl({
      name: authorName,
      size: 40,
    });

  const canDelete =
    isTeacher ||
    (announcement.createdBy &&
      announcement.createdBy.userId === currentUserId) ||
    (announcement.author && announcement.author.id === currentUserId);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 overflow-hidden">
            <img
              src={avatarSrc}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{authorName}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(announcement.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(announcement.id)}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0"
                >
                  {isDeleting ? (
                    <span className="w-4 h-4 border-2 border-primary border-r-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 my-3" />
        <div
          className="text-gray-700 prose prose-sm max-w-none mt-3 announcement-content"
          dangerouslySetInnerHTML={{
            __html: announcement.content,
          }}
        />
      </div>
    </Card>
  );
};

export default AnnouncementCard;
