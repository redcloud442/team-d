// import RoadmapDailyTask from "@/components/SpinTheWheel/RoadmapDailyTask/RoadmapDailyTask";
// import { SpinWheel } from "@/components/SpinTheWheel/SpinTheWheel";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import Image from "next/image";
// import { useState } from "react";
// type Props = {
//   wheel: {
//     alliance_wheel_settings_id: string;
//     alliance_wheel_settings_label: string;
//     alliance_wheel_settings_percentage: number;
//     alliance_wheel_settings_color: string;
//   }[];
// };

// const DashboardSpinTheWheelModal = ({ wheel }: Props) => {
//   const [open, setOpen] = useState(false);

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(open) => {
//         setOpen(open);
//       }}
//     >
//       <DialogTrigger asChild>
//         <Button
//           className="h-44 flex items-center justify-start px-4 sm:justify-around sm:items-center text-xl sm:text-4xl max-w-full w-full"
//           onClick={() => setOpen(true)}
//         >
//           <p className="break-words whitespace-normal text-center animate-wiggle">
//             Spin The Wheel
//           </p>
//           <Image
//             src="/assets/wheel.png"
//             alt="wheel"
//             width={170}
//             height={170}
//             className="relative"
//           />
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="" type="table">
//         <ScrollArea className="h-[600px] sm:h-full">
//           <DialogHeader className="text-start text-2xl font-bold">
//             <DialogTitle className="text-2xl font-bold mb-4 flex justify-between gap-2"></DialogTitle>
//             <DialogDescription></DialogDescription>
//           </DialogHeader>
//           <div className="flex flex-col gap-4 p-2">
//             <RoadmapDailyTask />

//             <SpinWheel prizes={wheel} />
//           </div>
//           <DialogFooter></DialogFooter>
//         </ScrollArea>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default DashboardSpinTheWheelModal;
