"use client";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // optional utility for styling
import { getAdminWithdrawalExport } from "@/services/Withdrawal/Admin";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { WithdrawListExportData } from "@/utils/types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type FormContextType = {
  type: string;
  dateFilter: { start: string; end: string };
};

const AdminExportContent = () => {
  const [exportData, setExportData] = useState<WithdrawListExportData[]>([]);
  const [headers, setHeaders] = useState<{ label: string; key: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, control, watch } = useForm<FormContextType>({
    defaultValues: {
      type: "withdrawal",
      dateFilter: {
        start: "",
        end: "",
      },
    },
  });

  const csvLinkRef = useRef<
    CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
  >(null);

  const selectedType = watch("type");

  const date = watch("dateFilter");

  const onSubmit = async (data: FormContextType) => {
    try {
      const limit = 500;
      let page = 1;
      let totalCount = 0;
      let allData: WithdrawListExportData[] = [];

      const { start, end } = data.dateFilter;

      if (!start || !end) {
        toast({
          title: "Error",
          description: "Please select a date range",
        });
        return;
      }

      setIsLoading(true);

      while (true) {
        const result = await getAdminWithdrawalExport({
          ...data,
          page,
          limit,
        });

        if (!result?.data) break;

        const currentBatch = result.data;
        totalCount = result.totalCount;

        allData = [...allData, ...currentBatch];

        const totalPages = Math.ceil(totalCount / limit);
        if (page >= totalPages) break;

        page++;
      }

      if (allData.length === 0) return;

      // Auto-generate headers from first row
      const generatedHeaders = Object.keys(allData[0]).map((key) => ({
        label: key,
        key,
      }));

      setExportData(allData);
      setHeaders(generatedHeaders);
      // Use HTMLAnchorElement type to access click()
      setTimeout(() => {
        csvLinkRef?.current?.link.click();
      }, 100);

      toast({
        title: "CSV generated successfully",
        description: "Please check your downloads folder",
      });
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Please try again",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isLoading && (
        <div
          className={`block absolute inset-0 top-0 left-0 bg-pageColor/50 dark:bg-zinc-800/70 z-50 transition-opacity duration-300`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-gray-500">uploading...</p>
            <p className="text-lg text-center text-red-500">
              Please stay on this page while uploading to prevent any errors
            </p>
          </div>
        </div>
      )}

      {exportData.length > 0 && (
        <CSVLink
          data={exportData}
          headers={headers}
          filename={`${selectedType}-${date.start ? formatDateToYYYYMMDD(date.start) : ""}-to-${date.end ? formatDateToYYYYMMDD(date.end) : ""}_withdrawals_export.csv`}
          ref={csvLinkRef}
          className="hidden"
        />
      )}
      {/* Select Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Date Range */}
      {selectedType && (
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="dateFilter.start"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-md h-12",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />

          <Controller
            control={control}
            name="dateFilter.end"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-md h-12",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      fromDate={date.start ? new Date(date.start) : undefined}
                      disabled={(date) => {
                        if (!date) return false;
                        return date < new Date(field.value);
                      }}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />
        </div>
      )}

      {/* Submit + CSV Download */}
      <div className="flex gap-4 mt-4">
        <Button className="w-full h-12 rounded-md" type="submit">
          Generate CSV
        </Button>
      </div>
    </form>
  );
};

export default AdminExportContent;
