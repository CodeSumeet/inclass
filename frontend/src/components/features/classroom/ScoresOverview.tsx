import React from "react";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button/Button";

const ScoresOverview: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          Grades Overview
        </h3>
        <div className="text-center py-10">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📊</span>
          </div>
          <p className="font-medium mb-1">Grade tracking coming soon</p>
          <p className="text-sm text-gray-500 mb-6">
            Track student progress and manage grades in one place
          </p>
          <Button disabled>Set Up Gradebook</Button>
        </div>
      </div>
    </Card>
  );
};

export default ScoresOverview;
