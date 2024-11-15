"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPools = getAllPools;
exports.getPools = getPools;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bigNumber_1 = require("../../common/helper/bigNumber");
const common_helper_1 = require("../../common/helper/common.helper");
const homepageController_1 = require("../common/homepageController");
const poolsFilePath = path_1.default.join(process.cwd(), "src", "seeds", "raydium-pools.seed.json");
const readPoolList = () => {
    if (fs_1.default.existsSync(poolsFilePath)) {
        const data = fs_1.default.readFileSync(poolsFilePath, "utf-8");
        return JSON.parse(data);
    }
    return [];
};
const writePoolList = (poolList) => {
    fs_1.default.writeFileSync(poolsFilePath, JSON.stringify(poolList, null, 2), "utf-8");
};
const maxRetries = 3;
const baseUrl = "https://api-v3.raydium.io/pools/info/list";
// max_page 490
async function getAllPools({ total_page = 10, per_page = 1000, timeDelay = 10000, }) {
    try {
        let allPools = [];
        for (let page = 1; page <= total_page; page++) {
            let retries = 0;
            while (retries < maxRetries) {
                try {
                    const response = await axios_1.default.get(baseUrl, {
                        params: {
                            poolType: "all",
                            poolSortField: "default",
                            sortType: "desc",
                            pageSize: per_page,
                            page,
                        },
                        headers: {
                            accept: "application/json, text/plain, */*",
                            "accept-language": "en-US,en;q=0.5",
                            origin: "https://raydium.io",
                            priority: "u=1, i",
                            referer: "https://raydium.io/",
                            "sec-ch-ua": '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": '"macOS"',
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "sec-gpc": "1",
                            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                        },
                    });
                    const poolData = response?.data?.data?.data || [];
                    allPools.push(...poolData.map((p) => {
                        return {
                            type: p.type,
                            id: p.id,
                            programId: p.programId,
                            mintA: p.mintA,
                            mintB: p.mintB,
                            tvl: p.tvl,
                            marketId: p.marketId,
                        };
                    }));
                    console.log(`Fetched page ${page}`);
                    break; // Thoát khỏi vòng lặp nếu thành công
                }
                catch (error) {
                    retries++;
                    console.error(`Error fetching `);
                    if (retries >= maxRetries) {
                        console.error(`Failed to fetch page ${page} after ${maxRetries} attempts.`);
                    }
                }
            }
        }
        console.log("allPools :", allPools);
        writePoolList(allPools
            .filter((p) => p &&
            [p?.mintA?.address, p?.mintB?.address].includes("So11111111111111111111111111111111111111112"))
            .map((p) => p?.tokenInfo
            ? p
            : {
                id: p.id,
                dexLink: p.id
                    ? `https://dexscreener.com/solana/${p.id}`
                    : "N/A",
            }));
    }
    catch (error) {
        console.log("error :", error);
    }
}
function generateMsgHTML(pool) {
    const infoToken = pool.mintA.address !== "So11111111111111111111111111111111111111112"
        ? pool.mintA
        : pool.mintB;
    const tokenAddress = infoToken.address;
    const poolDetails = pool?.tokenInfo
        ? {
            "⭐ TokenAddressLink": `https://solscan.io/token/${tokenAddress}`,
            "⭐ PoolLink": pool.id
                ? `https://raydium.io/liquidity/increase/?mode=add&pool_id=${pool.id}`
                : "N/A",
            "⭐ RaydiumLink": `https://raydium.io/swap/?inputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&outputMint=${infoToken.address}`,
            DexLink: pool.id ? `https://dexscreener.com/solana/${pool.id}` : "N/A",
            __: "==============================",
            TVL: `${(0, bigNumber_1.formatBalance)(pool.tvl)} $`,
            Name: infoToken.name,
            Symbol: infoToken.symbol,
            Tag: "From Raydium",
        }
        : {
            DexLink: pool.id ? `https://dexscreener.com/solana/${pool.id}` : "N/A",
            SolScan: infoToken.address
                ? `https://solscan.io/token/${infoToken.address}`
                : "N/A",
            "⭐ RaydiumLink": `https://raydium.io/swap/?inputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&outputMint=${infoToken.address}`,
        };
    return (0, common_helper_1.generateTelegramHTML)(poolDetails);
}
async function getTokenInfo(pairId) {
    const url = `https://io.dexscreener.com/dex/pair-details/v3/solana/${pairId}`;
    try {
        const response = await axios_1.default.get(url, {
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.7",
                origin: "https://dexscreener.com",
                priority: "u=1, i",
                referer: "https://dexscreener.com/",
                "sec-ch-ua": '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "sec-gpc": "1",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            },
        });
        return response?.data?.ti;
    }
    catch (error) {
        // console.error("Error fetching token info");
        return null;
    }
}
const poolsSeed = readPoolList();
async function getPools({ page = 1, per_page = 1000, timeDelay = 10000, }) {
    console.log(`v2 running cron job crawl radium getAllPools...`);
    try {
        const listNewPools = await axios_1.default.get(baseUrl, {
            params: {
                poolType: "all",
                poolSortField: "default",
                sortType: "desc",
                pageSize: per_page,
                page,
            },
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.5",
                origin: "https://raydium.io",
                priority: "u=1, i",
                referer: "https://raydium.io/",
                "sec-ch-ua": '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "sec-gpc": "1",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            },
        });
        const poolData = listNewPools?.data?.data?.data?.map((p) => {
            return {
                type: p.type,
                id: p.id,
                programId: p.programId,
                mintA: p.mintA,
                mintB: p.mintB,
                tvl: p.tvl,
                marketId: p.marketId,
            };
        }) || [];
        const newPools = [];
        const maxApiCalls = 10;
        for (const pool of poolData) {
            const isNew = [pool.mintA?.address, pool.mintB?.address].includes("So11111111111111111111111111111111111111112") &&
                !poolsSeed.find((j) => j.id.toLowerCase() === pool.id.toLowerCase());
            if (newPools.length > maxApiCalls) {
                break;
            }
            if (isNew) {
                try {
                    // await delay(500);
                    // const info = await getTokenInfo(pool.id);
                    // if (
                    //   !!info &&
                    //   info?.image &&
                    //   info?.headerImage &&
                    //   info?.description &&
                    //   info?.websites?.values &&
                    //   info?.socials?.find((i) => i?.type?.toLowerCase() === "twitter")
                    //     ?.url &&
                    //   isToday(info?.createdAt)
                    // ) {
                    //   newPools.push({ ...pool, tokenInfo: info }); // Thêm pool mới vào mảng
                    // } else {
                    //   newPools.push(pool);
                    // }
                    newPools.push(pool);
                }
                catch (error) {
                    // console.error("Error fetching pool info:", error?.message);
                    newPools.push(pool);
                }
            }
        }
        if (newPools.length) {
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: newPools.map((i) => generateMsgHTML(i)).join("\n\n"),
                options: { isSol: true },
            });
            poolsSeed.unshift(...newPools.map((p) => p?.tokenInfo
                ? p
                : {
                    id: p.id,
                    dexLink: p.id
                        ? `https://dexscreener.com/solana/${p.id}`
                        : "N/A",
                }));
            writePoolList(poolsSeed);
        }
    }
    catch (error) {
        console.error(`Error fetching raydium`);
    }
}
//# sourceMappingURL=raydium.js.map