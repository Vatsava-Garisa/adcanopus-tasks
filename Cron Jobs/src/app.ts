
import "dotenv/config";
import cron from "node-cron";
import { Campaign } from "facebook-nodejs-business-sdk";

import { account } from "./utils/facebook.js";

const CAMPAIGN_CLEANUP_SCHEDULE = process.env.CAMPAIGN_CLEANUP_CRON ?? "0 */6 * * *";
const CAMPAIGN_PAGE_SIZE = 100;

let isJobRunning = false;

cron.schedule(CAMPAIGN_CLEANUP_SCHEDULE, () => {
    runCampaignCleanupJob("schedule");
});

/* For Debugging */
// runCampaignCleanupJob("startup");

console.log(
    `[${new Date().toISOString()}] Campaign cleanup scheduled with cron expression "${CAMPAIGN_CLEANUP_SCHEDULE}".`
);

async function runCampaignCleanupJob(trigger: "startup" | "schedule"): Promise<void> {
    if (isJobRunning) {
        console.warn(
            `[${new Date().toISOString()}] Skipping ${trigger} cleanup because a previous run is still in progress.`
        );
        return;
    }

    isJobRunning = true;

    try {
        const deletedCampaignsCount = await deleteAllCampaigns();
        console.log(
            `[${new Date().toISOString()}] ${trigger} cleanup finished. Marked ${deletedCampaignsCount} campaign(s) as deleted.`
        );
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ${trigger} cleanup failed: ${getErrorMessage(error)}`,
            error
        );
    } finally {
        isJobRunning = false;
    }
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

async function deleteCampaignBatch(campaignIds: string[]): Promise<number> {
    const results = await Promise.allSettled(
        campaignIds.map((campaignId) =>
            new Campaign(campaignId).update([], {
                status: Campaign.Status.deleted
            })
        )
    );

    let deletedCampaignsCount = 0;

    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            deletedCampaignsCount += 1;
            return;
        }

        console.error(
            `[${new Date().toISOString()}] Failed to delete campaign ${campaignIds[index]}: ${getErrorMessage(result.reason)}`
        );
    });

    return deletedCampaignsCount;
}

async function deleteAllCampaigns(): Promise<number> {
    let deletedCampaignsCount = 0;
    let campaigns = await account.getCampaigns(
        [Campaign.Fields.id],
        { limit: CAMPAIGN_PAGE_SIZE },
        true
    );

    while (campaigns.length > 0) {
        const campaignIds = campaigns
            .map((campaign) => campaign.id)
            .filter((campaignId): campaignId is string => Boolean(campaignId));

        deletedCampaignsCount += await deleteCampaignBatch(campaignIds);

        if (!campaigns.hasNext()) {
            break;
        }

        campaigns = await campaigns.next();
    }

    return deletedCampaignsCount;
}

/* Exceptions Handling */

process.on("unhandledRejection", (reason) => {
    console.error(
        `[${new Date().toISOString()}] Unhandled promise rejection: ${getErrorMessage(reason)}`,
        reason
    );
});

process.on("uncaughtException", (error) => {
    console.error(
        `[${new Date().toISOString()}] Uncaught exception: ${getErrorMessage(error)}`,
        error
    );
});
