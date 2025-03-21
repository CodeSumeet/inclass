import { FC, useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components";
import {
  BarChart,
  Users,
  BookOpen,
  Award,
  FileText,
  CheckSquare,
} from "lucide-react";
import {
  getTeacherDashboardStats,
  getStudentDashboardStats,
} from "@/services/api/analytics";

interface DashboardStats {
  totalClassrooms: number;
  totalStudents?: number;
  recentActivities: any[];
  classroomAnalytics?: any[];
  performanceMetrics?: any[];
  assignmentStats?: any[];
  upcomingAssignments?: any[];
}

const DashboardAnalyticsSummary: FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        let statsData;

        try {
          statsData = await getTeacherDashboardStats();
          setIsTeacher(true);
        } catch (err) {
          statsData = await getStudentDashboardStats();
          setIsTeacher(false);
        }

        setStats(statsData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard stats");
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="text-gray-500">No analytics data available</div>
      </Card>
    );
  }

  // Calculate total submissions for teachers
  const totalSubmissions =
    isTeacher && stats.assignmentStats
      ? stats.assignmentStats.reduce(
          (sum, stat) => sum + (stat.totalSubmissions || 0),
          0
        )
      : 0;

  // Calculate total graded submissions for teachers
  const totalGradedSubmissions =
    isTeacher && stats.assignmentStats
      ? stats.assignmentStats.reduce(
          (sum, stat) => sum + (stat.gradedSubmissions || 0),
          0
        )
      : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Analytics Summary</h2>
        <BarChart className="h-5 w-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Classrooms</p>
            <p className="text-xl font-bold">{stats.totalClassrooms}</p>
          </div>
        </div>

        {isTeacher && stats.totalStudents !== undefined && (
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        )}

        {isTeacher && (
          <div className="bg-green-50 p-4 rounded-lg flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Submissions</p>
              <p className="text-xl font-bold">
                {totalSubmissions} ({totalGradedSubmissions} graded)
              </p>
            </div>
          </div>
        )}

        {!isTeacher &&
          stats.performanceMetrics &&
          stats.performanceMetrics.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Grade</p>
                <p className="text-xl font-bold">
                  {(
                    stats.performanceMetrics.reduce(
                      (sum, metric) => sum + metric.overallGrade,
                      0
                    ) / stats.performanceMetrics.length
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          )}

        {!isTeacher &&
          stats.performanceMetrics &&
          stats.performanceMetrics.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-lg flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <CheckSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Assignment Completion</p>
                <p className="text-xl font-bold">
                  {(
                    stats.performanceMetrics.reduce(
                      (sum, metric) => sum + metric.assignmentCompletionRate,
                      0
                    ) / stats.performanceMetrics.length
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.slice(0, 3).map((activity, index) => (
              <div
                key={index}
                className="flex items-start"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                  {activity.user?.firstName?.charAt(0) || "?"}
                  {activity.user?.lastName?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">
                      {activity.user?.firstName} {activity.user?.lastName}
                    </span>{" "}
                    {formatActivityType(activity.activityType)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No recent activity</div>
          )}
        </div>
      </div>

      {stats.upcomingAssignments && stats.upcomingAssignments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Upcoming Assignments
          </h3>
          <div className="space-y-3">
            {stats.upcomingAssignments.slice(0, 3).map((assignment, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <p className="text-sm font-medium">{assignment.title}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {assignment.classroom.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due: {formatDate(assignment.dueDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Helper functions
const formatActivityType = (type: string): string => {
  switch (type) {
    case "login":
      return "logged in";
    case "assignment_submission":
      return "submitted an assignment";
    case "quiz_attempt":
      return "attempted a quiz";
    case "resource_view":
      return "viewed a resource";
    case "assignment_graded":
      return "graded an assignment";
    default:
      return type.replace("_", " ");
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default DashboardAnalyticsSummary;
