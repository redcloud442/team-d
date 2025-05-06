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
// import { useToast } from "@/hooks/use-toast";
// import { logError } from "@/services/Error/ErrorLogs";
// import { escapeFormData } from "@/utils/function";
// import { createClientSide } from "@/utils/supabase/client";

// import { createAdminRaffle } from "@/services/Raffle/Admin";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { alliance_promo_table } from "@prisma/client";
// import { Loader2 } from "lucide-react";
// import { Dispatch, SetStateAction, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { z } from "zod";
// import { Textarea } from "../ui/textarea";

// type Props = {
//   setRaffle: Dispatch<SetStateAction<alliance_promo_table[]>>;
// };

// const PackagesSchema = z.object({
//   raffleTitle: z.string().min(1, "Raffle title is required"),
//   raffleDescription: z.string().min(1, "Raffle description is required"),
//   currentSlot: z.string().refine((value) => Number(value) > 0, {
//     message: "Current slot must be greater than 0",
//   }),
//   maximumSlot: z.string().refine((value) => Number(value) > 0, {
//     message: "Maximum slot must be greater than 0",
//   }),
// });

// export type PackagesFormValues = z.infer<typeof PackagesSchema>;

// const CreateRaffleModal = ({ setRaffle }: Props) => {
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
//       raffleTitle: "",
//       raffleDescription: "",
//       currentSlot: "",
//       maximumSlot: "",
//     },
//   });

//   const onSubmit = async (data: PackagesFormValues) => {
//     try {
//       const sanitizedData = escapeFormData(data);

//       const response = await createAdminRaffle({
//         raffleTitle: sanitizedData.raffleTitle,
//         raffleDescription: sanitizedData.raffleDescription,
//         currentSlot: Number(sanitizedData.currentSlot),
//         maximumSlot: Number(sanitizedData.maximumSlot),
//       });

//       setRaffle((prev) => [
//         ...prev,
//         response as unknown as alliance_promo_table,
//       ]);

//       toast({
//         title: "Raffle Created Successfully",
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
//           }}
//         >
//           Create Raffle
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Create Raffle</DialogTitle>
//           <DialogDescription></DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Raffle Title */}
//           <div>
//             <Label htmlFor="raffleTitle">Raffle Title</Label>
//             <Controller
//               name="raffleTitle"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="raffleTitle"
//                   placeholder="Enter raffle title"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.raffleTitle && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.raffleTitle.message}
//               </p>
//             )}
//           </div>

//           {/* Package Description */}
//           <div>
//             <Label htmlFor="raffleDescription">Raffle Description</Label>
//             <Controller
//               name="raffleDescription"
//               control={control}
//               render={({ field }) => (
//                 <Textarea
//                   id="raffleDescription"
//                   className="bg-pageColor dark:placeholder:text-white text-white font-semibold"
//                   placeholder="Enter raffle description"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.raffleDescription && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.raffleDescription.message}
//               </p>
//             )}
//           </div>

//           {/* Package Percentage */}
//           <div>
//             <Label htmlFor="currentSlot">Current Slot</Label>
//             <Controller
//               name="currentSlot"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="currentSlot"
//                   type="number"
//                   placeholder="Enter current slot"
//                   min="1"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.currentSlot && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.currentSlot.message}
//               </p>
//             )}
//           </div>

//           {/* Package Days */}
//           <div>
//             <Label htmlFor="maximumSlot">Maximum Slot</Label>
//             <Controller
//               name="maximumSlot"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   id="maximumSlot"
//                   type="number"
//                   placeholder="Enter maximum slot"
//                   min="1"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.maximumSlot && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.maximumSlot.message}
//               </p>
//             )}
//           </div>

//           <div className="flex justify-center items-center">
//             <Button
//               type="submit"
//               className="w-full rounded-md"
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

// export default CreateRaffleModal;
