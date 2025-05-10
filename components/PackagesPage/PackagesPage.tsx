// "use client";
// import { package_table } from "@prisma/client";
// import { usePathname } from "next/navigation";
// import PackageCard from "../ui/packageCard";
// import PackageDescription from "../ui/packageDescription";

// type Props = {
//   packages: package_table[];
// };

// const PackagesPage = ({ packages }: Props) => {
//   const pathName = usePathname();

//   return (
//     <div className="flex flex-col items-center min-h-screen  px-6 py-12">
//       <PackageDescription />
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
//         {packages.map((pkg) => (
//           <PackageCard
//             key={pkg.package_id}
//             onClick={() => {}}
//             selectedPackage={pkg}
//             type={"MEMBER"}
//             packageName={pkg.package_name}
//             packageDescription={pkg.package_description}
//             packagePercentage={`${pkg.package_percentage} %`}
//             packageDays={String(pkg.packages_days)}
//             href={`${pathName}/${pkg.package_id}`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PackagesPage;
