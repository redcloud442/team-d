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
    <div className="flex items-end justify-around flex-wrap">
      <span className="text-sm font-semibold text-bg-primary-blue">
        Referral Link
      </span>

      <div className="flex items-center gap-1 bg-white rounded-md text-black font-black px-2 py-1">
        <span className="text-[12px] max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
          {referral.company_referral_link}
        </span>
      </div>

      <Button
        variant="default"
        className=" bg-bg-primary-blue text-black font-black p-0 text-xs rounded-md px-2 h-6"
        onClick={() => handleReferralLink(referral.company_referral_link)}
      >
        COPY
      </Button>
    </div>
  );
};

export default DashboardReferralLink;
