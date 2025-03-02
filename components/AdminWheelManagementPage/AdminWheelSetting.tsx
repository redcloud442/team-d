import { alliance_wheel_settings_table } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { Card } from "../ui/card";
import EditModalWheel from "./EditModalWheel/EditModalWheel";

type DataListProps = {
  wheelData: alliance_wheel_settings_table[];
};

const AdminWheelList = ({ wheelData }: DataListProps) => {
  const [wheelSettings, setWheelSettings] =
    useState<alliance_wheel_settings_table[]>(wheelData);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-start space-y-6 mt-4  ">
        <div className="relative">
          <div
            className={`w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] rounded-full border-[10px] border-black text-white
              }`}
            style={{
              backgroundImage: `conic-gradient(${wheelSettings
                .map((setting, index) => {
                  const angle = (index / wheelSettings.length) * 360;
                  return `${setting.alliance_wheel_settings_color} ${angle}deg ${angle + 360 / wheelSettings.length}deg`;
                })
                .join(", ")})`,
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/app-logo.png"
                alt="Center Logo"
                width={80}
                height={80}
                className="rounded-full cursor-pointer"
              />
            </div>
            <div
              className="absolute top-1/2 left-1/2 origin-[0_-160px] sm:origin-[0_-160px]"
              style={{
                transform: `rotate(70deg)  translateY(-130px) rotate(-70deg)`, // Keeps the label upright
              }}
            >
              <div
                className="text-white text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  transform: `rotate(-10deg)`, // Rotate text vertically
                }}
              >
                {wheelSettings[0].alliance_wheel_settings_label}
              </div>
            </div>

            <div
              className="absolute top-1/2 left-1/2 origin-[0_-160px]"
              style={{
                transform: `rotate(125deg)  translateY(-130px) rotate(-122deg)`, // Keeps the label upright
              }}
            >
              <div
                className="text-white text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  transform: `rotate(40deg)`, // Rotate text vertically
                }}
              >
                {wheelSettings[1].alliance_wheel_settings_label}
              </div>
            </div>

            <div
              className="absolute top-1/2 left-1/2 origin-[0_-160px]"
              style={{
                transform: `rotate(161deg)  translateY(-130px)rotate(-140deg)`, // Keeps the label upright
              }}
            >
              <div
                className="text-white text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  transform: `rotate(70deg)`, // Rotate text vertically
                }}
              >
                {wheelSettings[2].alliance_wheel_settings_label}
              </div>
            </div>

            <div
              className="absolute top-1/2 left-1/2 origin-[0_-160px]"
              style={{
                transform: `rotate(-123deg)  translateY(-130px) rotate(127deg)`, // Keeps the label upright
              }}
            >
              <div
                className="text-white text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  transform: `rotate(140deg)`, // Rotate text vertically
                }}
              >
                {wheelSettings[3].alliance_wheel_settings_label}
              </div>
            </div>

            <div
              className="absolute top-1/2 left-1/2 origin-[0_-160px]"
              style={{
                transform: `rotate(-72deg)  translateY(-140px) rotate(80deg)`, // Keeps the label upright
              }}
            >
              <div
                className="text-white text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  transform: `rotate(10deg)`, // Rotate text vertically
                }}
              >
                {wheelSettings[4].alliance_wheel_settings_label}
              </div>
            </div>

            <div
              className="absolute top-1/2 left-1/2 origin-[0_-160px]"
              style={{
                transform: `rotate(-10deg)  translateY(-130px) rotate(30deg)`, // Keeps the label upright
              }}
            >
              <div
                className="text-white text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  transform: `rotate(40deg)`, // Rotate text vertically
                }}
              >
                {wheelSettings[5].alliance_wheel_settings_label}
              </div>
            </div>

            <div
              className="absolute top-1/2 left-1/2 origin-[0_-160px]"
              style={{
                transform: `rotate(20deg)  translateY(-130px) rotate(-5deg)`, // Keeps the label upright
              }}
            >
              <div
                className="text-white text-center"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  transform: `rotate(90deg)`, // Rotate text vertically
                }}
              >
                {wheelSettings[6].alliance_wheel_settings_label}
              </div>
            </div>
          </div>
        </div>
      </div>
      {wheelSettings.length ? (
        wheelSettings.map((setting) => (
          <Card
            key={setting.alliance_wheel_settings_id}
            className="p-4 shadow-md rounded-md"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col justify-start">
                <h3 className="text-lg font-semibold">
                  Reward: {setting.alliance_wheel_settings_label}
                </h3>

                <p className="text-gray-500">
                  Percentage: {setting.alliance_wheel_settings_percentage}%
                </p>
              </div>

              <div className="flex justify-start">
                <EditModalWheel
                  wheelSetting={setting}
                  allWheelSettings={wheelSettings}
                  setWheelSettings={setWheelSettings}
                />
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-center text-gray-500">No results.</p>
      )}
    </div>
  );
};

export default AdminWheelList;
