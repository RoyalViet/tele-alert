import axios from "axios";
import { CronJob } from "cron";
import { ICreateToken } from "src/interfaces/token.interface";
import { bigNumber, formatBalance } from "../common/helper/bigNumber";
import { generateTelegramHTML } from "../common/helper/common.helper";
import { handlePushTelegramNotificationController } from "../controllers/common/homepageController";
import { alertTokenHandle } from "../controllers/token/token.handle";
import { listPriceSeed } from "../seeds/price-token.seed";

const job = new CronJob("*/10 * * * * *", () => {
  // Tác vụ log message
  console.log("Đây là một log message.");
});

let count = 1;
const MAX_COUNT = 100;
export const contract = "game.hot.tg";
const wNearContract = "wrap.near";

const checkReleasePoolToken = new CronJob("*/10 * * * * *", async () => {
  console.log(`v2 running cron job crawl pool token ${contract}...`);
  try {
    const raw = await axios.get(`https://api.ref.finance/list-pools`, {});

    try {
      const listPrice = await axios.get(
        `https://api.ref.finance/list-token-price`,
        {}
      );

      if (listPrice.data[contract]) {
        if (bigNumber(listPrice.data[contract]?.price).gt(0) && count < 100) {
          count++;
          handlePushTelegramNotificationController({
            body: generateTelegramHTML(listPrice.data[contract]),
          });
        }
      }
      if (Object.keys(listPrice.data || {})) {
        Object.keys(listPrice.data || {}).forEach((key: string) => {
          if (!listPriceSeed[key]) {
            handlePushTelegramNotificationController({
              body: generateTelegramHTML({
                ...listPrice.data[key],
                contract: key,
              }),
            });
            listPriceSeed[key] = { ...listPrice.data[key], contract: key };
          }
        });
      }
    } catch (error) {}

    const listInfoToken: Array<ICreateToken> = raw?.data
      ?.filter(
        (i: any) =>
          bigNumber(i?.tvl).gt(0) &&
          bigNumber(i?.token0_ref_price).gt(0) &&
          (i?.token_account_ids as Array<string>).includes(wNearContract)
        // ||
        // (i?.token_account_ids as Array<string>).includes(
        //   "usdt.tether-token.near"
        // )
      )
      .sort((a: any, b: any) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1))
      .map((i: any) => {
        return {
          pool_id: Number(i?.id),
          token_contract: (i?.token_account_ids as string[])?.find(
            (i) => i !== wNearContract
          ),
          token_account_ids: i?.token_account_ids as string[],
          token_symbols: i?.token_symbols as string[],
          token_price: bigNumber(i?.token0_ref_price).toNumber(),
          liq: bigNumber(i?.tvl).toNumber(),
          network: "Near",
        } as ICreateToken;
      });

    if (listInfoToken.length) {
      listInfoToken.forEach((i) => {
        alertTokenHandle(i);
      });
    }

    const filterToken = raw?.data?.filter(
      (i: any) =>
        bigNumber(i?.tvl).gt(0) &&
        bigNumber(i?.token0_ref_price).gt(0) &&
        (i?.token_account_ids as Array<string>).includes(contract) &&
        ((i?.token_account_ids as Array<string>).includes("wrap.near") ||
          (i?.token_account_ids as Array<string>).includes(
            "usdt.tether-token.near"
          ))
    );

    const rsFocus: Array<any> = filterToken
      .sort((a: any, b: any) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1))
      .map((i: any) => {
        return {
          // ...i,
          id: i?.id,
          token_account_ids: i?.token_account_ids,
          token_symbols: i?.token_symbols,
          token_price: i?.token0_ref_price,
          liq: formatBalance(i?.tvl),
        };
      });

    if (rsFocus.length && count < MAX_COUNT) {
      count++;
      handlePushTelegramNotificationController({
        body: rsFocus.map((i: any) => generateTelegramHTML(i)).join("\n\n"),
      });
    }
  } catch (error) {
    console.log(`error: `, error);
    // handlePushTelegramNotificationController({
    //   body: generateTelegramHTML({ error }),
    // });
  }
  return;
});

export { checkReleasePoolToken, job };
