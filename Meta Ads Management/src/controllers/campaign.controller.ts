
import { type NextFunction, type Request, type Response } from 'express';
import { Campaign } from "facebook-nodejs-business-sdk"

import { account, isCampaignValid, sanitizeCampaign } from '../utils/facebook.js';


/* To Get Campaigns */
export const getCampaign = async (
    req: Request,
    res: Response,
    _: NextFunction
) => {
    try {
        const rawCampaignId = req.params.campaignId;
        const fields = [
            Campaign.Fields.id,
            Campaign.Fields.name,
            Campaign.Fields.status,
            Campaign.Fields.objective
        ];

        if (rawCampaignId !== undefined) {
            if (!rawCampaignId || typeof rawCampaignId !== "string") {
                return res.status(400).json({
                    status: "Fail",
                    message: "Invalid campaign ID"
                });
            }

            const campaignId = rawCampaignId.trim();

            const campaign = new Campaign(campaignId);

            /* Check if campaign exists */
            const campaignData = await isCampaignValid(campaignId);

            if (!campaignData) {
                return res.status(404).json({
                    status: "Fail",
                    message: "Campaign does not exist or you do not have access"
                });
            }

            console.log(`Campaign ${campaignId} fetched successfully`);

            return res.status(200).json({
                status: "Success",
                message: "Campaign fetched successfully",
                data: sanitizeCampaign(campaignData)
            });
        }

        const campaigns = await account.getCampaigns(fields);
        const sanitizedCampaigns = campaigns.map(sanitizeCampaign);

        console.log('Campaigns fetched successfully');

        campaigns.forEach(campaign => {
            console.log(`ID: ${campaign.id}, Name: ${campaign.name}, Status: ${campaign.status}`);
        });

        return res.status(200).json({
            status: "Success",
            message: "Campaigns fetched successfully",
            data: sanitizedCampaigns
        });
    } catch (error: any) {
        if (req.params.campaignId) {
            console.error('Error fetching campaign:', error.response ?? error);
            return res.status(404).json({
                status: "Fail",
                message: "Campaign does not exist or you do not have access"
            });
        }

        console.error('Error fetching campaigns:', error.response ?? error);
        return res.status(500).json({
            status: "Fail",
            message: "Error while fetching campaigns, please try after sometime"
        });
    }
}

/* Create a Campaign */
export const createCampaign = async (
    req: Request,
    res: Response,
    _: NextFunction
) => {
    try {
        let { campaignName } = req.body;

        /* Validate Campaign Name */
        if (!campaignName || typeof campaignName !== "string") {
            return res.status(400).json({
                status: "Fail",
                message: "Invalid campaign name"
            });
        }

        campaignName = campaignName.trim();

        const campaignParams = {
            [Campaign.Fields.name]: campaignName,
            [Campaign.Fields.objective]: "OUTCOME_TRAFFIC",
            [Campaign.Fields.status]: "PAUSED",
            [Campaign.Fields.special_ad_categories]: ["NONE"],
            is_adset_budget_sharing_enabled: false,
            // execution_options: ["validate_only"] // Validate only
        };
        const campaign = await account.createCampaign([], campaignParams);

        console.log(`Campaign created successfully! ID: ${campaign.id}`);

        return res.status(201).json({
            status: "Success",
            message: "Campaign created successfully",
            data: {
                campaignId: campaign.id
            }
        });
    } catch (error: any) {
        console.error("Error creating campaign:", error.response ?? error);

        return res.status(500).json({
            status: "Fail",
            message: "Error while creating campaign, please try later"
        });
    }
};

/* Edit a Campaign */
export const editCampaign = async (
    req: Request,
    res: Response,
    _: NextFunction
) => {
    try {
        let { campaignId, campaignName } = req.body;

        /* Validate Campaign ID */
        if (!campaignId || typeof campaignId !== "string") {
            return res.status(400).json({
                status: "Fail",
                message: "Invalid campaign ID"
            });
        }

        /* Validate Campaign Name */
        if (!campaignName || typeof campaignName !== "string") {
            return res.status(400).json({
                status: "Fail",
                message: "Invalid campaign name"
            });
        }

        campaignId = campaignId.trim();
        campaignName = campaignName.trim();

        const campaign = new Campaign(campaignId);

        /* Check if campaign exists */
        const campaignData = await isCampaignValid(campaignId);
        if (!campaignData) {
            return res.status(404).json({
                status: "Fail",
                message: "Campaign does not exist or you do not have access"
            });
        }

        const paramsToUpdate = {
            [Campaign.Fields.name]: campaignName
        };
        const result = await campaign.update([], paramsToUpdate);

        console.log(`Campaign ${campaignId} updated successfully`, result);

        return res.status(200).json({
            status: "Success",
            message: "Campaign updated successfully",
            data: {
                campaignId
            }
        });
    } catch (error: any) {
        console.error("Error editing campaign:", error.response ?? error);

        return res.status(500).json({
            status: "Fail",
            message: "Error while editing campaign, please try later"
        });
    }
};

/* Delete a Campaign */
export const deleteCampaign = async (
    req: Request,
    res: Response,
    _: NextFunction
) => {
    try {
        let { campaignId } = req.params;

        /* Validate Campaign ID */
        if (!campaignId || typeof campaignId !== "string") {
            return res.status(400).json({
                status: "Fail",
                message: "Invalid campaign ID"
            });
        }

        campaignId = campaignId.trim();

        const campaign = new Campaign(campaignId);

        /* Check if campaign exists */
        const campaignData = await isCampaignValid(campaignId);

        if (!campaignData) {
            return res.status(404).json({
                status: "Fail",
                message: "Campaign does not exist or you do not have access"
            });
        }

        /* Delete campaign */
        await campaign.delete([]);

        console.log(`Campaign ${campaignId} deleted successfully`);

        return res.status(200).json({
            status: "Success",
            message: "Campaign deleted successfully"
        });
    } catch (error: any) {
        console.error("Error deleting campaign:", error.response ?? error);

        return res.status(500).json({
            status: "Fail",
            message: "Error while deleting campaign, please try later"
        });
    }
};
