// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
// import { handleUpdateWheelSetting } from "@/services/Wheel/Admin";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { alliance_wheel_settings_table } from "@prisma/client";
// import { Loader2 } from "lucide-react";
// import { Dispatch, SetStateAction, useMemo, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { z } from "zod";

// const EditWheelSchema = z.object({
//   percentage: z
//     .number()
//     .min(0.01, "Percentage must be at least 0.01%")
//     .max(100, "Percentage cannot exceed 100%")
//     .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
//       message: "Percentage must have at most 2 decimal places",
//     }),
//   label: z.string().min(1, "Label is required"),
//   color: z.string().min(1, "Color is required"),
// });

// type EditWheelFormType = z.infer<typeof EditWheelSchema>;

// type EditModalWheelProps = {
//   wheelSetting: alliance_wheel_settings_table;
//   allWheelSettings: alliance_wheel_settings_table[]; // All settings
//   setWheelSettings: Dispatch<SetStateAction<alliance_wheel_settings_table[]>>;
// };

// const EditModalWheel = ({
//   wheelSetting,
//   allWheelSettings,
//   setWheelSettings,
// }: EditModalWheelProps) => {
//   const [open, setOpen] = useState(false);
//   const { toast } = useToast();

//   const {
//     register,
//     handleSubmit,
//     setError,
//     control,
//     formState: { errors, isSubmitting },
//   } = useForm<EditWheelFormType>({
//     resolver: zodResolver(EditWheelSchema),
//     defaultValues: {
//       percentage: parseFloat(
//         wheelSetting.alliance_wheel_settings_percentage?.toFixed(2) ?? "0.00"
//       ),
//       label: wheelSetting.alliance_wheel_settings_label,
//       color: wheelSetting.alliance_wheel_settings_color,
//     },
//   });

//   const existingTotalPercentage = useMemo(
//     () =>
//       allWheelSettings
//         .filter(
//           (setting) =>
//             setting.alliance_wheel_settings_id !==
//             wheelSetting.alliance_wheel_settings_id
//         )
//         .reduce(
//           (sum, setting) => sum + setting.alliance_wheel_settings_percentage,
//           0
//         ),
//     [allWheelSettings, wheelSetting.alliance_wheel_settings_id]
//   );

//   const onSubmit = async (data: EditWheelFormType) => {
//     try {
//       const newTotal = existingTotalPercentage + data.percentage;

//       if (newTotal > 100) {
//         setError("percentage", {
//           type: "manual",
//           message: `Total percentage cannot exceed 100%. Remaining: ${(100 - existingTotalPercentage).toFixed(2)}%`,
//         });
//         return;
//       }

//       const updatedWheelSetting = await handleUpdateWheelSetting({
//         percentage: parseFloat(data.percentage.toFixed(2)),
//         label: data.label,
//         color: data.color,
//         id: wheelSetting.alliance_wheel_settings_id,
//       });

//       setWheelSettings((prev) => {
//         const updated = prev.map((setting) =>
//           setting.alliance_wheel_settings_id ===
//           wheelSetting.alliance_wheel_settings_id
//             ? {
//                 ...setting,
//                 alliance_wheel_settings_percentage:
//                   updatedWheelSetting.alliance_wheel_settings_percentage,
//                 alliance_wheel_settings_label:
//                   updatedWheelSetting.alliance_wheel_settings_label,
//                 alliance_wheel_settings_color:
//                   updatedWheelSetting.alliance_wheel_settings_color,
//               }
//             : setting
//         );
//         return updated;
//       });

//       toast({
//         title: "Wheel setting updated!",
//         description: "Changes have been saved successfully.",
//       });

//       setOpen(false);
//     } catch (error) {
//       toast({
//         title: "Error updating wheel setting!",
//         description: "Please try again.",
//       });
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline" className="rounded-md cursor-pointer">
//           Edit
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Edit Wheel Setting</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div>
//             <Label htmlFor="percentage">Percentage</Label>
//             <Controller
//               name="percentage"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="percentage"
//                   type="number"
//                   step="0.01"
//                   min="0.01"
//                   max="100"
//                   value={field.value}
//                   onChange={(e) => {
//                     const value = parseFloat(e.target.value);
//                     field.onChange(
//                       isNaN(value) ? "" : parseFloat(value.toFixed(2))
//                     ); // Force 2 decimal places
//                   }}
//                 />
//               )}
//             />
//             {errors.percentage && (
//               <p className="text-red-500 text-sm">
//                 {errors.percentage.message}
//               </p>
//             )}
//             <p className="text-gray-500 text-sm">
//               Value must be less than or equal to:
//               {(100 - existingTotalPercentage).toFixed(2)}%
//             </p>
//           </div>

//           <div>
//             <Label htmlFor="label">Reward</Label>
//             <Input id="label" type="text" {...register("label")} />
//             {errors.label && (
//               <p className="text-red-500 text-sm">{errors.label.message}</p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="color">Color</Label>
//             <Input
//               type="color"
//               className="h-20"
//               id="color"
//               {...register("color")}
//             />
//             {errors.color && (
//               <p className="text-red-500 text-sm">{errors.color.message}</p>
//             )}
//           </div>

//           <Button
//             disabled={isSubmitting}
//             type="submit"
//             className="rounded-md w-full"
//             variant="card"
//           >
//             {isSubmitting ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               "Save Changes"
//             )}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EditModalWheel;
