import ChangePasswordUser from "@/components/UserAdminProfile/ChamgePasswordUser";

const page = () => {
  return (
    <>
      <div className="space-x-1">
        <span className="text-2xl font-bold">CHANGE</span>
        <span className="text-2xl font-bold text-bg-primary-blue">
          PASSWORD
        </span>
      </div>
      <ChangePasswordUser />
    </>
  );
};

export default page;
