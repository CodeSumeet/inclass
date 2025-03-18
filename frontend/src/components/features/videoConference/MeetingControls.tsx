import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button/Button";
import { Video, Clock, Users } from "lucide-react";
import { Card } from "@/components";
import {
  createMeeting,
  getClassroomMeetings,
} from "@/services/api/videoConference";
import { toast } from "sonner";

interface MeetingControlsProps {
  classroomId: string;
  isTeacher: boolean;
}

interface Meeting {
  id: string;
  status: string;
  startTime: string;
  endTime?: string;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  classroomId,
  isTeacher,
}) => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await getClassroomMeetings(classroomId);
        setMeetings(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [classroomId]);

  const handleCreateMeeting = async () => {
    try {
      setCreating(true);
      const data = await createMeeting(classroomId);
      toast.success("Meeting created successfully");
      navigate(`/meeting/${data.meeting.id}`);
    } catch (err) {
      toast.error("Failed to create meeting");
      setCreating(false);
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    navigate(`/meeting/${meetingId}`);
  };

  const activeMeeting = meetings.find((m) => m.status === "ACTIVE");

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Video className="mr-2 h-5 w-5 text-primary" />
          Video Meetings
        </h2>

        {isTeacher && !activeMeeting && (
          <Button
            onClick={handleCreateMeeting}
            disabled={creating}
            className="bg-primary text-white"
          >
            {creating ? "Creating..." : "Start New Meeting"}
          </Button>
        )}

        {activeMeeting && (
          <Button
            onClick={() => handleJoinMeeting(activeMeeting.id)}
            className="bg-green-600 text-white"
          >
            Join Active Meeting
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : meetings.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Recent Meetings</h3>
          <div className="divide-y divide-gray-200">
            {meetings.slice(0, 5).map((meeting) => (
              <div
                key={meeting.id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">
                      {new Date(meeting.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        meeting.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {meeting.status}
                    </span>
                    {meeting.endTime && (
                      <span className="text-xs text-gray-500 ml-2">
                        Ended: {new Date(meeting.endTime).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {meeting.status === "ACTIVE" && (
                  <Button
                    onClick={() => handleJoinMeeting(meeting.id)}
                    className="bg-green-600 text-white text-sm px-3 py-1"
                  >
                    Join
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">
            No meetings have been held in this classroom yet.
          </p>
          {isTeacher && (
            <Button
              onClick={handleCreateMeeting}
              className="mt-4 bg-primary text-white"
              disabled={creating}
            >
              {creating ? "Creating..." : "Start First Meeting"}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default MeetingControls;
