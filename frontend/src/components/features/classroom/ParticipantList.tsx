import React, { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input";
import { Copy, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import API from "@/services/api";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
}

interface ParticipantListProps {
  classroomId: string;
  classCode: string;
  isTeacher: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  classroomId,
  classCode,
  isTeacher,
}) => {
  const [participants, setParticipants] = useState<{
    teacher: User | null;
    students: User[];
  }>({
    teacher: null,
    students: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(
          `/classrooms/${classroomId}/participants`
        );
        setParticipants(response.data);
      } catch (error) {
        console.error("Error fetching participants:", error);
        setError("Failed to load participants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [classroomId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    toast.success("Class code copied to clipboard!");
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setInviting(true);
    try {
      await API.post(`/classrooms/${classroomId}/invite`, {
        email: inviteEmail,
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const filteredParticipants = {
    teacher: participants.teacher,
    students: participants.students.filter(
      (student) =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  const totalParticipants =
    (participants.teacher ? 1 : 0) + participants.students.length;

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading participants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Participants ({totalParticipants})
          </h2>
          <p className="text-gray-500 text-sm">
            {participants.teacher ? "1 teacher" : "No teacher"} and{" "}
            {participants.students.length} students
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-9"
            />
          </div>

          {isTeacher && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyCode}
                className="whitespace-nowrap"
              >
                <Copy className="h-4 w-4 mr-2" /> Class Code: {classCode}
              </Button>
              <Button className="whitespace-nowrap">
                <UserPlus className="h-4 w-4 mr-2" /> Invite
              </Button>
            </div>
          )}
        </div>
      </div>

      {isTeacher && (
        <Card className="p-4 mb-6">
          <h3 className="font-medium mb-3">Invite Students</h3>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInviteEmail(e.target.value)
              }
              className="flex-grow"
            />
            <Button
              onClick={handleInvite}
              loading={inviting}
              disabled={inviting || !inviteEmail.trim()}
            >
              Send Invite
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-medium flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" /> All Participants
          </h3>
        </div>

        <div className="divide-y">
          {/* Teacher */}
          {participants.teacher && (
            <div className="p-4 flex items-center">
              <div className="mr-4">
                {participants.teacher.profilePic ? (
                  <img
                    src={participants.teacher.profilePic}
                    alt={`${participants.teacher.firstName} ${participants.teacher.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {participants.teacher.firstName.charAt(0)}
                      {participants.teacher.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <p className="font-medium">
                  {participants.teacher.firstName}{" "}
                  {participants.teacher.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {participants.teacher.email}
                </p>
              </div>
              <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Teacher
              </div>
            </div>
          )}

          {/* Students */}
          {filteredParticipants.students.length > 0 ? (
            filteredParticipants.students.map((student) => (
              <div
                key={student.userId}
                className="p-4 flex items-center"
              >
                <div className="mr-4">
                  {student.profilePic ? (
                    <img
                      src={student.profilePic}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Student
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchTerm
                ? "No matching participants found"
                : "No students enrolled yet"}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ParticipantList;
