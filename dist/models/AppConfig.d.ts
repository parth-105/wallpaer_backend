import { Document } from 'mongoose';
export interface IVersionConfig {
    minVersionCode: number;
    preReleaseBlocked: boolean;
    playStoreUrl: string;
    message: string;
}
export interface IAppConfig {
    key: string;
    versionConfig: IVersionConfig;
    updatedAt: Date;
}
export interface IAppConfigDocument extends IAppConfig, Document {
}
export declare const AppConfig: import("mongoose").Model<IAppConfigDocument, {}, {}, {}, Document<unknown, {}, IAppConfigDocument, {}, {}> & IAppConfigDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AppConfig.d.ts.map