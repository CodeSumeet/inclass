import React from "react";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button/Button";
import { MoreVertical } from "lucide-react";
import { getAvatarUrl } from "../../../utils/getAvatarUrl";

interface ParticipantListProps {
  teachers: any[];
  students: any[];
  classCode: string;
  isTeacher: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  teachers,
  students,
  classCode,
  isTeacher,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="overflow-hidden">
        <div className="bg-primary text-white font-medium p-4">
          <h3 className="text-lg">Teachers</h3>
        </div>
        <div className="p-4">
          {teachers && teachers.length > 0 ? (
            <ul className="divide-y">
              {teachers.map((teacher) => (
                <li
                  key={teacher.id}
                  className="py-3 flex items-center"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 overflow-hidden">
                    {teacher.avatar ? (
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={getAvatarUrl({
                          name: teacher.name || "Teacher",
                          size: 40,
                        })}
                        alt={teacher.name || "Teacher"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-gray-500">
                      {teacher.email || "Teacher"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No teachers in this classroom.
            </p>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="bg-primary text-white font-medium p-4 flex justify-between items-center">
          <h3 className="text-lg">Students</h3>
          {students && (
            <span className="bg-white text-primary rounded-full text-sm px-2 py-0.5">
              {students.length || 0}
            </span>
          )}
        </div>
        <div className="p-4">
          {students && students.length > 0 ? (
            <ul className="divide-y">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-4 overflow-hidden">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={getAvatarUrl({
                            name: student.name || "Student",
                            size: 40,
                          })}
                          alt={student.name || "Student"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">
                        {student.email || "Student"}
                      </p>
                    </div>
                  </div>
                  {isTeacher && (
                    <Button variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-6">
              <p className="mb-2">
                No students have joined this classroom yet.
              </p>
              <p className="text-sm">
                Share the class code with your students:{" "}
                <span className="font-medium">{classCode}</span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ParticipantList;
