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
var promise_1 = require("mysql2/promise");
var dotenv_1 = require("dotenv");
// Załaduj zmienne środowiskowe z pliku .env
dotenv_1.default.config();
function testConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var connectionOptions, connection, result, tables, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    connectionOptions = {
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME,
                        port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
                        connectTimeout: 10000, // 10 sekund
                    };
                    // Dodaj opcje SSL tylko jeśli jest włączone
                    if (process.env.DB_SSL === "true") {
                        connectionOptions.ssl = {};
                    }
                    return [4 /*yield*/, promise_1.default.createConnection(connectionOptions)];
                case 2:
                    connection = _a.sent();
                    return [4 /*yield*/, connection.execute("SELECT 1 as test")];
                case 3:
                    result = (_a.sent())[0];
                    return [4 /*yield*/, connection.execute("SHOW TABLES")];
                case 4:
                    tables = (_a.sent())[0];
                    // Zamknij połączenie
                    return [4 /*yield*/, connection.end()];
                case 5:
                    // Zamknij połączenie
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("\n❌ Błąd podczas połączenia z bazą danych:");
                    console.error(error_1);

            }
        });
    });
}
// Uruchom test
testConnection();
