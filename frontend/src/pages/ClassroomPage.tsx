import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api"; // Import the API service
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import {
  ChevronLeft,
  Clock,
  Calendar,
  Send,
  Video,
  Plus,
  MoreVertical,
} from "lucide-react";
import AnnouncementEditor from "../components/ui/AnnouncementEditor"; // Import the new component

const ClassroomPage = () => {
  const params = useParams();
  const classroomId = params.classroomId as string;

  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/classrooms/${classroomId}`); // Fetch classroom details from the backend
        setClassroom(response.data);
      } catch (error) {
        setError("Failed to fetch classroom details.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [classroomId]);

  const handlePostAnnouncement = async () => {
    if (!announcement.trim()) return;
    // Logic to post the announcement
    console.log("Announcement posted:", announcement);
    setAnnouncement(""); // Clear the input after posting
    setIsEditing(false); // Hide the editor after posting
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">
            {error || "Classroom not found."}
          </p>
          <Button
            className="mt-2"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  const isTeacher = classroom.ownerId === classroom.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with cover image */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden shadow-md">
        <img
          src={classroom.coverImage || "/placeholder.svg"}
          alt={`${classroom.name} cover`}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/40 to-transparent"></div>
        <Button
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-800"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {classroom.name}
          </h1>
          <div className="flex items-center mt-3 text-white/90">
            <span className="text-sm md:text-base font-medium">
              {classroom.section}
            </span>
            <span className="mx-2">•</span>
            <span className="text-sm md:text-base font-medium">
              {classroom.subject}
            </span>
            {classroom.room && (
              <>
                <span className="mx-2">•</span>
                <span className="text-sm md:text-base font-medium">
                  {classroom.room}
                </span>
              </>
            )}
          </div>
          <div className="mt-3">
            <span className="text-sm bg-primary text-white px-3 py-1 rounded-full font-medium shadow-sm">
              Class Code: {classroom.code}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        {/* Top actions bar */}
        <div className="flex justify-end mb-6">
          <Button className="flex items-center gap-2">
            <Video className="h-4 w-4" /> Join Live Class
          </Button>
        </div>

        {/* Announcement input */}
        <Card className="mb-8 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                {classroom.teacherInitials || "T"}
              </div>
              <div className="flex-1">
                {!isEditing ? (
                  <div
                    className="cursor-pointer p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    <p className="text-gray-500">
                      Announce something to your class...
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <AnnouncementEditor
                      value={announcement}
                      onChange={setAnnouncement}
                      placeholder="Announce something to your class..."
                    />
                    <div className="flex justify-end space-x-2 p-3 bg-gray-50 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnnouncement("");
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePostAnnouncement}
                        disabled={!announcement.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" /> Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

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
                {classroom.assignments && classroom.assignments.length > 0 ? (
                  <div className="space-y-4">
                    {classroom.assignments.map((assignment: any) => (
                      <Card
                        key={assignment.id}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="border-l-4 border-primary p-4">
                          <h4 className="font-medium text-lg text-gray-800">
                            {assignment.title}
                          </h4>
                          <div className="flex items-center text-gray-600 mt-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            <p>
                              Due:{" "}
                              {new Date(assignment.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <span
                              className={`${
                                assignment.status === "submitted"
                                  ? "bg-green-100 text-green-800"
                                  : assignment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              } px-2 py-1 rounded-full text-xs`}
                            >
                              {assignment.status === "submitted"
                                ? "Submitted"
                                : assignment.status === "pending"
                                ? "In Progress"
                                : "Not Started"}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white">
                    <div className="p-6 text-center text-gray-500">
                      <Clock className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">
                        No upcoming work for this classroom.
                      </p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Right column - Announcements */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Announcements
                  </h3>
                  {isTeacher && (
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create
                    </Button>
                  )}
                </div>

                {classroom.announcements &&
                classroom.announcements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classroom.announcements.map((announcement: any) => (
                      <Card
                        key={announcement.id}
                        className="mb-4 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                              <img
                                src={announcement.author.avatar}
                                alt={announcement.author.name}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {announcement.author.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  announcement.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              className="ml-auto"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="border-b border-gray-200 my-3" />
                          <h4 className="font-medium text-lg mb-2">
                            {announcement.title}
                          </h4>
                          <p className="text-gray-700">
                            {announcement.content}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Class Assignments
                </h3>
                {isTeacher && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Create Assignment
                  </Button>
                )}
              </div>

              {classroom.assignments && classroom.assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classroom.assignments.map((assignment: any) => (
                    <Card
                      key={assignment.id}
                      className="overflow-hidden hover:shadow-md transition-all hover:translate-y-[-2px]"
                    >
                      <div className="bg-primary h-2"></div>
                      <div className="p-5">
                        <h3 className="font-medium text-lg mb-2">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <Calendar className="h-4 w-4 mr-2" />
                          <p>
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span
                            className={`${
                              assignment.status === "submitted"
                                ? "bg-green-100 text-green-800"
                                : assignment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            } px-2 py-1 rounded-full text-xs`}
                          >
                            {assignment.status === "submitted"
                              ? "Submitted"
                              : assignment.status === "pending"
                              ? "In Progress"
                              : "Not Started"}
                          </span>
                          <Button className="text-sm">View Details</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <div className="p-8 text-center text-gray-500">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-gray-400">📝</span>
                    </div>
                    <p className="font-medium mb-1">
                      No assignments created yet
                    </p>
                    <p className="text-sm mb-4">
                      Create your first assignment to get started
                    </p>
                    <Button>Create Assignment</Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="overflow-hidden">
                <div className="bg-primary text-white font-medium p-4">
                  <h3 className="text-lg">Teachers</h3>
                </div>
                <div className="p-4">
                  {classroom.teachers && classroom.teachers.length > 0 ? (
                    <ul className="divide-y">
                      {classroom.teachers.map((teacher: any) => (
                        <li
                          key={teacher.id}
                          className="py-3 flex items-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                            <img
                              src={teacher.avatar}
                              alt={teacher.name}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-gray-500">
                              {teacher.email || "Teacher"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No teachers in this classroom.
                    </p>
                  )}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="bg-primary text-white font-medium p-4 flex justify-between items-center">
                  <h3 className="text-lg">Students</h3>
                  {classroom.students && (
                    <span className="bg-white text-primary rounded-full text-sm px-2 py-0.5">
                      {classroom.students.length || 0}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {classroom.students && classroom.students.length > 0 ? (
                    <ul className="divide-y">
                      {classroom.students.map((student: any) => (
                        <li
                          key={student.id}
                          className="py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-4">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">
                                {student.email || "Student"}
                              </p>
                            </div>
                          </div>
                          {isTeacher && (
                            <Button variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      <p className="mb-2">
                        No students have joined this classroom yet.
                      </p>
                      <p className="text-sm">
                        Share the class code with your students:{" "}
                        <span className="font-medium">{classroom.code}</span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Scores Tab */}
          <TabsContent value="scores">
            <Card className="overflow-hidden">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Grades Overview
                </h3>
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400">📊</span>
                  </div>
                  <p className="font-medium mb-1">Grade tracking coming soon</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Track student progress and manage grades in one place
                  </p>
                  <Button disabled>Set Up Gradebook</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassroomPage;
