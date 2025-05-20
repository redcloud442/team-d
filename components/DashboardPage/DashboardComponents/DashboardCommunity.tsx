import DashboardCommunityCard from "@/components/DashboardCard/DashboardCommunityCard";

const DashboardCommunity = () => {
  return (
    <div>
      <div className="space-x-1 font-bold text-lg">
        <span>Join our</span>
        <span className="text-bg-primary-blue">DigiWealth</span>
        <span>Community!</span>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6">
        <DashboardCommunityCard
          imageSrc="/assets/icons/trading.ico"
          imageAlt="Trading"
          href="/trading"
          label="JOIN"
        />

        <DashboardCommunityCard
          imageSrc="/assets/icons/trading.ico"
          imageAlt="Trading"
          href="/trading"
          label="JOIN"
        />
      </div>
    </div>
  );
};

export default DashboardCommunity;
