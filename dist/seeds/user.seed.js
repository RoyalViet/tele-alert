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
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "matteo@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Matteo",
        lastName: "Gleichner",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "titus@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Titus",
        lastName: "Marvin",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "diamond@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Diamond",
        lastName: "Beahan",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "ivy@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Ivy",
        lastName: "Homenick",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "diana@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Dianna",
        lastName: "McLaughlin",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "gwen@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Gwen",
        lastName: "McKenzie",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "emmalee@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Emmalee",
        lastName: "Braun",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "angeline@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Angeline",
        lastName: "Hyatt",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
    {
        email: "josephine@gmail.com",
        password: bcrypt_1.default.hashSync("password", 10),
        firstName: "Josephine",
        lastName: "Mann",
        created_at: "1716631493607",
        updated_at: "1716631493607",
    },
];
//# sourceMappingURL=user.seed.js.map