import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function getGameDetails(appid: number) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    const { data } = await axios.get<SteamAppDetailsResponse>(url);
    const details = data[appid.toString()];
    return details.success ? details.data : null;
}

async function updateGameDetails(appid: number, details: SteamAppData) {
    await prisma.game.update({
        where: { appid },
        data: {
            type: details.type,
            shortDesc: details.short_description || undefined,
            detailedDesc: details.detailed_description || undefined,
            aboutTheGame: details.about_the_game || undefined,
            developers: details.developers?.join(', ') || undefined,
            publishers: details.publishers?.join(', ') || undefined,
            platforms: formatPlatforms(details.platforms),
            genres: details.genres?.map(g => g.description).join(', ') || undefined,
            categories: details.categories?.map(c => c.description).join(', ') || undefined,
            price: details.price_overview?.final_formatted || undefined,
            metacriticScore: details.metacritic?.score || undefined,
            isFree: details.is_free,
            releaseDate: details.release_date?.date || undefined,
        },
    });
}

function formatPlatforms(platforms: { windows: boolean; mac: boolean; linux: boolean }): string {
    return [
        platforms.windows && 'Windows',
        platforms.mac && 'Mac',
        platforms.linux && 'Linux',
    ].filter(Boolean).join(', ');
}

async function initGameDetails() {
    const batchSize = 200;
    let skip = 0;
    let processed = 0;

    while (true) {
        const games = await prisma.game.findMany({
            where: { type: 'unknown' },
            skip,
            take: batchSize,
        });

        if (games.length === 0) {
            console.log('Done processing all games.');
            break;
        }

        console.log(`Processing batch: ${processed} - ${processed + games.length}`);

        for (const game of games) {
            try {
                // steam API allows ~200 requests every 5 minutes
                await wait(1600);
                const details = await getGameDetails(game.appid);

                if (!details) {
                    console.log(`Skipping (no details): [${game.appid}] ${game.name}`);
                    await updateGameDetails(game.appid, getEmptyGameDetails())
                    continue;
                }

                await updateGameDetails(game.appid, details);
                console.log(`Initialized: [${game.appid}] ${game.name}`);
            } catch (error) {
                console.warn(`Failed on [${game.appid}] ${game.name}:`, error);
            }
        }

        skip += batchSize;
        processed += games.length;
    }

    await prisma.$disconnect();
}

function getEmptyGameDetails() {
    return {
        about_the_game: "",
        categories: [],
        detailed_description: "",
        genres: [],
        is_free: false,
        name: "",
        platforms: {linux: false, mac: false, windows: false},
        release_date: {coming_soon: false, date: ""},
        short_description: "",
        type: 'noDetails'}
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

initGameDetails();

// --- Types ---
interface SteamAppDetailsResponse {
    [appId: string]: {
        success: boolean;
        data?: SteamAppData;
    };
}

interface SteamAppData {
    type: string;
    name: string;
    is_free: boolean;
    detailed_description: string;
    about_the_game: string;
    short_description: string;
    website?: string;
    developers?: string[];
    publishers?: string[];
    price_overview?: PriceOverview;
    platforms: {
        windows: boolean;
        mac: boolean;
        linux: boolean;
    };
    metacritic?: {
        score: number;
        url: string;
    };
    categories: Category[];
    genres: Genre[];
    release_date: {
        coming_soon: boolean;
        date: string;
    };
}

interface PriceOverview {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
}

interface Category {
    id: number;
    description: string;
}

interface Genre {
    id: string;
    description: string;
}
