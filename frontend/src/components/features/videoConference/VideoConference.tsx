import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { DailyProvider } from "@daily-co/daily-react";
import { DailyCall } from "@daily-co/daily-js";
import { Button } from "@/components/common/Button/Button";
import { toast } from "sonner";
import { joinMeeting, endMeeting } from "@/services/api/videoConference";
import VideoCallFrame from "./VideoCallFrame";
import { useSocketStore } from "@/store/useSocketStore";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  ScreenShare,
} from "lucide-react";

interface VideoConferenceProps {
  meetingId: string;
}

const VideoConference: React.FC<VideoConferenceProps> = ({ meetingId }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<any | null>(null);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const {
    socket,
    joinMeeting: joinSocketMeeting,
    leaveMeeting: leaveSocketMeeting,
  } = useSocketStore();

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        const data = await joinMeeting(meetingId);
        setMeeting(data.meeting);
        setToken(data.token);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to join meeting");
        setLoading(false);
        toast.error("Failed to join meeting");
      }
    };

    if (meetingId && user) {
      fetchMeeting();
    }

    return () => {
      // Clean up call object when component unmounts
      if (callObject) {
        callObject.destroy();
      }
    };
  }, [meetingId, user]);

  // Set up socket connection for the meeting
  useEffect(() => {
    if (socket && meetingId) {
      joinSocketMeeting(meetingId);

      // Listen for user joined/left events
      socket.on("user-joined", (data) => {
        toast.info(`${data.userId} joined the meeting`);
      });

      socket.on("user-left", (data) => {
        toast.info(`${data.userId} left the meeting`);
      });

      socket.on("meeting-ended", (data) => {
        toast.warning("The meeting has ended");
        navigate(`/classroom/${meeting?.classroomId}`);
      });
    }

    return () => {
      // Leave the meeting room when component unmounts
      if (socket && meetingId) {
        leaveSocketMeeting(meetingId);
        socket.off("user-joined");
        socket.off("user-left");
        socket.off("meeting-ended");
      }
    };
  }, [
    meetingId,
    socket,
    joinSocketMeeting,
    leaveSocketMeeting,
    navigate,
    meeting,
  ]);

  const handleCallObjectReady = useCallback((co: any) => {
    setCallObject(co);

    // Set up event listeners
    co.on("participant-joined", (event: any) => {
      setParticipantCount((count) => count + 1);
    });

    co.on("participant-left", (event: any) => {
      setParticipantCount((count) => Math.max(0, count - 1));
    });
  }, []);

  const toggleMute = useCallback(() => {
    if (callObject) {
      callObject.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  }, [callObject, isMuted]);

  const toggleVideo = useCallback(() => {
    if (callObject) {
      callObject.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  }, [callObject, isVideoOff]);

  const toggleChat = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat]);

  const shareScreen = useCallback(() => {
    if (callObject) {
      callObject.startScreenShare();
    }
  }, [callObject]);

  const handleEndCall = async () => {
    try {
      // Only the meeting creator or classroom owner can end the meeting for everyone
      if (
        meeting.createdById === user?.userId ||
        meeting.classroom?.ownerId === user?.userId
      ) {
        await endMeeting(meetingId);
        toast.success("Meeting ended for all participants");
      }

      // Leave the call
      if (callObject) {
        callObject.destroy();
      }

      // Navigate back to classroom
      navigate(`/classroom/${meeting.classroomId}`);
    } catch (err: any) {
      toast.error("Failed to end meeting");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            {meeting?.classroom?.name || "Video Conference"}
          </h1>
          <p className="text-sm text-gray-300">
            Started {new Date(meeting?.startTime).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-gray-700 px-3 py-1 rounded-full flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{participantCount}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className={`flex-1 ${showChat ? "w-3/4" : "w-full"}`}>
          {token && meeting && (
            <VideoCallFrame
              url={meeting.roomUrl}
              token={token}
              onCallObjectReady={handleCallObjectReady}
            />
          )}
        </div>

        {showChat && (
          <div className="w-1/4 bg-white border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">Chat</h2>
            </div>
            <div className="p-4">
              {/* Chat implementation would go here */}
              <p className="text-gray-500 text-center">
                Chat functionality coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 text-white p-4 flex justify-center items-center space-x-4">
        <Button
          onClick={toggleMute}
          className={`rounded-full p-3 ${
            isMuted ? "bg-red-500" : "bg-gray-700"
          }`}
        >
          {isMuted ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <Button
          onClick={toggleVideo}
          className={`rounded-full p-3 ${
            isVideoOff ? "bg-red-500" : "bg-gray-700"
          }`}
        >
          {isVideoOff ? (
            <VideoOff className="h-6 w-6" />
          ) : (
            <Video className="h-6 w-6" />
          )}
        </Button>

        <Button
          onClick={shareScreen}
          className="rounded-full p-3 bg-gray-700"
        >
          <ScreenShare className="h-6 w-6" />
        </Button>

        <Button
          onClick={toggleChat}
          className={`rounded-full p-3 ${
            showChat ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>

        <Button
          onClick={handleEndCall}
          className="rounded-full p-3 bg-red-500"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default VideoConference;
