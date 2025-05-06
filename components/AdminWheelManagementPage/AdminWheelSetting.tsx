// "use client";

// import { alliance_wheel_settings_table } from "@prisma/client";
// import dynamic from "next/dynamic";
// import { useState } from "react";
// import { Card } from "../ui/card";
// import EditModalWheel from "./EditModalWheel/EditModalWheel";
// const Wheel = dynamic(
//   () => import("react-custom-roulette").then((mod) => mod.Wheel),
//   {
//     ssr: false,
//   }
// );
// type DataListProps = {
//   wheelData: alliance_wheel_settings_table[];
// };

// const AdminWheelList = ({ wheelData }: DataListProps) => {
//   const [wheelSettings, setWheelSettings] =
//     useState<alliance_wheel_settings_table[]>(wheelData);

//   const wheelDataSetting = wheelData.map((prize) => ({
//     option:
//       prize.alliance_wheel_settings_label !== "NO REWARD" &&
//       prize.alliance_wheel_settings_label !== "RE-SPIN"
//         ? `₱ ${Number(prize.alliance_wheel_settings_label).toLocaleString(
//             "en-US",
//             {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             }
//           )}`
//         : prize.alliance_wheel_settings_label,
//     style: { backgroundColor: prize.alliance_wheel_settings_color },
//   }));

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col items-center justify-start space-y-6 mt-4  ">
//         <div className="relative">
//           <Wheel
//             mustStartSpinning={false}
//             prizeNumber={0}
//             data={wheelDataSetting}
//             onStopSpinning={() => {}}
//             textColors={["#ffffff"]}
//           />
//         </div>
//       </div>
//       {wheelSettings.length ? (
//         wheelSettings.map((setting) => (
//           <Card
//             key={setting.alliance_wheel_settings_id}
//             className="p-4 shadow-md rounded-md"
//           >
//             <div className="flex justify-between items-center">
//               <div className="flex flex-col justify-start">
//                 <h3 className="text-lg font-semibold">
//                   Reward: {setting.alliance_wheel_settings_label}
//                 </h3>

//                 <p className="text-gray-500">
//                   Percentage: {setting.alliance_wheel_settings_percentage}%
//                 </p>
//               </div>

//               <div className="flex justify-start">
//                 <EditModalWheel
//                   wheelSetting={setting}
//                   allWheelSettings={wheelSettings}
//                   setWheelSettings={setWheelSettings}
//                 />
//               </div>
//             </div>
//           </Card>
//         ))
//       ) : (
//         <p className="text-center text-gray-500">No results.</p>
//       )}
//     </div>
//   );
// };

// export default AdminWheelList;
