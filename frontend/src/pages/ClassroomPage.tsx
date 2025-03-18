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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/Tabs";
import { useClassroom } from "@/hooks/useClassroom";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/services/api";
import { getClassroomAssignments } from "@/services/api/assignment";
import { Assignment } from "@/types/assignment.types";
import QuizList from "@/components/features/classroom/quiz/QuizList";
import MeetingControls from "@/components/features/videoConference/MeetingControls";

const ClassroomPage = () => {
  const { user } = useAuthStore();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const [isTeacher, setIsTeacher] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

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

  // Fetch user's role in the classroom
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

  // Fetch assignments
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

  if (loading) {
    return <LoadingState />;
  }

  if (error || !classroom) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClassroomHeader classroom={classroom} />

      <MeetingControls
        classroomId={classroomId}
        isTeacher={classroom?.ownerId === user?.userId}
      />

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        {/* Announcement input */}
        {isTeacher && (
          <AnnouncementInput
            user={user}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            announcement={announcement}
            setAnnouncement={setAnnouncement}
            onSubmit={postAnnouncement}
          />
        )}

        {/* Tabs navigation */}
        <Tabs
          defaultValue="feed"
          className="mb-8"
        >
          <TabsList className="w-full mb-8 border bg-white rounded-lg overflow-hidden shadow-sm">
            <TabsTrigger
              value="feed"
              className="py-3 px-4 text-base flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
            >
              Class Feed
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="py-3 px-4 text-base flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
            >
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="py-3 px-4 text-base flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
            >
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="py-3 px-4 text-base flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
            >
              Materials
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="py-3 px-4 text-base flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
            >
              Participants
            </TabsTrigger>
            <TabsTrigger
              value="scores"
              className="py-3 px-4 text-base flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
            >
              Scores
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Upcoming Work */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Upcoming Work
                </h3>
                {loadingAssignments ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : (
                  <AssignmentList
                    classroomId={classroomId}
                    isTeacher={isTeacher}
                  />
                )}
              </div>

              {/* Right column - Announcements */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Announcements
                  </h3>
                </div>
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

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            {loadingAssignments ? (
              <div className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading assignments...</p>
              </div>
            ) : (
              <AssignmentList
                classroomId={classroomId}
                isTeacher={isTeacher}
              />
            )}
          </TabsContent>

          {/* Quizzes Tab - New */}
          <TabsContent value="quizzes">
            <QuizList
              classroomId={classroomId}
              isTeacher={isTeacher}
            />
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <MaterialsList
              classroomId={classroomId}
              isTeacher={isTeacher}
            />
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <ParticipantList
              classroomId={classroomId}
              classCode={classroom.code}
              isTeacher={isTeacher}
            />
          </TabsContent>

          {/* Scores Tab */}
          <TabsContent value="scores">
            <ScoresOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassroomPage;
