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
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
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
exports.createConnection = createConnection;
exports.default = change;
var mysql = require("mysql2/promise");
// Konfiguracja połączenia z bazą danych
function createConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var connectionOptions, connection, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    connectionOptions = {
                        host: "s11.cyber-folks.pl",
                        user: "biycgepwzk_backend",
                        password: "UcHxI5R-8%RH-jv!",
                        database: "biycgepwzk_gotpage",
                        port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
                        connectTimeout: 10000, // 10 sekund
                    };
                    // // Log connection options for debugging (do not log passwords in production)
                    // console.log("Connecting to MySQL with options:", {
                    //     host: connectionOptions.host,
                    //     user: connectionOptions.user,
                    //     database: connectionOptions.database,
                    //     port: connectionOptions.port,
                    //     ssl: process.env.DB_SSL
                    // });
                    // Dodaj opcje SSL tylko jeśli jest włączone
                    if (process.env.DB_SSL === "true") {
                        connectionOptions.ssl = {};
                    }
                    return [4 /*yield*/, mysql.createConnection(connectionOptions)];
                case 1:
                    connection = _a.sent();
                    return [2 /*return*/, connection];
                case 2:
                    error_1 = _a.sent();
                    console.error("Błąd połączenia z bazą danych:", error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function query(sql_1) {
    return __awaiter(this, arguments, void 0, function (sql, params) {
        var connection, results, error_2, closeError_1;
        if (params === void 0) { params = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 9]);
                    return [4 /*yield*/, createConnection()];
                case 1:
                    connection = _a.sent();
                    return [4 /*yield*/, connection.execute(sql, params)];
                case 2:
                    results = (_a.sent())[0];
                    return [2 /*return*/, results];
                case 3:
                    error_2 = _a.sent();
                    console.error("Błąd wykonania zapytania:", error_2);
                    throw error_2;
                case 4:
                    if (!connection) return [3 /*break*/, 8];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, connection.end()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    closeError_1 = _a.sent();
                    console.error("Błąd podczas zamykania połączenia:", closeError_1);
                    return [3 /*break*/, 8];
                case 8: return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
var users = [
    "ala-58e9e4",
    "kasiulex25-14a59d",
    "patinvest-sp.-z-o.o.-217d58",
    "izabelka123-de5c27",
    "anna-steinbrecher-9dd156",
    "dav&emi-f1d6ff",
    "angelofwest-dd18c7",
    "elektronika-4f4e72",
    "daw&emi-5077be",
    "aneta-rogowska-490d71",
    "lucy2003-9e4a4a",
    "beata-f9fae5",
    "majka95-ee2311",
    "wiktoria-77c330",
    "antoni-675e18",
    "klaudynka-83e1d6",
    "niusia03-23c592",
    "eazymut-10ddbe",
    "poddębice-aeb53b",
    "konrad-miku-0b1f83",
    "marlena-rito-95cd9f",
    "pioart-b1aed5",
    "antoni-6242a6",
    "rafal34s-c4295f",
    "klaudia20d-83ef09",
    "anna-fa51d4"
];
function change() {
    return __awaiter(this, void 0, void 0, function () {
        var ads, randomIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query('SELECT id FROM ads WHERE user_id = "anna-fa51d4" LIMIT 20')];
                case 1:
                    ads = _a.sent();
                    randomIndex = Math.floor(Math.random() * 26);
                    ads.map(function (ad) {
                        randomIndex = Math.floor(Math.random() * 26);
                        var user = users[randomIndex];
                        console.log("Changing user for ad ID ".concat(ad.id, " to ").concat(user));
                        return query('UPDATE ads SET user_id = ? WHERE id = ?', [user, ad.id]);
                    });
                    console.log("Job done", ads);
                    return [2 /*return*/];
            }
        });
    });
}
change();
