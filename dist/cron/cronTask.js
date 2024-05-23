"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkReleasePoolToken = exports.job = void 0;
const cron_1 = require("cron");
const bigNumber_1 = require("../common/helper/bigNumber");
const axios_1 = __importDefault(require("axios"));
const homepageController_1 = require("../controllers/homepageController");
const common_helper_1 = require("../common/helper/common.helper");
const job = new cron_1.CronJob("*/10 * * * * *", () => {
  // Tác vụ log message
  console.log("Đây là một log message.");
});
exports.job = job;
const checkReleasePoolToken = new cron_1.CronJob("*/10 * * * * *", () =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const contract = "dd.tg";
    console.log(`running cron job crawl pool token ${contract}...`);
    try {
      const raw = yield axios_1.default.get(
        `https://api.ref.finance/list-pools`,
        {}
      );
      const filterToken =
        (_a = raw === null || raw === void 0 ? void 0 : raw.data) === null ||
        _a === void 0
          ? void 0
          : _a.filter(
              (i) =>
                (0, bigNumber_1.bigNumber)(
                  i === null || i === void 0 ? void 0 : i.tvl
                ).gt(0) &&
                (0, bigNumber_1.bigNumber)(
                  i === null || i === void 0 ? void 0 : i.tvl
                ).gt(0) &&
                (i === null || i === void 0
                  ? void 0
                  : i.token_account_ids
                ).includes(contract) &&
                ((i === null || i === void 0
                  ? void 0
                  : i.token_account_ids
                ).includes("wrap.near") ||
                  (i === null || i === void 0
                    ? void 0
                    : i.token_account_ids
                  ).includes("usdt.tether-token.near"))
            );
      const rsFocus = filterToken
        .sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? -1 : 1))
        .map((i) => {
          return {
            // ...i,
            id: i === null || i === void 0 ? void 0 : i.id,
            token_account_ids:
              i === null || i === void 0 ? void 0 : i.token_account_ids,
            token_symbols:
              i === null || i === void 0 ? void 0 : i.token_symbols,
            token_price:
              i === null || i === void 0 ? void 0 : i.token0_ref_price,
            liq: (0, bigNumber_1.formatBalance)(
              i === null || i === void 0 ? void 0 : i.tvl
            ),
          };
        });
      if (rsFocus.length) {
        (0, homepageController_1.handlePushTelegramNotification)({
          body: rsFocus
            .map((i) => (0, common_helper_1.generateTelegramHTML)(i))
            .join("\n\n"),
        });
      }
    } catch (error) {
      console.log(`error`);
    }
    return;
  })
);
exports.checkReleasePoolToken = checkReleasePoolToken;
//# sourceMappingURL=cronTask.js.map
