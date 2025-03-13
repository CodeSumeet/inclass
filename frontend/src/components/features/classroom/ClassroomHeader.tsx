import React from "react";
import { Button } from "../../common/Button/Button";
import { ChevronLeft } from "lucide-react";

interface ClassroomHeaderProps {
  classroom: any;
}

const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({ classroom }) => {
  return (
    <div className="relative h-56 md:h-72 w-full overflow-hidden shadow-md">
      <img
        src={classroom.coverImage || "/placeholder.svg"}
        alt={`${classroom.name} cover`}
        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/40 to-transparent"></div>
      <Button
        className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-800"
        onClick={() => window.history.back()}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {classroom.name}
        </h1>
        <div className="flex items-center mt-3 text-white/90">
          <span className="text-sm md:text-base font-medium">
            {classroom.section}
          </span>
          <span className="mx-2">•</span>
          <span className="text-sm md:text-base font-medium">
            {classroom.subject}
          </span>
          {classroom.room && (
            <>
              <span className="mx-2">•</span>
              <span className="text-sm md:text-base font-medium">
                {classroom.room}
              </span>
            </>
          )}
        </div>
        <div className="mt-3">
          <span className="text-sm bg-primary text-white px-3 py-1 rounded-full font-medium shadow-sm">
            Class Code: {classroom.code}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClassroomHeader;
