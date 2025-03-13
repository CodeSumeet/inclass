import {
  AnnouncementInput,
  AnnouncementList,
  AssignmentList,
  ClassroomHeader,
  ErrorState,
  LoadingState,
  ParticipantList,
  ScoresOverview,
} from "@/components/features/classroom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/Tabs";
import { useClassroom } from "@/hooks/useClassroom";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "react-router-dom";

const ClassroomPage = () => {
  const { user } = useAuthStore();
  const params = useParams();
  const classroomId = params.classroomId as string;

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

  if (loading) {
    return <LoadingState />;
  }

  if (error || !classroom) {
    return <ErrorState error={error} />;
  }

  const isTeacher = classroom.ownerId === user?.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <ClassroomHeader classroom={classroom} />

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
                <AssignmentList
                  assignments={classroom.assignments}
                  variant="compact"
                />
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
            <AssignmentList
              assignments={classroom.assignments}
              isTeacher={isTeacher}
              variant="full"
            />
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <ParticipantList
              teachers={classroom.teachers}
              students={classroom.students}
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
