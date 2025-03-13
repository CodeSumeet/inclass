import { useAuthStore } from "../../../store/useAuthStore";
import API from "../../../services/api";
import React, { useState } from "react";
import { toast } from "sonner";

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassJoined: () => void;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({
  isOpen,
  onClose,
  onClassJoined,
}) => {
  const { user } = useAuthStore();
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinClass = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post("/classrooms/join", {
        userId: user?.userId,
        code: classCode,
      });
      toast.success("Successfully joined the class!");
      onClassJoined();
      onClose();
    } catch (error: any) {
      setError("Failed to join the class. Please check the class code.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Join Class</h2>
        {loading && <p>Joining class...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Enter Class Code"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2"
          >
            Cancel
          </button>
          <button onClick={handleJoinClass}>Join</button>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;
