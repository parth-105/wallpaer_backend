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

    // Find admin by email (case-insensitive due to lowercase: true in schema)
    const admin = await AdminModel.findOne({ email: email.toLowerCase().trim() }).exec();
    
    if (!admin) {
      throw createHttpError(401, 'Invalid credentials');
    }

    // Compare password
    const match = await admin.comparePassword(password);
    if (!match) {
      throw createHttpError(401, 'Invalid credentials');
    }

    // Ensure admin has an ID (should always be present, but type safety check)
    if (!admin._id) {
      throw createHttpError(500, 'Admin ID is missing');
    }

    // Verify JWT secret is set
    if (!env.jwtSecret) {
      throw createHttpError(500, 'JWT secret is not configured');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: admin.email,
        role: admin.role || 'admin',
      },
      env.jwtSecret,
      {
        expiresIn: '12h',
        subject: admin._id.toString(),
      }
    );

    res.json(
      createResponse({
        data: {
          token,
          admin: {
            id: admin._id.toString(),
            email: admin.email,
          },
        },
      })
    );
  } catch (error) {
    // Log error for debugging
    if (error instanceof Error) {
      console.error('Login error:', error.message, error.stack);
    }
    next(error);
  }
}
