import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { ROLES } from '../constants/index.js';
import { Salon } from '../models/Salon.js';
import { User } from '../models/User.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { createSalonForOwner, toPoint } from './salon.service.js';

const BCRYPT_ROUNDS = env.isTest ? 4 : 12;
const MAX_SESSIONS = 5;
const REFRESH_TTL_MS = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync('yok-boyle-bir-sifre', BCRYPT_ROUNDS);
const INVALID_SESSION = 'Oturumunuz geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.';

async function issueTokens(user) {
  const refreshToken = signRefreshToken(user._id);
  const session = { tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) };

  await User.updateOne({ _id: user._id }, { $push: { refreshTokens: { $each: [session], $slice: -MAX_SESSIONS } } });

  return { accessToken: signAccessToken(user._id), refreshToken };
}

export async function buildProfile(user) {
  const profile = { user: user.toJSON() };
  if (user.role === ROLES.SALON) {
    profile.salon = await Salon.findOne({ owner: user._id });
  }
  return profile;
}

export async function register({ name, email, password, phone, role, salon }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await User.create({ name, email, phone, role, passwordHash });
  } catch (error) {
    if (isDuplicateKeyError(error, 'email')) throw new ApiError(409, 'Bu e-posta adresiyle kayıtlı bir hesap var.');
    throw error;
  }

  if (role === ROLES.SALON) {
    try {
      const { coordinates, ...details } = salon;
      await createSalonForOwner(user, { ...details, ...(coordinates && { location: toPoint(coordinates) }) });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  return { ...(await buildProfile(user)), ...(await issueTokens(user)) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) throw new ApiError(401, 'E-posta veya şifre hatalı.');

  return { ...(await buildProfile(user)), ...(await issueTokens(user)) };
}

export async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(401, INVALID_SESSION);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, INVALID_SESSION);
  }

  const tokenHash = hashToken(refreshToken);

  const user = await User.findOneAndUpdate(
    { _id: payload.sub, 'refreshTokens.tokenHash': tokenHash },
    { $pull: { refreshTokens: { tokenHash } } },
  );

  if (!user) {
    await User.updateOne({ _id: payload.sub }, { $set: { refreshTokens: [] } });
    throw new ApiError(401, INVALID_SESSION);
  }

  return { ...(await buildProfile(user)), ...(await issueTokens(user)) };
}

export async function assertPassword(userId, password) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(400, 'Mevcut şifre hatalı.');
  }
  return user;
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await assertPassword(userId, currentPassword);

  await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS), refreshTokens: [] } },
  );

  return { ...(await buildProfile(user)), ...(await issueTokens(user)) };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);
    await User.updateOne({ _id: payload.sub }, { $pull: { refreshTokens: { tokenHash: hashToken(refreshToken) } } });
  } catch {
    return;
  }
}
