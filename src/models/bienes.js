"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetModel = exports.AssetType = void 0;
var mongoose_1 = require("mongoose");
var mongoose_js_1 = require("../db/mongoose.js");
/**
 * Enum representing different types of assets.
 */
var AssetType;
(function (AssetType) {
    /** Represents a product-type asset. */
    AssetType["PRODUCT"] = "product";
    /** Represents an armor-type asset. */
    AssetType["ARMOR"] = "armor";
    /** Represents a weapon-type asset. */
    AssetType["WEAPON"] = "weapon";
    /** Represents a potion-type asset. */
    AssetType["POTION"] = "potion";
    /** Represents a book-type asset. */
    AssetType["BOOK"] = "book";
    /** Represents an unknown asset type. */
    AssetType["UNKNOWN"] = "unknown";
})(AssetType || (exports.AssetType = AssetType = {}));
var AssetSchema = new mongoose_1.Schema({
    id: {
        unique: true,
        type: Number,
        required: true,
        trim: true
        // Validar que no exista el id
    },
    name: {
        type: String,
        required: true,
        trim: true,
        validate: function (value) {
            if (!value.match(/^[A-Z]/)) {
                throw new Error('Asset title must start with a capital letter');
            }
        }
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    weight: {
        type: Number,
        required: true,
        trim: true
    },
    material: {
        type: String,
        required: true,
        trim: true
    },
    crown_value: {
        type: Number,
        required: true,
        trim: true,
        validate: function (value) {
            if (value <= 0) {
                throw new Error('The crown value has to be more than 0');
            }
        }
    },
    type: {
        type: String,
        required: true,
        trim: true,
        validate: function (value) {
            if (!Object.values(AssetType).includes(value)) {
                throw new Error("Invalid asset type: ".concat(value));
            }
        }
    },
    amount: {
        type: Number,
        trim: true,
        required: false // Indicating that this field is not mandatory
    }
});
exports.AssetModel = mongoose_js_1.assetsDB.model('AssetModel', AssetSchema);
