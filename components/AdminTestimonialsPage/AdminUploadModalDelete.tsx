import { useToast } from "@/hooks/use-toast";
import { DeleteTestimonial } from "@/services/Testimonials/testimonials";
import { company_proof_table } from "@/utils/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type AdminUploadModalDeleteProps = {
  testimonialId: string;
};

export const AdminUploadModalDelete = ({
  testimonialId,
}: AdminUploadModalDeleteProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { mutate: deleteTestimonial, isPending } = useMutation({
    mutationFn: (testimonialId: string) => DeleteTestimonial(testimonialId),
    onMutate: async (testimonialId) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials-video"] });
      const previousData = queryClient.getQueryData(["testimonials-video"]);
      queryClient.setQueryData(
        ["testimonials-video"],
        (old: { pages: { data: company_proof_table[] }[] }) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: { data: company_proof_table[] }) => ({
              ...page,
              data: page.data.filter(
                (testimonial: company_proof_table) =>
                  testimonial.company_proof_id !== testimonialId
              ),
            })),
          };
        }
      );
      return { previousData };
    },
    onError: (error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["testimonials-video"], context.previousData);
      }
      toast({
        title: "Error deleting video",
        description: error.message,
      });
    },
    onSuccess: () => {
      toast({
        title: "Video deleted",
        description: "The video has been deleted",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="absolute top-2 right-2 z-50 cursor-pointer"
          variant="destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent type="earnings">
        <DialogHeader>
          <DialogTitle>
            Are you absolutely you want to delete this video?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            video.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            className="rounded-md w-full"
            disabled={isPending}
            onClick={() => deleteTestimonial(testimonialId)}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Deleting...</p>
              </div>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
