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
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { useToast } from "@/hooks/use-toast";
// import { logError } from "@/services/Error/ErrorLogs";
// import { updatePackagesData } from "@/services/Package/Admin";
// import { escapeFormData } from "@/utils/function";
// import { createClientSide } from "@/utils/supabase/client";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { company_member_table, package_table } from "@prisma/client";
// import { Loader2 } from "lucide-react";
// import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { z } from "zod";
// import FileUpload from "../ui/dropZone";

// type Props = {
//   teamMemberProfile: company_member_table;
//   selectedPackage: package_table | null;
//   handleSelectPackage: () => void;
//   setPackages: Dispatch<SetStateAction<package_table[]>>;
// };

// const PackagesSchema = z.object({
//   packageName: z.string().min(1, "Package name is required"),
//   packageDescription: z.string().min(1, "Package description is required"),
//   packagePercentage: z.string().refine((value) => Number(value) > 0, {
//     message: "Percentage must be greater than 0",
//   }),
//   packageDays: z.string().refine((value) => Number(value) > 0, {
//     message: "Days must be greater than 0",
//   }),
//   packageIsDisabled: z.boolean().optional(),
//   packageColor: z.string().optional(),
//   file: z
//     .instanceof(File)
//     .refine((file) => !!file, { message: "File is required" })
//     .refine(
//       (file) =>
//         ["image/jpeg", "image/png", "image/jpg"].includes(file.type) &&
//         file.size <= 12 * 1024 * 1024, // 12MB limit
//       { message: "File must be a valid image and less than 12MB." }
//     )
//     .optional(),
// });

// export type PackagesFormValues = z.infer<typeof PackagesSchema>;

// const EditPackagesModal = ({
//   teamMemberProfile,
//   selectedPackage,
//   handleSelectPackage,
//   setPackages,
// }: Props) => {
//   const supabaseClient = createClientSide();
//   const [open, setOpen] = useState(false);
//   const { toast } = useToast();

//   const {
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm<PackagesFormValues>({
//     resolver: zodResolver(PackagesSchema),
//     defaultValues: {
//       packageName: "",
//       packageDescription: "",
//       packagePercentage: "",
//       packageDays: "",
//       packageIsDisabled: false,
//       packageColor: "",
//     },
//   });

//   useEffect(() => {
//     if (selectedPackage) {
//       reset({
//         packageName: selectedPackage.package_name,
//         packageDescription: selectedPackage.package_description,
//         packagePercentage: selectedPackage.package_percentage.toString(),
//         packageDays: selectedPackage.packages_days.toString(),
//         packageIsDisabled: selectedPackage.package_is_disabled,
//         packageColor: selectedPackage.package_gif ?? "#F6DB4E",
//       });
//     }
//   }, [selectedPackage, reset]);

//   const onSubmit = async (data: PackagesFormValues) => {
//     try {
//       const sanitizedData = escapeFormData(data);
//       let url = "";
//       const file = data.file;

//       if (file) {
//         const filePath = `uploads/${Date.now()}_${file.name}`;

//         const { error: uploadError } = await supabaseClient.storage
//           .from("PACKAGE_IMAGES")
//           .upload(filePath, file, { upsert: true });

//         if (uploadError) {
//           return toast({
//             title: "Error",
//             description: "File upload failed.",
//             variant: "destructive",
//           });
//         }

//         const publicUrl =
//           "https://cdn.primepinas.com/storage/v1/object/public/PACKAGE_IMAGES/" +
//           filePath;

//         url = publicUrl;
//       }

//       const packageData = {
//         ...sanitizedData,
//         package_image: url,
//       };
//       const response = await updatePackagesData({
//         packageData: packageData,
//         teamMemberId: teamMemberProfile.company_member_id,
//         packageId: selectedPackage?.package_id ?? "",
//       });

//       setPackages((prev) =>
//         prev.map((item) =>
//           item.package_id === selectedPackage?.package_id
//             ? { ...item, ...response }
//             : item
//         )
//       );
//       toast({
//         title: "Package Updated Successfully",
//         description: "Please wait",
//       });
//       setOpen(false);
//       reset();
//     } catch (e) {
//       if (e instanceof Error) {
//         await logError(supabaseClient, {
//           errorMessage: e.message,
//           stackTrace: e.stack,
//           stackPath: "components/AdminPackagesPage/EditPackagesModal.tsx",
//         });
//       }
//       toast({
//         title: "Error",
//         description: e instanceof Error ? e.message : "An error occurred",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleClose = () => {
//     setOpen(false);
//     reset();
//   };

//   const uploadedFile = watch("file");

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}
//     >
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           className="rounded-md"
//           onClick={() => {
//             setOpen(true);
//             handleSelectPackage();
//           }}
//         >
//           Update Package
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-bold">
//             Update Package
//           </DialogTitle>
//           <DialogDescription></DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="flex justify-between items-center space-x-2">
//             <Label htmlFor="packageIsDisabled">Package Disabled</Label>
//             <div className="flex items-center space-x-2">
//               <Controller
//                 name="packageIsDisabled"
//                 control={control}
//                 render={({ field }) => (
//                   <>
//                     <span className="text-sm">
//                       {field.value ? "Hide" : "Show"}
//                     </span>
//                     <Switch
//                       id="packageIsDisabled"
//                       checked={field.value}
//                       onCheckedChange={field.onChange}
//                     />
//                   </>
//                 )}
//               />
//             </div>
//           </div>
//           {/* Package Name */}
//           <div>
//             <Label htmlFor="packageName">Package Name</Label>
//             <Controller
//               name="packageName"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="packageName"
//                   placeholder="Enter package name"
//                   readOnly={control._formValues.packageIsDisabled}
//                   {...field}
//                 />
//               )}
//             />
//             {errors.packageName && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.packageName.message}
//               </p>
//             )}
//           </div>

//           {/* Package Description */}
//           <div>
//             <Label htmlFor="packageDescription">Package Description</Label>
//             <Controller
//               name="packageDescription"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="packageDescription"
//                   placeholder="Enter package description"
//                   readOnly={control._formValues.packageIsDisabled}
//                   {...field}
//                 />
//               )}
//             />
//             {errors.packageDescription && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.packageDescription.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="packageColor">Package Color</Label>
//             <Controller
//               name="packageColor"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="packageColor"
//                   className="w-full py-0"
//                   type="color"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.packageColor && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.packageColor.message}
//               </p>
//             )}
//           </div>

//           {/* Package Percentage */}
//           <div>
//             <Label htmlFor="packagePercentage">Package Percentage</Label>
//             <Controller
//               name="packagePercentage"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="packagePercentage"
//                   type="number"
//                   placeholder="Enter package percentage"
//                   readOnly={true}
//                   min="1"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.packagePercentage && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.packagePercentage.message}
//               </p>
//             )}
//           </div>

//           {/* Package Days */}
//           <div>
//             <Label htmlFor="packageDays">Package Days</Label>
//             <Controller
//               name="packageDays"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="packageDays"
//                   type="number"
//                   placeholder="Enter package days"
//                   readOnly={true}
//                   min="1"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.packageDays && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.packageDays.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <Controller
//               name="file"
//               control={control}
//               render={({ field }) => (
//                 <FileUpload
//                   label="Upload Package Image"
//                   onFileChange={(file) => field.onChange(file)}
//                 />
//               )}
//             />
//             {!errors.file && uploadedFile && (
//               <p className="text-md font-bold text-green-700">
//                 {"File Uploaded Successfully"}
//               </p>
//             )}
//             {errors.file && (
//               <p className="text-primaryRed text-sm mt-1">
//                 {errors.file?.message}
//               </p>
//             )}
//           </div>

//           <div className="flex justify-center items-center">
//             <Button
//               type="submit"
//               className="w-full"
//               variant="card"
//               disabled={isSubmitting}
//             >
//               {isSubmitting && <Loader2 className="animate-spin mr-2" />} Submit
//             </Button>
//           </div>
//         </form>
//         <DialogFooter></DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EditPackagesModal;
