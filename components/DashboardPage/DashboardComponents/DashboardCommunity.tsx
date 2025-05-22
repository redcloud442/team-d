import DashboardCommunityCard from "@/components/DashboardCard/DashboardCommunityCard";

const DashboardCommunity = () => {
  return (
    <div>
      <div className="space-x-1 font-bold text-lg">
        <span>Join our</span>
        <span className="text-bg-primary-blue">DIGIWEALTH</span>
        <span>Community!</span>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6">
        <DashboardCommunityCard
          imageSrc="/assets/icons/facebook.webp"
          imageAlt="Trading"
          href="https://www.facebook.com/digiwealth.ph"
          label="JOIN"
        />

        <DashboardCommunityCard
          imageSrc="/assets/icons/telegram.svg"
          imageAlt="Trading"
          href="https://t.me/digiwealthph"
          label="JOIN"
        />
      </div>
    </div>
  );
};

export default DashboardCommunity;
