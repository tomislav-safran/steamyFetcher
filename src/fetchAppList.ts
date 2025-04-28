import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const STEAM_APP_LIST_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/'

interface SteamApp {
    appid: number
    name: string
}

async function fetchAppList(): Promise<SteamApp[]> {
    const { data } = await axios.get(STEAM_APP_LIST_URL)
    return data.applist.apps
}

async function saveOrUpdateApps(apps: SteamApp[]) {
    for (const { appid, name } of apps) {
        if (!name.trim()) continue

        try {
            const existing = await prisma.game.findUnique({ where: { appid } })

            if (existing) {
                await updateGame(appid, name, existing.name)
            } else {
                await insertNewGame(appid, name)
            }
        } catch (err) {
            console.warn(`Error on [${appid}] ${name}: ${err}`)
        }
    }
}

async function updateGame(appid: number, newName: string, currentName: string) {
    if (newName !== currentName) {
        await prisma.game.update({
            where: { appid },
            data: { name: newName },
        })
        console.log(`Updated: [${appid}] ${newName}`)
    } else {
        console.log(`Skipped (no change): [${appid}] ${newName}`)
    }
}

async function insertNewGame(appid: number, name: string) {
    await prisma.game.create({
        data: {
            appid,
            name,
            type: 'unknown',
            isFree: false,
        },
    })
    console.log(`Saved new: [${appid}] ${name}`)
}

async function run() {
    console.log('Fetching Steam App List...')
    const apps = await fetchAppList()
    console.log(`Fetched ${apps.length} apps.`)

    await saveOrUpdateApps(apps)

    console.log('App list saved successfully.')
    await prisma.$disconnect()
}

run()