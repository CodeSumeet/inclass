import { useState, useEffect } from "react";
import API from "@/services/api";
import { toast } from "sonner";

interface UseClassroomProps {
  classroomId: string;
}

export const useClassroom = ({ classroomId }: UseClassroomProps) => {
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchClassroomDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/classrooms/${classroomId}`);
      setClassroom(response.data);

      const announcementsResponse = await API.get(
        `/classrooms/${classroomId}/announcements`
      );
      setClassroom((prevClassroom: any) => ({
        ...prevClassroom,
        announcements: announcementsResponse.data,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch classroom details.");
    } finally {
      setLoading(false);
    }
  };

  const postAnnouncement = async () => {
    if (!announcement.trim()) return;

    try {
      const response = await API.post(
        `/classrooms/${classroomId}/announcements`,
        {
          content: announcement,
          classroomId: classroomId,
        }
      );

      setClassroom((prevClassroom: any) => ({
        ...prevClassroom,
        announcements: [response.data, ...(prevClassroom.announcements || [])],
      }));

      setAnnouncement("");
      setIsEditing(false);
      toast.success("Announcement posted successfully!");
    } catch (error) {
      console.error("Error posting announcement:", error);
      toast.error("Failed to post announcement. Please try again.");
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setIsDeleting(announcementId);
    try {
      await API.delete(`/classrooms/announcements/${announcementId}`);

      setClassroom((prevClassroom: any) => ({
        ...prevClassroom,
        announcements: prevClassroom.announcements.filter(
          (a: any) => a.id !== announcementId
        ),
      }));

      toast.success("Announcement deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete announcement. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    fetchClassroomDetails();
  }, [classroomId]);

  return {
    classroom,
    loading,
    error,
    announcement,
    setAnnouncement,
    isEditing,
    setIsEditing,
    isDeleting,
    postAnnouncement,
    deleteAnnouncement,
    refreshClassroom: fetchClassroomDetails,
  };
};
