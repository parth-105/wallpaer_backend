import { Request, Response } from 'express';
import { AppConfig } from '../models/AppConfig.js';

const DEFAULT_VERSION_CONFIG = {
  min_version_code: 1,
  pre_release_blocked: false,
  play_store_url: 'https://play.google.com/store/apps/details?id=com.live.wallpaper.a3d.a4k',
  message: 'This pre-release test version has ended. Please update to the official version on Google Play.',
};

/**
 * GET /api/v1/version-check (Public endpoint for Flutter App)
 */
export const getVersionStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const configDoc = await AppConfig.findOne({ key: 'version_config' }).lean();

    if (configDoc && configDoc.versionConfig) {
      const cfg = configDoc.versionConfig;
      res.json({
        status: 'success',
        data: {
          min_version_code: cfg.minVersionCode ?? DEFAULT_VERSION_CONFIG.min_version_code,
          pre_release_blocked: cfg.preReleaseBlocked ?? DEFAULT_VERSION_CONFIG.pre_release_blocked,
          play_store_url: cfg.playStoreUrl ?? DEFAULT_VERSION_CONFIG.play_store_url,
          message: cfg.message ?? DEFAULT_VERSION_CONFIG.message,
        },
      });
      return;
    }

    res.json({
      status: 'success',
      data: DEFAULT_VERSION_CONFIG,
    });
  } catch (error) {
    // Fail gracefully with default configuration if DB query fails
    res.json({
      status: 'success',
      data: DEFAULT_VERSION_CONFIG,
    });
  }
};

/**
 * GET /admin/version-config (Admin endpoint for Web Admin Panel)
 */
export const getAdminVersionConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const configDoc = await AppConfig.findOne({ key: 'version_config' }).lean();

    if (configDoc && configDoc.versionConfig) {
      const cfg = configDoc.versionConfig;
      res.json({
        success: true,
        data: {
          minVersionCode: cfg.minVersionCode ?? DEFAULT_VERSION_CONFIG.min_version_code,
          preReleaseBlocked: cfg.preReleaseBlocked ?? DEFAULT_VERSION_CONFIG.pre_release_blocked,
          playStoreUrl: cfg.playStoreUrl ?? DEFAULT_VERSION_CONFIG.play_store_url,
          message: cfg.message ?? DEFAULT_VERSION_CONFIG.message,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        minVersionCode: DEFAULT_VERSION_CONFIG.min_version_code,
        preReleaseBlocked: DEFAULT_VERSION_CONFIG.pre_release_blocked,
        playStoreUrl: DEFAULT_VERSION_CONFIG.play_store_url,
        message: DEFAULT_VERSION_CONFIG.message,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch version config' });
  }
};

/**
 * PUT /admin/version-config (Admin endpoint to update version config from Web Admin Panel)
 */
export const updateAdminVersionConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { minVersionCode, preReleaseBlocked, playStoreUrl, message } = req.body;

    const updatedConfig = await AppConfig.findOneAndUpdate(
      { key: 'version_config' },
      {
        $set: {
          key: 'version_config',
          versionConfig: {
            minVersionCode: typeof minVersionCode === 'number' ? minVersionCode : 1,
            preReleaseBlocked: Boolean(preReleaseBlocked),
            playStoreUrl: playStoreUrl || DEFAULT_VERSION_CONFIG.play_store_url,
            message: message || DEFAULT_VERSION_CONFIG.message,
          },
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).lean();

    res.json({
      success: true,
      message: 'Version configuration updated successfully',
      data: updatedConfig?.versionConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update version config' });
  }
};
