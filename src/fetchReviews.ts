import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function getReviewStats(appid: number): Promise<{
    reviewScore: number | null;
    reviewCount: number | null;
}> {
    const url = `https://store.steampowered.com/appreviews/${appid}?json=1&filter=summary`;
    try {
        const { data } = await axios.get(url);
        if (data.success !== 1) return { reviewScore: null, reviewCount: null };

        return {
            reviewScore: data.query_summary.review_score || null,
            reviewCount: data.query_summary.total_reviews || null,
        };
    } catch (err) {
        console.warn(`Failed to fetch review stats for app ${appid}:`, err);
        return { reviewScore: null, reviewCount: null };
    }
}

async function updateReviewData() {
    const batchSize = 200;
    let skip = 0;
    let totalUpdated = 0;

    while (true) {
        const games = await prisma.game.findMany({
            where: { type: 'game' },
            skip,
            take: batchSize,
        });

        if (games.length === 0) break;

        for (const game of games) {
            try {
                const { reviewScore, reviewCount } = await getReviewStats(game.appid);

                await prisma.game.update({
                    where: { appid: game.appid },
                    data: {
                        reviewScore: reviewScore || undefined,
                        reviewCount: reviewCount || undefined,
                    },
                });

                console.log(`Updated [${game.appid}] ${game.name}: ${reviewScore} (${reviewCount})`);
                totalUpdated++;
            } catch (err) {
                console.warn(`Failed to update [${game.appid}] ${game.name}:`, err);
            }
        }

        skip += batchSize;
    }

    console.log(`\n Finished. Total games updated: ${totalUpdated}`);
    await prisma.$disconnect();
}

updateReviewData();