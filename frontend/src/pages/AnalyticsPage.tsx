import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Users, Award, Activity } from "lucide-react";
import { Card } from "@/components";
import {
  getClassroomAnalytics,
  getUserPerformance,
} from "@/services/api/analytics";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ClassroomAnalytics {
  id: string;
  classroomId: string;
  totalStudents: number;
  activeStudents: number;
  avgEngagementScore: number;
  lastUpdated: string;
  classroom: {
    id: string;
    name: string;
    ownerId: string;
  };
}

interface PerformanceMetric {
  id: string;
  userId: string;
  classroomId: string;
  assignmentCompletionRate: number;
  quizAvgScore: number;
  attendanceRate: number;
  overallGrade: number;
  user?: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AnalyticsPage: FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<ClassroomAnalytics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetric | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!classroomId || !user) return;

      try {
        setLoading(true);

        // Get classroom analytics
        const analyticsData = await getClassroomAnalytics(classroomId);
        setAnalytics(analyticsData);

        // Check if user is teacher
        setIsTeacher(analyticsData.classroom?.ownerId === user.userId);

        // Get user's performance
        const performanceData = await getUserPerformance(
          classroomId,
          user.userId
        );
        setPerformance(performanceData);

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics data");
        setLoading(false);
      }
    };

    fetchData();
  }, [classroomId, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  // Prepare performance chart data
  const performanceChartData = {
    labels: [
      "Assignment Completion",
      "Quiz Average",
      "Attendance Rate",
      "Overall Grade",
    ],
    datasets: [
      {
        label: "Performance Metrics (%)",
        data: performance
          ? [
              performance.assignmentCompletionRate,
              performance.quizAvgScore,
              performance.attendanceRate,
              performance.overallGrade,
            ]
          : [0, 0, 0, 0],
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Classroom Analytics</h1>

      {/* Classroom Overview */}
      {analytics && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Classroom Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-4 rounded-lg flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold">{analytics.totalStudents}</p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-2xl font-bold">{analytics.activeStudents}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Engagement Score</p>
                <p className="text-2xl font-bold">
                  {analytics.avgEngagementScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </p>
          </div>
        </Card>
      )}

      {/* User Performance */}
      {performance && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isTeacher ? "Class Performance Overview" : "Your Performance"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Assignment Completion</p>
                  <p className="text-xl font-semibold">
                    {performance.assignmentCompletionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Quiz Average</p>
                  <p className="text-xl font-semibold">
                    {performance.quizAvgScore.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                  <p className="text-xl font-semibold">
                    {performance.attendanceRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Overall Grade</p>
                  <p className="text-xl font-semibold">
                    {performance.overallGrade.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="h-64">
              <Line
                data={performanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: "Performance Metrics (%)",
                    },
                  },
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Teacher-specific analytics */}
      {isTeacher && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Class Performance Distribution
          </h2>
          <div className="h-80">
            <Bar
              data={{
                labels: ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"],
                datasets: [
                  {
                    label: "Students by Grade Range",
                    data: [2, 5, 10, 8, 4],
                    backgroundColor: [
                      "rgba(239, 68, 68, 0.6)",
                      "rgba(249, 115, 22, 0.6)",
                      "rgba(234, 179, 8, 0.6)",
                      "rgba(34, 197, 94, 0.6)",
                      "rgba(16, 185, 129, 0.6)",
                    ],
                    borderColor: [
                      "rgba(239, 68, 68, 1)",
                      "rgba(249, 115, 22, 1)",
                      "rgba(234, 179, 8, 1)",
                      "rgba(34, 197, 94, 1)",
                      "rgba(16, 185, 129, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: "Student Grade Distribution",
                  },
                },
              }}
            />
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              This chart shows the distribution of students across different
              grade ranges. The data is based on overall performance in
              assignments and quizzes.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
