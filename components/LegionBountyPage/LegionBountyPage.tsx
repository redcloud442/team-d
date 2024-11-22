"use client";

import { LegionBountyColumn, Payment } from "./LegionBountyColumn";
import LegionBountyTable from "./LegionBountyTable";

const LegionBountyPage = () => {
  const data: Payment[] = [
    {
      id: "m5gr84i9",
      amount: 316,
      status: "success",
      email: "ken99@yahoo.com",
    },
    {
      id: "3u1reuv4",
      amount: 242,
      status: "success",
      email: "Abe45@gmail.com",
    },
    {
      id: "derv1ws0",
      amount: 837,
      status: "processing",
      email: "Monserrat44@gmail.com",
    },
    {
      id: "5kma53ae",
      amount: 874,
      status: "success",
      email: "Silas22@gmail.com",
    },
    {
      id: "bhqecj4p",
      amount: 721,
      status: "failed",
      email: "carmella@hotmail.com",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Legion Bounty Member
        </h1>
        <p className="mt-2 text-gray-600">
          View all your Legion Bounty Member, including successful, processing,
          and failed attempts.
        </p>
      </header>

      {/* Table Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Legion Bounty Member
        </h2>
        <LegionBountyTable columns={LegionBountyColumn} data={data} />
      </section>
    </div>
  );
};

export default LegionBountyPage;
