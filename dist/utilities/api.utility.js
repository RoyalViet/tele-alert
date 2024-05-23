"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
class ApiUtility {
    static getCookieFromRequest(req, key) {
        if (req.headers.authorization) {
            return req.headers.authorization;
        }
        if (req.headers.cookie) {
            const results = req.headers.cookie.split(';');
            const filtered = results.filter((result) => {
                return result.startsWith(`${key}=`);
            });
            if (filtered.length > 0) {
                return filtered[0].split('=')[1];
            }
        }
        return null;
    }
    static sanitizeData(data) {
        const { createdAt, updatedAt } = data, basicData = __rest(data, ["createdAt", "updatedAt"]);
        return basicData;
    }
    static sanitizeUser(user) {
        const { password, isDeleted } = user, basicUser = __rest(user, ["password", "isDeleted"]);
        return basicUser;
    }
    static getQueryParam(req, type) {
        if (req && type && type !== '') {
            switch (type) {
                case 'limit': {
                    return req.query.limit ? parseInt(req.query.limit.toString(), 10) : 5;
                }
                case 'page': {
                    return req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
                }
                default: {
                    return req.query[type] ? req.query[type] : null;
                }
            }
        }
        return null;
    }
    static getOffset(limit, page) {
        return limit * page - limit;
    }
    static getPagination(total, limit, currentPage) {
        if (total) {
            const pagination = {
                currentPage,
                totalPages: Math.ceil(total / limit),
                previousPage: currentPage <= 1 ? null : currentPage - 1,
                nextPage: total - (currentPage * limit) > 0 ? currentPage + 1 : null,
                totalItems: total,
            };
            return { pagination };
        }
        return { pagination: null };
    }
}
exports.default = ApiUtility;
//# sourceMappingURL=api.utility.js.map