import axios from "axios";
import { CronJob } from "cron";
import { ICreateToken } from "src/interfaces/token.interface";
import { bigNumber, formatBalance } from "../common/helper/bigNumber";
import { generateTelegramHTML } from "../common/helper/common.helper";
import { handlePushTelegramNotificationController } from "../controllers/common/homepageController";
import { alertTokenHandle } from "../controllers/token/token.handle";

const job = new CronJob("*/10 * * * * *", () => {
  // Tác vụ log message
  console.log("Đây là một log message.");
});

const checkReleasePoolToken = new CronJob("*/10 * * * * *", async () => {
  const contract = "dd.tg";
  const wNearContract = "wrap.near";
  const tokenWNear = "wNEAR";
  console.log(`v2 running cron job crawl pool token ${contract}...`);
  try {
    const raw = await axios.get(`https://api.ref.finance/list-pools`, {});

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

    if (rsFocus.length) {
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
