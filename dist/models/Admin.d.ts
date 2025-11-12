import { Document } from 'mongoose';
export interface IAdmin {
    email: string;
    password: string;
    role: 'admin';
}
export interface IAdminDocument extends IAdmin, Document {
    comparePassword(candidate: string): Promise<boolean>;
}
export declare const AdminModel: import("mongoose").Model<IAdminDocument, {}, {}, {}, Document<unknown, {}, IAdminDocument, {}, {}> & IAdminDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Admin.d.ts.map