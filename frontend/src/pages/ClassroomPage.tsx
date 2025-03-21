import {
  AnnouncementInput,
  AnnouncementList,
  ClassroomHeader,
  ErrorState,
  LoadingState,
  MaterialsList,
  ParticipantList,
  ScoresOverview,
} from "@/components/features/classroom";
import AssignmentList from "@components/features/classroom/assignment/AssignmentList";
import { useClassroom } from "@/hooks/useClassroom";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/services/api";
import { getClassroomAssignments } from "@/services/api/assignment";
import { Assignment } from "@/types/assignment.types";
import QuizList from "@/components/features/classroom/quiz/QuizList";
import MeetingControls from "@/components/features/videoConference/MeetingControls";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/Tabs/Tabs";
import {
  BookOpen,
  FileText,
  Users,
  BarChart,
  MessageSquare,
  BrainCircuit,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";

const ClassroomPage = () => {
  const { user } = useAuthStore();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const [isTeacher, setIsTeacher] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
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
  } = useClassroom({ classroomId });

  useEffect(() => {
    const fetchClassroomRole = async () => {
      if (!classroomId || !user) return;
      try {
        const response = await API.get(`/classrooms/${classroomId}/role`);
        setIsTeacher(response.data.role === "TEACHER");
      } catch (error) {
        console.error("Error fetching classroom role:", error);
        setIsTeacher(false);
      }
    };

    fetchClassroomRole();
  }, [classroomId, user]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!classroomId) return;
      setLoadingAssignments(true);
      try {
        const data = await getClassroomAssignments(classroomId);
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [classroomId]);

  if (loading) return <LoadingState />;
  if (error || !classroom) return <ErrorState error={error} />;

  const pendingAssignments = assignments.filter(
    (assignment) =>
      new Date(assignment.dueDate) >= new Date() &&
      assignment.status !== "CLOSED"
  );

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate.toDateString() === today.toDateString()) return "Due Today";
    if (dueDate.toDateString() === tomorrow.toDateString())
      return "Due Tomorrow";
    return `Due ${dueDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  const getTimeRemaining = (date: string) => {
    const dueDate = new Date(date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} left`;
    return "Due soon";
  };

  const handleCreateQuiz = () => {
    window.location.href = `/classroom/${classroomId}/quiz/create`;
  };

  const handleCreateAssignment = () => {
    window.location.href = `/classroom/${classroomId}/assignment/create`;
  };

  const handleUploadMaterial = () => {
    window.location.href = `/classroom/${classroomId}/material/upload`;
  };

  const handlePostAnnouncementWithImages = async () => {
    if (!announcement || isSubmitting) return;

    if (announcement.includes("data:image")) {
      setIsSubmitting(true);

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(announcement, "text/html");
        const images = doc.querySelectorAll("img");

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const src = img.getAttribute("src");

          if (src && src.startsWith("data:image")) {
            toast.loading(`Uploading image ${i + 1} of ${images.length}...`);

            const response = await fetch(src);
            const blob = await response.blob();

            const file = new File(
              [blob],
              `announcement-image-${Date.now()}.png`,
              {
                type: blob.type,
              }
            );

            const result = await uploadToCloudinary({
              file,
              fileType: "material",
              classroomId: "announcements",
            });

            img.setAttribute("src", result.secure_url);
          }
        }

        const updatedContent = doc.body.innerHTML;

        setAnnouncement(updatedContent);

        toast.dismiss();
        toast.success("Images uploaded successfully");

        await postAnnouncement();
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.dismiss();
        toast.error("Failed to upload images. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await postAnnouncement();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ClassroomHeader classroom={classroom} />
      <MeetingControls
        classroomId={classroomId}
        isTeacher={classroom?.ownerId === user?.userId}
      />

      <div className="container mx-auto px-4 md:px-0 pb-8 max-w-6xl">
        {isTeacher && (
          <div className="mb-8">
            <AnnouncementInput
              user={user}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              announcement={announcement}
              setAnnouncement={setAnnouncement}
              onSubmit={handlePostAnnouncementWithImages}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full bg-white mb-8 rounded-lg shadow-sm overflow-hidden flex justify-start p-0">
            <TabsTrigger
              value="feed"
              className="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=active]:text-primary transition-colors"
            >
              <MessageSquare size={18} />
              <span>Class Feed</span>
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=active]:text-primary transition-colors"
            >
              <BookOpen size={18} />
              <span>Assignments</span>
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=active]:text-primary transition-colors"
            >
              <BrainCircuit size={18} />
              <span>Quizzes</span>
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=active]:text-primary transition-colors"
            >
              <FileText size={18} />
              <span>Materials</span>
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=active]:text-primary transition-colors"
            >
              <Users size={18} />
              <span>Participants</span>
            </TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <TabsContent value="feed">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-yellow-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-medium text-yellow-800 flex items-center">
                        <AlertCircle
                          size={16}
                          className="mr-2"
                        />
                        Pending Assignments
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {loadingAssignments ? (
                        <div className="p-6 text-center">
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">
                            Loading assignments...
                          </p>
                        </div>
                      ) : pendingAssignments.length > 0 ? (
                        pendingAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium text-gray-800">
                                {assignment.title}
                              </h4>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  new Date(assignment.dueDate).getTime() -
                                    new Date().getTime() <
                                  24 * 60 * 60 * 1000
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {formatDueDate(assignment.dueDate)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {assignment.description?.length > 70
                                ? `${assignment.description.substring(
                                    0,
                                    70
                                  )}...`
                                : assignment.description}
                            </p>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-xs text-gray-500">
                                <Clock
                                  size={12}
                                  className="inline mr-1"
                                />
                                {getTimeRemaining(assignment.dueDate)}
                              </span>
                              <a
                                href={`/classroom/${classroomId}/assignment/${assignment.id}`}
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                View Assignment
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-3">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            No pending assignments
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <AnnouncementList
                    announcements={classroom.announcements}
                    isTeacher={isTeacher}
                    currentUserId={user?.userId}
                    onDelete={deleteAnnouncement}
                    isDeleting={isDeleting}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignments">
              <AssignmentList
                classroomId={classroomId}
                isTeacher={isTeacher}
              />
            </TabsContent>

            <TabsContent value="quizzes">
              <QuizList
                classroomId={classroomId}
                isTeacher={isTeacher}
              />
            </TabsContent>

            <TabsContent value="materials">
              <MaterialsList
                classroomId={classroomId}
                isTeacher={isTeacher}
              />
            </TabsContent>

            <TabsContent value="participants">
              <ParticipantList
                classroomId={classroomId}
                classCode={classroom.code}
                isTeacher={isTeacher}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassroomPage;
