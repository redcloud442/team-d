"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUserSponsor, updateUserProfileInfo } from "@/services/User/User";
import { useSponsorStore } from "@/store/useSponsortStore";
import { useRole } from "@/utils/context/roleContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { User2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DashboardDepositProfile from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositProfile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const formSchema = z.object({
  contactNo: z
    .string()
    .min(10, "Contact number must be 10 digits")
    .max(11, "Contact number must be 11 digits"),
  gender: z.enum(["MALE", "FEMALE"]),
});

const PersonalInformationLayout = () => {
  const { profile, setProfile } = useRole();
  const { sponsor, setSponsor } = useSponsorStore();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactNo: profile.user_phone_number || "",
      gender: (profile.user_gender as "MALE" | "FEMALE") || "MALE",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await updateUserProfileInfo({
        id: profile.user_id,
        contactNo: values.contactNo,
        gender: values.gender,
      });

      setProfile((prev) => ({
        ...prev,
        user_phone_number: response.data.user_phone_number,
        user_gender: response.data.user_gender,
      }));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const fetchUserSponsor = async () => {
      try {
        if (!profile.user_id || sponsor) return;
        const userSponsor = await getUserSponsor({ userId: profile.user_id });
        setSponsor(userSponsor);
      } catch (e) {}
    };
    fetchUserSponsor();
  }, [profile.user_id, sponsor]);

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col items-center gap-4 w-full max-w-xs sm:max-w-4xl text-xl">
        <Avatar className="w-32 h-32">
          <AvatarImage
            className="w-32 h-32"
            src={profile.user_profile_picture ?? ""}
          />
          <AvatarFallback className="dark:bg-gray-300">
            <User2 className="w-16 h-16" />
          </AvatarFallback>
        </Avatar>

        <DashboardDepositProfile />

        <Label>Sponsor Name</Label>
        <Input
          id="sponsor"
          value={sponsor ?? ""}
          readOnly
          className="text-center"
        />

        <Label>First Name</Label>
        <Input
          id="firstName"
          value={profile.user_first_name || ""}
          readOnly
          className="text-center"
        />

        <Label>Last Name</Label>
        <Input
          id="lastName"
          value={profile.user_last_name || ""}
          readOnly
          className="text-center"
        />

        <Label>Username</Label>
        <Input
          id="userName"
          value={profile.user_username || ""}
          readOnly
          className="text-center"
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4 border-t pt-6 mt-4"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Edit Information
            </h2>

            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Contact No.</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter contact number"
                      className="text-center"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Gender</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="text-center bg-white dark:bg-white border border-gray-300 focus:border-black focus:ring-black">
                        <SelectValue
                          className="text-center"
                          placeholder={field.value}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">MALE</SelectItem>
                        <SelectItem value="FEMALE">FEMALE</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PersonalInformationLayout;
