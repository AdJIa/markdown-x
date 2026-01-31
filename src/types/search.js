"use strict";
/**
 * 搜索功能相关类型定义
 * @module search
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchErrorCode = void 0;
/**
 * 搜索错误码
 */
var SearchErrorCode;
(function (SearchErrorCode) {
    /** 关键词无效 */
    SearchErrorCode["INVALID_KEYWORD"] = "INVALID_KEYWORD";
    /** 没有可搜索的站点 */
    SearchErrorCode["NO_SITES"] = "NO_SITES";
    /** 搜索超时 */
    SearchErrorCode["SEARCH_TIMEOUT"] = "SEARCH_TIMEOUT";
    /** 文件访问被拒绝 */
    SearchErrorCode["FILE_ACCESS_DENIED"] = "FILE_ACCESS_DENIED";
    /** 搜索被取消 */
    SearchErrorCode["SEARCH_CANCELLED"] = "SEARCH_CANCELLED";
    /** 未知错误 */
    SearchErrorCode["UNKNOWN"] = "UNKNOWN";
})(SearchErrorCode || (exports.SearchErrorCode = SearchErrorCode = {}));
