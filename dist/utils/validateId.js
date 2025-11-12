import mongoose from 'mongoose';
import createHttpError from 'http-errors';
/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The ID string to validate
 * @param fieldName - Optional field name for error message
 * @returns The validated ID string
 * @throws HttpError if ID is invalid
 */
export function validateObjectId(id, fieldName = 'id') {
    if (!id || typeof id !== 'string') {
        throw createHttpError(400, `${fieldName} is required`);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createHttpError(400, `Invalid ${fieldName} format`);
    }
    return id;
}
//# sourceMappingURL=validateId.js.map