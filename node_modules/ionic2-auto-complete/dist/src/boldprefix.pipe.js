"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
/**
 * bolds the beggining of the matching string in the item
 */
let BoldPrefix = class BoldPrefix {
    transform(value, keyword) {
        return value.replace(new RegExp(keyword, 'gi'), function (str) { return str.bold(); });
    }
};
BoldPrefix = __decorate([
    core_1.Pipe({
        name: 'boldprefix'
    }),
    core_1.Injectable()
], BoldPrefix);
exports.BoldPrefix = BoldPrefix;
//# sourceMappingURL=boldprefix.pipe.js.map