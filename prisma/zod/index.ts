import { z } from "zod";
import * as PrismaClient from "@prisma/client";

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

// PRISMA GENERATED ENUMS
//------------------------------------------------------

export const PhotoScalarFieldEnumSchema = z.nativeEnum(PrismaClient.Prisma.PhotoScalarFieldEnum);

export const QueryModeSchema = z.nativeEnum(PrismaClient.Prisma.QueryMode);

export const SharePhotoScalarFieldEnumSchema = z.nativeEnum(PrismaClient.Prisma.SharePhotoScalarFieldEnum);

export const SortOrderSchema = z.nativeEnum(PrismaClient.Prisma.SortOrder);

export const TransactionIsolationLevelSchema = z.nativeEnum(PrismaClient.Prisma.TransactionIsolationLevel);

export const UserScalarFieldEnumSchema = z.nativeEnum(PrismaClient.Prisma.UserScalarFieldEnum);

export const UserSessionScalarFieldEnumSchema = z.nativeEnum(PrismaClient.Prisma.UserSessionScalarFieldEnum);

// CUSTOM ENUMS
//------------------------------------------------------

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserSchema = z.object({
  id: z.number().int(),
  phone: z.string(),
  name: z.string(),
  surname: z.string(),
  hashedPassword: z.string(),
  saltPassword: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// USER SESSION
//------------------------------------------------------

export const UserSessionSchema = z.object({
  id: z.number().int(),
  clientName: z.string(),
  userId: z.number().int(),
  createdAt: z.date(),
});

// PHOTO
//------------------------------------------------------

export const PhotoSchema = z.object({
  id: z.number().int(),
  filename: z.string(),
  photoname: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number().int(),
});

// SHARE PHOTO
//------------------------------------------------------

export const SharePhotoSchema = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  photoId: z.number().int(),
  userId: z.number().int(),
});
