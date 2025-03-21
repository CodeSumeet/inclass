import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Users, Award, Activity, User, FileText } from "lucide-react";
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
import { Bar } from "react-chartjs-2";
import { fetchClassroomDetails } from "@/services/api";

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
  classroomId: string;
  totalStudents: number;
  activeStudents: number;
  avgEngagementScore?: number;
  assignmentStats?: {
    totalAssignments: number;
    submittedAssignments: number;
    averageScore: number;
  };
  quizStats?: {
    totalQuizzes: number;
    attemptedQuizzes: number;
    averageScore: number;
  };
  classroom?: {
    id: string;
    name: string;
    ownerId: string;
  };
  students?: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    performance?: {
      assignmentCompletionRate: number;
      quizAvgScore: number;
      overallGrade: number;
    };
  }>;
}

interface PerformanceMetric {
  id?: string;
  userId: string;
  classroomId: string;
  assignmentCompletionRate: number;
  quizAvgScore: number;
  overallGrade: number;
  user?: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
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
  const [studentPerformances, setStudentPerformances] = useState<
    PerformanceMetric[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!classroomId || !user) return;

      try {
        setLoading(true);

        try {
          const classroomData = await fetchClassroomDetails(classroomId);
          if (classroomData) {
            const userIsTeacher = classroomData.ownerId === user.userId;
            setIsTeacher(userIsTeacher);

            const analyticsData = await getClassroomAnalytics(classroomId);
            setAnalytics(analyticsData);

            if (userIsTeacher && analyticsData.students) {
              const formattedStudentPerformances = analyticsData.students.map(
                (student: any) => ({
                  userId: student.userId,
                  classroomId,
                  assignmentCompletionRate:
                    student.performance?.assignmentCompletionRate || 0,
                  quizAvgScore: student.performance?.quizAvgScore || 0,
                  overallGrade: student.performance?.overallGrade || 0,
                  user: {
                    userId: student.userId,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    profilePicture: student.profilePic,
                  },
                })
              );

              setStudentPerformances(formattedStudentPerformances);
            } else if (!userIsTeacher) {
              const studentData = analyticsData.students?.find(
                (s: any) => s.userId === user.userId
              );

              if (studentData && studentData.performance) {
                setPerformance({
                  userId: user.userId,
                  classroomId,
                  assignmentCompletionRate:
                    studentData.performance.assignmentCompletionRate,
                  quizAvgScore: studentData.performance.quizAvgScore,
                  overallGrade: studentData.performance.overallGrade,
                });
              } else {
                try {
                  const performanceData = await getUserPerformance(
                    classroomId,
                    user.userId
                  );
                  setPerformance(performanceData);
                } catch (perfError) {
                  console.error("Error fetching performance:", perfError);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error determining user role:", err);
        }

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

  const performanceChartData = {
    labels: ["Assignment Completion", "Quiz Average", "Overall Grade"],
    datasets: [
      {
        label: "Performance Metrics (%)",
        data: performance
          ? [
              performance.assignmentCompletionRate,
              performance.quizAvgScore,
              performance.overallGrade,
            ]
          : [0, 0, 0],
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

      {analytics && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Classroom Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-xl font-semibold">
                  {analytics.totalStudents}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {isTeacher ? "Total Assignments" : "Assignments"}
                </p>
                <p className="text-xl font-semibold">
                  {analytics.assignmentStats?.totalAssignments || 0}
                  {isTeacher && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({analytics.assignmentStats?.submittedAssignments || 0}{" "}
                      submitted)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Quiz Stats</p>
                <p className="text-xl font-semibold">
                  {analytics.quizStats?.totalQuizzes || 0} quizzes
                  <span className="text-sm text-gray-500 ml-2">
                    ({(analytics.quizStats?.averageScore || 0).toFixed(1)}% avg)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!isTeacher && performance && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Performance</h2>
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
                  <p className="text-sm text-gray-500">Overall Grade</p>
                  <p className="text-xl font-semibold">
                    {performance.overallGrade.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="h-64">
              <Bar
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

      {isTeacher && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Student Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Assignment Completion</th>
                  <th className="py-2 px-4 text-left">Quiz Average</th>
                  <th className="py-2 px-4 text-left">Overall Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentPerformances.length > 0 ? (
                  studentPerformances.map((student) => (
                    <tr key={student.userId}>
                      <td className="py-2 px-4 flex items-center">
                        {student.user?.profilePicture ? (
                          <img
                            src={student.user.profilePicture}
                            alt={`${student.user.firstName} ${student.user.lastName}`}
                            className="h-8 w-8 rounded-full object-cover mr-2"
                          />
                        ) : (
                          <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                        <span>
                          {student.user?.firstName} {student.user?.lastName}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {student.assignmentCompletionRate.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4">
                        {student.quizAvgScore.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded ${
                            student.overallGrade >= 80
                              ? "bg-green-100 text-green-800"
                              : student.overallGrade >= 60
                              ? "bg-blue-100 text-blue-800"
                              : student.overallGrade >= 40
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.overallGrade.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-gray-500"
                    >
                      No student performance data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
