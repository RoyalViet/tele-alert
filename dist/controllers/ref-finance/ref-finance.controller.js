"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPools = getAllPools;
exports.getTokenDetail = getTokenDetail;
exports.getTokensDetail = getTokensDetail;
const src_1 = require("./ref-sdk/src");
const class_transformer_1 = require("class-transformer");
const classTransformer_helper_1 = require("../../common/helper/classTransformer.helper");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const homepageController_1 = require("../common/homepageController");
const common_helper_1 = require("../../common/helper/common.helper");
const token_handle_1 = require("../token/token.handle");
const pool_token_cron_1 = require("../../cron/pool-token.cron");
class Pool {
    get token_contract() {
        return this.token_account_ids.find((i) => i !== "wrap.near");
    }
}
__decorate([
    (0, class_transformer_1.Expose)({ name: "id" }),
    __metadata("design:type", Number)
], Pool.prototype, "pool_id", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: "tokenIds" }),
    __metadata("design:type", Array)
], Pool.prototype, "token_account_ids", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: "pool_kind" }),
    __metadata("design:type", String)
], Pool.prototype, "poolKind", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: "decimals" }),
    __metadata("design:type", Object)
], Pool.prototype, "decimals", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: "icon" }),
    __metadata("design:type", String)
], Pool.prototype, "image", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: "symbol" }),
    __metadata("design:type", String)
], Pool.prototype, "symbol", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: "name" }),
    __metadata("design:type", String)
], Pool.prototype, "name", void 0);
// Đường dẫn tới file chứa các meme
const poolsFilePath = path_1.default.join(process.cwd(), "src", "seeds", "pools.seed.json");
// Hàm để đọc danh sách token từ file
const readPoolList = () => {
    if (fs_1.default.existsSync(poolsFilePath)) {
        const data = fs_1.default.readFileSync(poolsFilePath, "utf-8");
        return JSON.parse(data);
    }
    return [];
};
// Hàm để ghi danh sách token vào file
const writePoolList = (poolList) => {
    fs_1.default.writeFileSync(poolsFilePath, JSON.stringify(poolList, null, 2), "utf-8");
};
function generateMsgHTML(pool) {
    const poolDetails = {
        OwnerLink: pool?.owner && pool?.owner !== "null"
            ? `[${pool?.owner}](https://nearblocks.io/address/${pool?.owner}?tab=tokentxns)`
            : "N/A",
        OwnerPikeLink: pool?.owner && pool?.owner !== "null"
            ? `https://pikespeak.ai/wallet-explorer/${pool.owner}/transfers`
            : "N/A",
        AddressTokenLink: `https://nearblocks.io/address/${pool.token_contract}`,
        _: "==============================",
        Contract: pool.token_contract,
        PoolID: pool.pool_id || "N/A",
        TokenLink: `https://nearblocks.io/token/${pool.token_contract}`,
        RefLink: `https://app.ref.finance/#usdt.tether-token.near|${pool.token_contract}`,
        DexLink: pool.pool_id
            ? `https://dexscreener.com/near/refv1-${pool.pool_id}`
            : "N/A",
        __: "==============================",
        Owner: pool.owner,
        Name: pool.name,
        Symbol: pool.symbol,
        Decimals: pool.decimals,
    };
    return (0, common_helper_1.generateTelegramHTML)(poolDetails);
}
// Sử dụng hàm để lấy pool
const poolsSeed = readPoolList();
async function getAllPools() {
    console.log(`v2 running cron job crawl getAllPools...`);
    try {
        const pools = await (0, src_1.fetchAllPools)();
        const allPools = (0, classTransformer_helper_1.plainToClass)(Pool, [
            ...(pools.simplePools || []),
            ...(pools.unRatedPools || []),
            ...(pools.ratedPools || []),
            // ...(pools.simplePools.slice(-55) || []),
        ].filter((i) => i.tokenIds.includes("wrap.near")));
        const newPoolsPromises = allPools.map(async (i) => {
            const isNew = !poolsSeed.find((j) => j.pool_id === i.pool_id);
            if (isNew) {
                try {
                    const [info, owner] = await Promise.all([
                        getTokenDetail(i.token_contract),
                        (0, token_handle_1.getSignerFromContract)(i.token_contract),
                    ]);
                    return {
                        owner,
                        ...i,
                        token_contract: i.token_contract,
                        name: info.name,
                        symbol: info.symbol,
                        decimals: info.decimals,
                    };
                }
                catch (error) {
                    return {
                        owner: "N/A",
                        ...i,
                        token_contract: i.token_contract,
                        name: "N/A",
                        symbol: "N/A",
                        decimals: "N/A",
                    };
                }
            }
            return null;
        });
        const newPools = (await Promise.all(newPoolsPromises)).filter(Boolean);
        if (newPools.length) {
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: newPools.map((i) => generateMsgHTML(i)).join("\n\n"),
            });
            poolsSeed.unshift(...newPools);
            writePoolList(poolsSeed);
        }
        // return allPools;
    }
    catch (error) {
        (0, pool_token_cron_1.fetchAndProcessPools)();
        console.error("Error fetching pools:", error?.message || error);
        // return [];
    }
}
// Hàm lấy chi tiết metadata của một token
async function getTokenDetail(tokenId) {
    try {
        const tokenMetadata = await (0, src_1.ftGetTokenMetadata)(tokenId);
        return tokenMetadata;
    }
    catch (error) {
        console.error(`Error fetching token metadata for ${tokenId}:`, error);
    }
}
// Hàm lấy chi tiết metadata của nhiều token
async function getTokensDetail(tokenIds) {
    try {
        const tokensMetadata = await (0, src_1.ftGetTokensMetadata)(tokenIds, {});
        console.log("Tokens Metadata:", tokensMetadata);
    }
    catch (error) {
        console.error("Error fetching tokens metadata:", error);
    }
}
//# sourceMappingURL=ref-finance.controller.js.map