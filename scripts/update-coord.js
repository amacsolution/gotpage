"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../lib/db");
var getCoordinates = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var url, response, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = "https://nominatim.openstreetmap.org/search.php?format=jsonv2&q=".concat(encodeURIComponent(address));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch(url)];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                data = _a.sent();
                if (data.length > 0) {
                    return [2 /*return*/, { lat: data[0].lat, lng: data[0].lon }];
                }
                else {
                    console.warn("Nie znaleziono współrzędnych dla adresu:", address);
                    return [2 /*return*/, null];
                }
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error("Błąd podczas pobierania współrzędnych:", error_1);
                return [2 /*return*/, null];
            case 5: return [2 /*return*/];
        }
    });
}); };
function SetCoordinates() {
    return __awaiter(this, void 0, void 0, function () {
        var ads, coordinates, _i, ads_1, ad, fullAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_1.query)('SELECT id, location, adress FROM ads WHERE coordinates = "" LIMIT 1')];
                case 1:
                    ads = _a.sent();
                    coordinates = null;
                    _i = 0, ads_1 = ads;
                    _a.label = 2;
                case 2:
                    if (!(_i < ads_1.length)) return [3 /*break*/, 10];
                    ad = ads_1[_i];
                    if (!(ad.location && ad.adress)) return [3 /*break*/, 4];
                    fullAddress = "".concat(ad.location, ", ").concat(ad.adress);
                    return [4 /*yield*/, getCoordinates(fullAddress)];
                case 3:
                    coordinates = _a.sent();
                    return [3 /*break*/, 7];
                case 4:
                    if (!ad.location) return [3 /*break*/, 6];
                    return [4 /*yield*/, getCoordinates(ad.location)];
                case 5:
                    coordinates = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    coordinates = null;
                    _a.label = 7;
                case 7: return [4 /*yield*/, (0, db_1.query)("INSERT INTO ads SET coordinates=? WHERE id=?", [JSON.stringify(coordinates), ad.id])];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10: return [2 /*return*/];
            }
        });
    });
}
SetCoordinates();
