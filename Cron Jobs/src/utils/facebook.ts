
import "dotenv/config";
import bizSdk from "facebook-nodejs-business-sdk"
import { Campaign, AdAccount } from "facebook-nodejs-business-sdk"

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const accountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

const api = bizSdk.FacebookAdsApi.init(accessToken as string);
// api.setDebug(true); // Helpful for seeing detailed errors

export const account = new AdAccount(accountId);

export type SanitizedCampaign = {
    id?: string;
    name?: string;
    status?: string;
    objective?: string;
};

/* Strip Facebook SDK internals before sending campaign data to clients */
export function sanitizeCampaign(campaign: any): SanitizedCampaign {
    return {
        id: campaign?.id,
        name: campaign?.name,
        status: campaign?.status,
        objective: campaign?.objective
    };
}

/* Utility to check whether the campaign is valid */
export async function isCampaignValid(campaignId: string) {
    if (!campaignId || typeof campaignId !== "string") {
        throw new Error("Invalid Campaign ID");
    }

    campaignId = campaignId.trim();

    try {
        const campaign = new Campaign(campaignId);

        const campaignData = await campaign.read([
            Campaign.Fields.id,
            Campaign.Fields.name,
            Campaign.Fields.status,
            Campaign.Fields.objective
        ]);

        return campaignData;
    } catch (error) {
        return null;
    }
}
