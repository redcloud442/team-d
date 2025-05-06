// "use client";

// import { Progress } from "@/components/ui/progress";
// import { useDailyTaskStore } from "@/store/useDailyTaskStore";
// import { ROADMAP_STEPS } from "@/utils/constant";
// import { useCallback, useEffect, useState } from "react";

// const RoadmapComponent = () => {
//   const [progress, setProgress] = useState(0);
//   const [currentStep, setCurrentStep] = useState<number>(0);
//   const { dailyTask } = useDailyTaskStore();

//   const handleCheckDailyTask = useCallback(() => {
//     const completedSteps = ROADMAP_STEPS.filter(
//       (step) =>
//         dailyTask.dailyTask[step.key as keyof typeof dailyTask.dailyTask]
//     ).length;
//     setCurrentStep(completedSteps);
//     setProgress((completedSteps / ROADMAP_STEPS.length) * 100);
//   }, [dailyTask]);

//   useEffect(() => {
//     handleCheckDailyTask();
//   }, [handleCheckDailyTask]);

//   return (
//     <div className="relative p-4 sm:p-6 rounded-md shadow-md space-y-6 bg-black/40">
//       <div className="flex flex-col pb-14 gap-4">
//         <h2 className="text-md sm:text-xl font-bold text-white">
//           Daily Task Progress
//         </h2>
//         <p className="text-white sm:text-sm text-xs">
//           Note : Same Day Invite Same Day Deposit = GET FREE SPIN
//         </p>
//       </div>
//       <div className="relative w-full">
//         <Progress value={progress} className="h-3 sm:h-4 bg-gray-600" />

//         <div className="absolute top-2 left-0 w-full flex justify-between items-center mt-[-12px] sm:mt-[-16px]">
//           {ROADMAP_STEPS.map((step, index) => (
//             <div key={step.id} className="relative flex flex-col items-center">
//               {/* Circle marker */}
//               <div
//                 className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${
//                   index < currentStep
//                     ? "bg-yellow-400 border-yellow-500"
//                     : "bg-gray-400 border-gray-500"
//                 }`}
//               ></div>

//               <span
//                 className={`absolute text-[9px] sm:text-xs text-center ${
//                   index % 2 === 0 ? "-top-16 sm:-top-16" : "top-8 sm:top-10"
//                 } ${
//                   index === currentStep
//                     ? "text-gray-400 font-bold"
//                     : index < currentStep
//                       ? "text-yellow-300"
//                       : "text-gray-400"
//                 }`}
//               >
//                 {step.label}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Next Goal Section */}{" "}
//       {currentStep < ROADMAP_STEPS.length ? (
//         <div className="mt-8 text-yellow-300 font-semibold text-xs text-center sm:text-sm pt-10">
//           <span>Next Goal: {ROADMAP_STEPS[currentStep].label}</span>
//         </div>
//       ) : (
//         <div className="mt-4 text-green-500 font-semibold text-xs sm:text-sm">
//           Completed!
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoadmapComponent;
