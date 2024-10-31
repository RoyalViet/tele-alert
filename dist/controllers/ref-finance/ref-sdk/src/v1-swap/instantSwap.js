"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantSwap = void 0;
const format_1 = require("near-api-js/lib/utils/format");
const constant_1 = require("../constant");
const error_1 = require("../error");
const ref_1 = require("../ref");
const utils_1 = require("../utils");
const instantSwap = async ({ tokenIn, tokenOut, amountIn, slippageTolerance, swapTodos, AccountId, referralId, }) => {
    const transactions = [];
    if (swapTodos?.[swapTodos?.length - 1]?.outputToken !== tokenOut.id)
        throw error_1.SwapRouteError;
    const registerToken = async (token) => {
        const tokenRegistered = await (0, ref_1.ftGetStorageBalance)(token.id, AccountId).catch(() => {
            throw new Error(`${token.id} doesn't exist.`);
        });
        if (tokenRegistered === null) {
            transactions.push({
                receiverId: token.id,
                functionCalls: [
                    {
                        methodName: "storage_deposit",
                        args: {
                            registration_only: true,
                            account_id: AccountId,
                        },
                        gas: "30000000000000",
                        amount: (0, format_1.formatNearAmount)(await (0, ref_1.getMinStorageBalance)(token.id), 24),
                    },
                ],
            });
        }
    };
    if (tokenIn.id === constant_1.config.WRAP_NEAR_CONTRACT_ID) {
        const registered = await (0, ref_1.ftGetStorageBalance)(constant_1.config.WRAP_NEAR_CONTRACT_ID, AccountId);
        if (registered === null) {
            await registerToken(tokenIn);
        }
    }
    await registerToken(tokenOut);
    let actionsList = [];
    let allSwapsTokens = swapTodos.map((s) => [s.inputToken, s.outputToken]); // to get the hop tokens
    for (let i in allSwapsTokens) {
        let swapTokens = allSwapsTokens[i];
        if (swapTokens[0] === tokenIn.id && swapTokens[1] === tokenOut.id) {
            // parallel, direct hop route.
            actionsList.push({
                pool_id: swapTodos[i].pool.id,
                token_in: tokenIn.id,
                token_out: tokenOut.id,
                amount_in: swapTodos[i].pool.partialAmountIn,
                min_amount_out: (0, utils_1.round)(tokenOut.decimals, (0, utils_1.toNonDivisibleNumber)(tokenOut.decimals, (0, utils_1.percentLess)(slippageTolerance, swapTodos[i].estimate))),
            });
        }
        else if (swapTokens[0] === tokenIn.id) {
            // first hop in double hop route
            //TODO -- put in a check to make sure this first hop matches with the next (i+1) hop as a second hop.
            actionsList.push({
                pool_id: swapTodos[i].pool.id,
                token_in: swapTokens[0],
                token_out: swapTokens[1],
                amount_in: swapTodos[i].pool.partialAmountIn,
                min_amount_out: "0",
            });
        }
        else {
            // second hop in double hop route.
            //TODO -- put in a check to make sure this second hop matches with the previous (i-1) hop as a first hop.
            actionsList.push({
                pool_id: swapTodos[i].pool.id,
                token_in: swapTokens[0],
                token_out: swapTokens[1],
                min_amount_out: (0, utils_1.round)(tokenOut.decimals, (0, utils_1.toNonDivisibleNumber)(tokenOut.decimals, (0, utils_1.percentLess)(slippageTolerance, swapTodos[i].estimate))),
            });
        }
    }
    transactions.push({
        receiverId: tokenIn.id,
        functionCalls: [
            {
                methodName: "ft_transfer_call",
                args: {
                    receiver_id: constant_1.REF_FI_CONTRACT_ID,
                    amount: (0, utils_1.toNonDivisibleNumber)(tokenIn.decimals, amountIn),
                    msg: !!referralId
                        ? JSON.stringify({
                            force: 0,
                            actions: actionsList,
                            referral_id: referralId,
                        })
                        : JSON.stringify({
                            force: 0,
                            actions: actionsList,
                        }),
                },
                gas: "180000000000000",
                amount: constant_1.ONE_YOCTO_NEAR,
            },
        ],
    });
    return transactions;
};
exports.instantSwap = instantSwap;
//# sourceMappingURL=instantSwap.js.map