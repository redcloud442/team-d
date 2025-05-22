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
    <div className="w-full rounded-md">
      <div className="flex sm:grid sm:grid-cols-6 gap-2 items-center">
        <span className="text-xs  font-semibold text-bg-primary-blue sm:col-span-1">
          Referral Link
        </span>

        <div className="flex sm:flex-row sm:col-span-5 gap-2 w-full">
          <div className="flex items-center gap-2 bg-white rounded-md w-full text-black font-semibold px-3 py-1">
            <span className="text-xs sm:text-lg max-w-[200px] sm:max-w-full truncate overflow-hidden whitespace-nowrap block w-full">
              {referral.company_referral_link}
            </span>
          </div>

          <Button
            variant="default"
            className="bg-bg-primary-blue text-black font-bold text-xs sm:text-sm rounded-md px-3"
            onClick={() => handleReferralLink(referral.company_referral_link)}
          >
            COPY
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardReferralLink;
