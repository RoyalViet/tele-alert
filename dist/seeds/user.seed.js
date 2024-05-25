"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSeed = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.userSeed = [
    {
        email: "admin@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Administrator",
        lastName: "",
    },
    {
        email: "matteo@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Matteo",
        lastName: "Gleichner",
    },
    {
        email: "titus@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Titus",
        lastName: "Marvin",
    },
    {
        email: "diamond@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Diamond",
        lastName: "Beahan",
    },
    {
        email: "ivy@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Ivy",
        lastName: "Homenick",
    },
    {
        email: "diana@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Dianna",
        lastName: "McLaughlin",
    },
    {
        email: "gwen@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Gwen",
        lastName: "McKenzie",
    },
    {
        email: "emmalee@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Emmalee",
        lastName: "Braun",
    },
    {
        email: "angeline@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Angeline",
        lastName: "Hyatt",
    },
    {
        email: "josephine@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Josephine",
        lastName: "Mann",
    },
];
//# sourceMappingURL=user.seed.js.map