import { Button } from "@/components/ui/button";
import { useRole } from "@/utils/context/roleContext";

type DashboardReferralLinkProps = {
  handleReferralLink: (referralLink: string) => void;
};

const DashboardReferralLink = ({
  handleReferralLink,
}: DashboardReferralLinkProps) => {
  const { referral } = useRole();

  return (
    <div className="w-full rounded-md border border-cyan-400 px-4 py-6">
      <div className="flex items-center w-full h-12 overflow-hidden rounded-md">
        {/* Label */}
        <div className="bg-black text-white text-xs font-semibold px-3 h-full flex items-center rounded-l-md">
          Referral link
        </div>

        {/* Link */}
        <div className="bg-teal-600 text-white text-xs sm:text-sm px-3 h-full flex items-center w-full truncate">
          {referral.company_referral_link}
        </div>

        {/* Copy Button */}
        <Button
          onClick={() => handleReferralLink(referral.company_referral_link)}
          className="bg-bg-primary-blue hover:bg-cyan-300 text-black font-bold text-xs sm:text-sm px-3 h-full rounded-none rounded-r-md"
        >
          Copy
        </Button>
      </div>
    </div>
  );
};

export default DashboardReferralLink;
