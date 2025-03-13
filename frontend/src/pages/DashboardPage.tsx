import { FC } from "react";
import { BookOpen, Bell, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Card } from "@/components";
import { cn } from "@/lib/utils";

const DashboardPage: FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your classes today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
          >
            Join Class
          </Button>
          <Button size="sm">Create Class</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Classes</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Due This Week</p>
              <p className="text-2xl font-semibold">5</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Schedule and Due Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Today's Classes</h2>
          <Card>
            <div className="divide-y divide-gray-200">
              <ScheduleItem
                time="09:00 AM"
                title="Web Development"
                subtitle="Section A • Room 201"
                status="In Progress"
              />
              <ScheduleItem
                time="11:00 AM"
                title="Mobile Development"
                subtitle="Section B • Room 305"
                status="Upcoming"
              />
              <ScheduleItem
                time="02:00 PM"
                title="Database Design"
                subtitle="Section C • Room 102"
                status="Upcoming"
              />
            </div>
          </Card>
        </div>

        {/* Due Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Due Soon</h2>
          <Card>
            <div className="divide-y divide-gray-200">
              <AssignmentItem
                title="Project Milestone 1"
                course="Web Development"
                dueDate="Today"
                priority="high"
              />
              <AssignmentItem
                title="Database Schema Design"
                course="Database Design"
                dueDate="Tomorrow"
                priority="medium"
              />
              <AssignmentItem
                title="UI Wireframes"
                course="Mobile Development"
                dueDate="In 2 days"
                priority="low"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Card>
          <div className="divide-y divide-gray-200">
            <ActivityItem
              icon={<Bell className="h-4 w-4" />}
              title="New Announcement in Web Development"
              timestamp="2 hours ago"
            />
            <ActivityItem
              icon={<AlertCircle className="h-4 w-4" />}
              title="Assignment due date changed for Database Design"
              timestamp="5 hours ago"
            />
            <ActivityItem
              icon={<CheckCircle className="h-4 w-4" />}
              title="Grade posted for Mobile Development Quiz"
              timestamp="1 day ago"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper Components remain the same
interface ScheduleItemProps {
  time: string;
  title: string;
  subtitle: string;
  status: "Upcoming" | "In Progress" | "Completed";
}

const ScheduleItem: FC<ScheduleItemProps> = ({
  time,
  title,
  subtitle,
  status,
}) => (
  <div className="p-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">{time}</span>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
    <span
      className={cn(
        "text-sm px-2 py-1 rounded-full",
        status === "In Progress"
          ? "bg-primary/10 text-primary"
          : status === "Completed"
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-600"
      )}
    >
      {status}
    </span>
  </div>
);

interface AssignmentItemProps {
  title: string;
  course: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

const AssignmentItem: FC<AssignmentItemProps> = ({
  title,
  course,
  dueDate,
  priority,
}) => (
  <div className="p-4 flex items-center justify-between">
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{course}</p>
    </div>
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "text-sm px-2 py-1 rounded-full",
          priority === "high"
            ? "bg-red-100 text-red-600"
            : priority === "medium"
            ? "bg-orange-100 text-orange-600"
            : "bg-green-100 text-green-600"
        )}
      >
        Due {dueDate}
      </span>
    </div>
  </div>
);

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  timestamp: string;
}

const ActivityItem: FC<ActivityItemProps> = ({ icon, title, timestamp }) => (
  <div className="p-4 flex items-center gap-4">
    <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500">{timestamp}</p>
    </div>
  </div>
);

export default DashboardPage;
