"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
// Entities
const user_entity_1 = require("../../entities/user/user.entity");
// Utilities
const encryption_utility_1 = __importDefault(require("../../utilities/encryption.utility"));
const api_utility_1 = __importDefault(require("../../utilities/api.utility"));
const date_time_utility_1 = __importDefault(require("../../utilities/date-time.utility"));
// Errors
const string_error_1 = require("../../errors/string.error");
const where = { isDeleted: false };
const create = async (params) => {
    const item = new user_entity_1.User();
    item.email = params.email;
    item.password = await encryption_utility_1.default.generateHash(params.password, 10);
    item.firstName = params.firstName;
    item.lastName = params.lastName;
    const userData = await (0, typeorm_1.getRepository)(user_entity_1.User).save(item);
    return api_utility_1.default.sanitizeUser(userData);
};
const login = async (params) => {
    const user = await (0, typeorm_1.getRepository)(user_entity_1.User)
        .createQueryBuilder("user")
        .where("user.email = :email", { email: params.email })
        .select([
        "user.created_at",
        "user.updated_at",
        "user.id",
        "user.email",
        "user.password",
        "user.firstName",
        "user.lastName",
        "user.isDeleted",
    ])
        .getOne();
    if (!user) {
        throw new string_error_1.StringError("Your email has not been registered");
    }
    if (await encryption_utility_1.default.verifyHash(params.password, user.password)) {
        return api_utility_1.default.sanitizeUser(user);
    }
    throw new string_error_1.StringError("Your password is not correct");
};
const getById = async (params) => {
    try {
        const data = await (0, typeorm_1.getRepository)(user_entity_1.User).findOne({ id: params.id });
        return api_utility_1.default.sanitizeUser(data);
    }
    catch (e) {
        return null;
    }
};
const detail = async (params) => {
    const query = {
        where: { ...where, id: params.id },
    };
    const user = await (0, typeorm_1.getRepository)(user_entity_1.User).findOne(query);
    if (!user) {
        throw new string_error_1.StringError("User is not existed");
    }
    return api_utility_1.default.sanitizeUser(user);
};
const update = async (params) => {
    const query = { ...where, id: params.id };
    const user = await (0, typeorm_1.getRepository)(user_entity_1.User).findOne(query);
    if (!user) {
        throw new string_error_1.StringError("User is not existed");
    }
    return await (0, typeorm_1.getRepository)(user_entity_1.User).update(query, {
        firstName: params.firstName,
        lastName: params.lastName,
        updated_at: date_time_utility_1.default.getCurrentTimeStamp(),
    });
};
const list = async (params) => {
    let userRepo = (0, typeorm_1.getRepository)(user_entity_1.User).createQueryBuilder("user");
    userRepo = userRepo.where("user.isDeleted = :isDeleted", {
        isDeleted: false,
    });
    if (params.keyword) {
        userRepo = userRepo.andWhere("(LOWER(user.firstName) LIKE LOWER(:keyword) OR LOWER(user.lastName) LIKE LOWER(:keyword))", { keyword: `%${params.keyword}%` });
    }
    // Pagination
    const paginationRepo = userRepo;
    const total = await paginationRepo.getMany();
    const pagRes = api_utility_1.default.getPagination(total.length, params.limit, params.page);
    userRepo = userRepo
        .limit(params.limit)
        .offset(api_utility_1.default.getOffset(params.limit, params.page));
    const users = await userRepo.getMany();
    const response = [];
    if (users && users.length) {
        for (const item of users) {
            response.push(api_utility_1.default.sanitizeUser(item));
        }
    }
    return { response, pagination: pagRes.pagination };
};
const remove = async (params) => {
    const query = { ...where, id: params.id };
    const user = await (0, typeorm_1.getRepository)(user_entity_1.User).findOne(query);
    if (!user) {
        throw new string_error_1.StringError("User is not existed");
    }
    return await (0, typeorm_1.getRepository)(user_entity_1.User).update(query, {
        isDeleted: true,
        updated_at: date_time_utility_1.default.getCurrentTimeStamp(),
    });
};
exports.default = {
    create,
    login,
    getById,
    detail,
    update,
    list,
    remove,
};
//# sourceMappingURL=user.service.js.map