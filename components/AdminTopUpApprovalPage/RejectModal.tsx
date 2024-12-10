import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Control, Controller } from "react-hook-form";

type RejectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  control: Control<{ rejectNote: string }>;
};

const RejectModal = ({ open, onOpenChange, control }: RejectModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Request</DialogTitle>
        </DialogHeader>

        <Controller
          name="rejectNote"
          control={control}
          rules={{ required: "Rejection note is required" }}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Enter the reason for rejection..."
                {...field}
              />
              {fieldState.error && (
                <span className="text-red-500 text-sm">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />

        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button disabled={!control._formValues.rejectNote.trim()}>
            Confirm Rejection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RejectModal;
