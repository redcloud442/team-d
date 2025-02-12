"use client";

import { Progress } from "@/components/ui/progress";
import { alliance_wheel_table } from "@prisma/client";
import { useEffect, useState } from "react";

interface RoadmapProps {
  allianceWheel: alliance_wheel_table;
}

const roadmapSteps = [
  { id: 1, label: "3 Referral + 4 spin", key: "three_referrals_count" },
  {
    id: 2,
    label: "200 Referrals + 10 spin",
    key: "two_hundred_referrals_amount",
  },
  {
    id: 3,
    label: "500 Referrals + 20 spin",
    key: "five_hundred_referrals_amount",
  },
  {
    id: 4,
    label: "10 Direct Referrals + 10 spin",
    key: "ten_direct_referrals_count",
  },
  {
    id: 5,
    label: "2500 Package Plan + 20 spin",
    key: "two_thousand_package_plan",
  },
];

const RoadmapComponent = ({ allianceWheel }: RoadmapProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const completedSteps = roadmapSteps.filter(
      (step) => allianceWheel[step.key as keyof typeof allianceWheel]
    ).length;
    setCurrentStep(completedSteps);
    setProgress((completedSteps / roadmapSteps.length) * 100);
  }, [allianceWheel]);

  return (
    <div className="p-4 sm:p-6 rounded-md shadow-md space-y-6 bg-black/40">
      <h2 className="text-md sm:text-xl font-bold text-white pb-14">
        Daily Task Progress
      </h2>
      <div className="relative w-full">
        <Progress value={progress} className="h-3 sm:h-4 bg-gray-600" />

        <div className="absolute top-2 left-0 w-full flex justify-between items-center mt-[-12px] sm:mt-[-16px]">
          {roadmapSteps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Circle marker */}
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${
                  index < currentStep
                    ? "bg-yellow-400 border-yellow-500"
                    : "bg-gray-400 border-gray-500"
                }`}
              ></div>

              <span
                className={`absolute text-[9px] sm:text-xs text-center ${
                  index % 2 === 0 ? "-top-16 sm:-top-16" : "top-8 sm:top-10"
                } ${
                  index === currentStep
                    ? "text-gray-400 font-bold"
                    : index < currentStep
                      ? "text-yellow-300"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Next Goal Section */}{" "}
      {currentStep < roadmapSteps.length ? (
        <div className="mt-4 text-yellow-300 font-semibold text-xs text-center sm:text-sm pt-10">
          <span>Next Goal: {roadmapSteps[currentStep]?.label}</span>
        </div>
      ) : (
        <div className="mt-4 text-green-500 font-semibold text-xs sm:text-sm">
          Completed!
        </div>
      )}
    </div>
  );
};

export default RoadmapComponent;
