import { useAuthStore } from "../../../store/useAuthStore";
import API from "../../../services/api";
import React, { useState } from "react";
import { toast } from "sonner";
import { X, UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input";

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
    if (!classCode.trim()) {
      setError("Please enter a class code");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await API.post("/classrooms/join", {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Join a Class</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Ask your teacher for the class code, then enter it here.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <KeyRound className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Enter class code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="pl-10"
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinClass}
              disabled={loading}
              className="sm:order-2"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Joining...
                </>
              ) : (
                "Join Class"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;
