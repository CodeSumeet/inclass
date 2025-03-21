import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button/Button";
import { Video } from "lucide-react";
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
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await getClassroomMeetings(classroomId);
        const active = data.find((m: any) => m.status === "ACTIVE") || null;
        setActiveMeeting(active);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
        setLoading(false);
      }
    };

    fetchMeetings();

    // Set up polling to check for active meetings every 30 seconds
    const intervalId = setInterval(fetchMeetings, 30000);

    return () => clearInterval(intervalId);
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

  if (loading) {
    return (
      <Card className="p-6 mb-6 flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </Card>
    );
  }

  if (!activeMeeting) {
    if (!isTeacher) {
      return null; // Don't show anything for students if no active meeting
    }

    return (
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <Video className="mr-2 h-5 w-5 text-primary" />
            Video Meeting
          </h2>

          <Button
            onClick={handleCreateMeeting}
            disabled={creating}
            className="bg-primary text-white"
          >
            {creating ? "Creating..." : "Start New Meeting"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 bg-green-50 border-green-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center text-green-800">
            <Video className="mr-2 h-5 w-5 text-green-600" />
            Active Meeting
          </h2>
          <p className="text-sm text-green-700 mt-1">
            A meeting is currently in progress
          </p>
        </div>

        <Button
          onClick={() => handleJoinMeeting(activeMeeting.id)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Join Meeting
        </Button>
      </div>
    </Card>
  );
};

export default MeetingControls;
