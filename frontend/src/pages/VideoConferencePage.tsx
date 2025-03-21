import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import VideoConference from "@/components/features/videoConference/VideoConference";
import { Button } from "@/components/common/Button/Button";

const VideoConferencePage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!meetingId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>Meeting ID is required</p>
        </div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>You must be logged in to join a meeting</p>
        </div>
        <Button onClick={() => navigate("/login")}>Log In</Button>
      </div>
    );
  }

  return <VideoConference meetingId={meetingId} />;
};

export default VideoConferencePage;
