import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuthStore } from "../store/useAuthStore";

const ClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { user } = useAuthStore();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/classrooms/${classroomId}`);
        setClassroom(response.data);
      } catch (error) {
        setError("Failed to fetch classroom details.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [classroomId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!classroom) {
    return <div>Classroom not found.</div>;
  }

  const isTeacher = user?.userId === classroom.ownerId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">{classroom.name}</h1>
      <Card className="p-4 mb-4">
        <img
          src={classroom.coverImage}
          alt={`${classroom.name} cover`}
          className="w-full h-32 object-cover rounded-md mb-2"
        />
        <p className="text-sm text-gray-500">Subject: {classroom.subject}</p>
        <p className="text-sm text-gray-500">Section: {classroom.section}</p>
        <p className="text-sm text-gray-500">
          Description: {classroom.description}
        </p>
        <Button
          onClick={() => {
            /* Logic to join live class */
          }}
        >
          Join Live Class
        </Button>
      </Card>

      <h2 className="text-xl font-bold mb-2">Announcements</h2>
      <Card className="p-4 mb-4">
        {classroom.announcements && classroom.announcements.length > 0 ? (
          <ul>
            {classroom.announcements.map((announcement: any) => (
              <li
                key={announcement.id}
                className="text-sm text-gray-700"
              >
                {announcement.title} - {announcement.content}
              </li>
            ))}
          </ul>
        ) : (
          <p>No announcements for this classroom.</p>
        )}
      </Card>

      <h2 className="text-xl font-bold mb-2">Assignments</h2>
      <Card className="p-4 mb-4">
        {classroom.assignments && classroom.assignments.length > 0 ? (
          <ul>
            {classroom.assignments.map((assignment: any) => (
              <li
                key={assignment.id}
                className="text-sm text-gray-700"
              >
                {assignment.title} - Due: {assignment.dueDate}
              </li>
            ))}
          </ul>
        ) : (
          <p>No assignments for this classroom.</p>
        )}
      </Card>

      <h2 className="text-xl font-bold mb-2">Quizzes</h2>
      <Card className="p-4 mb-4">
        {classroom.quizzes && classroom.quizzes.length > 0 ? (
          <ul>
            {classroom.quizzes.map((quiz: any) => (
              <li
                key={quiz.id}
                className="text-sm text-gray-700"
              >
                {quiz.title} - Due: {quiz.dueDate}
              </li>
            ))}
          </ul>
        ) : (
          <p>No quizzes for this classroom.</p>
        )}
      </Card>

      <h2 className="text-xl font-bold mb-2">Performance Tracking</h2>
      <Card className="p-4 mb-4">
        {isTeacher ? (
          <p>Grades Overview: {/* Logic to display all grades */}</p>
        ) : (
          <p>Your Grades: {/* Logic to display only the student's grades */}</p>
        )}
      </Card>

      <h2 className="text-xl font-bold mb-2">Discussion Board</h2>
      <Card className="p-4 mb-4">
        <p>Discussion topics will be displayed here.</p>
      </Card>

      <Button onClick={() => window.history.back()}>Back to Classes</Button>
    </div>
  );
};

export default ClassroomPage;
