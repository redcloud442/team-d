import { company_promo_table } from "@/utils/types";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import FileUpload from "../ui/dropZone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

type BannerFormProps = {
  initialData?: company_promo_table;
  onSubmit: (data: Partial<{ company_promo_image: File | string }>) => void;
  isLoading: boolean;
};

export const BannerForm: React.FC<BannerFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<Partial<{ company_promo_image: File | string }>>({
    defaultValues: initialData || {
      company_promo_image: "",
    },
  });

  const { control, handleSubmit, formState } = form;

  return (
    <Form {...form}>
      {initialData && (
        <Image
          src={initialData?.company_promo_image || ""}
          alt="Banner"
          width={500}
          height={500}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="company_promo_image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUpload
                  label="BANNER IMAGE"
                  onFileChange={(file) => field.onChange(file)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={formState.isSubmitting || isLoading}
        >
          {initialData ? "Update" : "Create"}
          {formState.isSubmitting ||
            (isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />)}
        </Button>
      </form>
    </Form>
  );
};
