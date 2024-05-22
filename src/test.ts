import axios from "axios";
import { bigNumber, formatBalance } from "./common/helper/bigNumber";

async function testF() {
  console.log("running ...");

  const raw = await axios.get(`https://api.ref.finance/list-pools`, {});

  // console.log("raw :", raw?.data);

  const filter = raw?.data?.filter(
    (i: any) =>
      bigNumber(i?.tvl).gt(0) &&
      bigNumber(i?.token0_ref_price).gt(0) &&
      (i?.token_account_ids as Array<string>).includes("dd.tg") &&
      ((i?.token_account_ids as Array<string>).includes("wrap.near") ||
        (i?.token_account_ids as Array<string>).includes(
          "usdt.tether-token.near"
        ))
  );
  console.log(
    "rs :",
    filter
      // .sort((a: any, b: any) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1))
      .sort((a: any, b: any) => (bigNumber(a.tvl).gte(b.tvl) ? 1 : -1))
      .map((i: any) => {
        return {
          // ...i,
          id: i?.id,
          // token_account_ids: i?.token_account_ids,
          // token_symbols: i?.token_symbols,
          token_account_ids: i?.token_account_ids.filter(
            (i: any) => i !== "wrap.near"
          )[0],
          token_symbols: i?.token_symbols.filter((i: any) => i !== "wNEAR")[0],
          token_price: i?.token0_ref_price,
          liq: formatBalance(i?.tvl),
        };
      })
  );
}

export { testF };
