// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { ChartDataMember } from "@/utils/types";
// import {
//   company_earnings_table,
//   company_member_table,
//   package_table,
// } from "@prisma/client";
// import { Dispatch, SetStateAction } from "react";

// import DashboardDepositModalDeposit from "./DashboardDepositModal/DashboardDepositModalDeposit";
// import DashboardDepositModalPackages from "./DashboardDepositModal/DashboardDepositPackagesModal";

// type Props = {
//   teamMemberProfile: company_member_table;
//   packages: package_table[];
//   earnings: company_earnings_table;
//   setEarnings: Dispatch<SetStateAction<company_earnings_table | null>>;
//   setChartData: Dispatch<SetStateAction<ChartDataMember[]>>;
//   setIsActive: Dispatch<SetStateAction<boolean>>;
// };

// const DashboardDepositRequest = ({
//   packages,
//   setChartData,
//   teamMemberProfile,
//   earnings,
//   setEarnings,
//   setIsActive,
// }: Props) => {
//   return (
//     <>
//       <Card className="w-full mx-auto">
//         <CardHeader>
//           <CardTitle>Deposit Request</CardTitle>
//           <CardDescription>Inveest in your future with us </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex justify-between gap-4">
//             <h1 className="text-xl font-bold">Deposit Now</h1>
//             <div className="flex flex-col w-full  gap-2">
//               <DashboardDepositModalDeposit />

//               <DashboardDepositModalPackages packages={packages} />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//       {/* <ReactJoyride
//         steps={steps}
//         run={runTour}
//         continuous
//         callback={handleJoyrideCallback}
//         styles={{
//           options: {
//             zIndex: 10000,
//           },
//         }}
//       /> */}
//     </>
//   );
// };

// export default DashboardDepositRequest;
