import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { AdminModel } from '../models/Admin.js';
import { env } from '../config/env.js';
import { createResponse } from '../utils/apiResponse.js';

export async function loginAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createHttpError(400, 'Email and password are required');
    }

    const admin = await AdminModel.findOne({ email }).exec();
    if (!admin) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const match = await admin.comparePassword(password);
    if (!match) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      {
        email: admin.email,
        role: 'admin',
      },
      env.jwtSecret,
      {
        expiresIn: '12h',
        subject: admin.id,
      }
    );

    res.json(
      createResponse({
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
          },
        },
      })
    );
  } catch (error) {
    next(error);
  }
}
