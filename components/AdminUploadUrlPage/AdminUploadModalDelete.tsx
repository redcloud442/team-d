// import { useToast } from "@/hooks/use-toast";
// import { handleDeleteTestimonial } from "@/services/Testimonials/Admin";
// import { company_testimonial_table } from "@prisma/client";
// import { Loader2, Trash2 } from "lucide-react";
// import { Dispatch, SetStateAction, useState } from "react";
// import { Button } from "../ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../ui/dialog";

// type AdminUploadModalDeleteProps = {
//   testimonialId: string;
//   setTestimonials: Dispatch<SetStateAction<company_testimonial_table[]>>;
// };

// export const AdminUploadModalDelete = ({
//   testimonialId,
//   setTestimonials,
// }: AdminUploadModalDeleteProps) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleDeleteVideo = async () => {
//     try {
//       setIsLoading(true);
//       await handleDeleteTestimonial(testimonialId);

//       setTestimonials((prev) =>
//         prev.filter(
//           (testimonial) => testimonial.alliance_testimonial_id !== testimonialId
//         )
//       );
//       toast({
//         title: "Video deleted",
//         description: "The video has been deleted",
//       });

//       setIsOpen(false);
//       setIsLoading(false);
//     } catch (error) {
//       toast({
//         title: "Error deleting video",
//         description: "Please try again",
//       });
//       setIsLoading(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button
//           size="icon"
//           className="absolute top-2 right-2 z-50 cursor-pointer"
//           variant="destructive"
//         >
//           <Trash2 className="w-4 h-4" />
//         </Button>
//       </DialogTrigger>
//       <DialogContent type="earnings">
//         <DialogHeader>
//           <DialogTitle>
//             Are you absolutely you want to delete this video?
//           </DialogTitle>
//           <DialogDescription>
//             This action cannot be undone. This will permanently delete your
//             video.
//           </DialogDescription>
//         </DialogHeader>
//         <DialogFooter>
//           <Button
//             variant="destructive"
//             className="rounded-md w-full"
//             disabled={isLoading}
//             onClick={handleDeleteVideo}
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center gap-2">
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 <p>Deleting...</p>
//               </div>
//             ) : (
//               "Delete"
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };
