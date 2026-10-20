import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { ROLES } from '../constants/index.js';
import { Salon } from '../models/Salon.js';
import { User } from '../models/User.js';
import { ApiError, isDuplicateKeyError } from '../utils/ApiError.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { createSalonForOwner, toPoint } from './salon.service.js';

// bcrypt kasıtlı olarak yavaş bir algoritmadır. Tur sayısı arttıkça hash
// üretmek uzar; bu da veritabanı sızsa bile şifrelerin deneme yanılmayla
// çözülmesini pahalı hale getirir. Testlerde hız için düşük tutuyoruz.
const BCRYPT_ROUNDS = env.isTest ? 4 : 12;
const MAX_SESSIONS = 5;
const REFRESH_TTL_MS = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync('yok-boyle-bir-sifre', BCRYPT_ROUNDS);
const INVALID_SESSION = 'Oturumunuz geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.';

async function issueTokens(user) {
  const refreshToken = signRefreshToken(user._id);
  const session = { tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) };

  // $slice ile en fazla MAX_SESSIONS oturum tutulur; en eskisi düşer.
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
  // Kayıttaki "role" yalnızca hesap türü seçimidir ve validator tarafından
  // CUSTOMER / SALON ile sınırlandırılır. Kayıttan sonra rol değiştirilemez
  // ve yetki kararlarında istekten gelen hiçbir role bakılmaz; rol her zaman
  // veritabanındaki kullanıcı kaydından okunur.
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
      // Salon oluşturulamadıysa salonsuz bir salon hesabı bırakmıyoruz.
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  return { ...(await buildProfile(user)), ...(await issueTokens(user)) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  // Kullanıcı yoksa bile bir hash karşılaştırması yapıyoruz. Aksi halde
  // "kayıtlı olmayan e-posta" cevabı belirgin şekilde daha hızlı döner ve
  // saldırgan cevap süresinden hangi e-postaların kayıtlı olduğunu çıkarabilir.
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  // E-postanın mı şifrenin mi yanlış olduğunu söylemiyoruz; aynı sebep.
  if (!user || !passwordMatches) throw new ApiError(401, 'E-posta veya şifre hatalı.');

  return { ...(await buildProfile(user)), ...(await issueTokens(user)) };
}

// Refresh token rotasyonu: her yenilemede eski token geçersiz olur ve yenisi
// verilir. Çalınan bir refresh token böylece en fazla bir kez kullanılabilir.
export async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(401, INVALID_SESSION);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, INVALID_SESSION);
  }

  const tokenHash = hashToken(refreshToken);

  // "Token kayıtlı mı?" kontrolü ile silme işlemi tek sorguda yapılır.
  // Aynı token'la iki istek aynı anda gelse bile yalnızca biri başarılı olur.
  const user = await User.findOneAndUpdate(
    { _id: payload.sub, 'refreshTokens.tokenHash': tokenHash },
    { $pull: { refreshTokens: { tokenHash } } },
  );

  if (!user) {
    // İmzası geçerli ama kayıtlarımızda olmayan bir token, daha önce
    // kullanılmış (rotasyona uğramış) bir token'ın tekrar denendiğini
    // gösterir; bu token çalınmış olabilir. Güvenli tarafta kalıp
    // kullanıcının bütün oturumlarını kapatıyoruz.
    await User.updateOne({ _id: payload.sub }, { $set: { refreshTokens: [] } });
    throw new ApiError(401, INVALID_SESSION);
  }

  return { ...(await buildProfile(user)), ...(await issueTokens(user)) };
}

// Hassas işlemlerden (şifre değiştirme, hesap silme) önce mevcut şifre
// yeniden sorulur. Access token tek başına yeterli sayılmaz: açık bırakılmış
// bir oturumu ya da çalınmış bir token'ı ele geçiren kişi hesabı devralamaz.
export async function assertPassword(userId, password) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(400, 'Mevcut şifre hatalı.');
  }
  return user;
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await assertPassword(userId, currentPassword);

  // Şifre değişince bütün refresh token'lar silinir; diğer cihazlardaki
  // oturumlar kapanır. Şifre "hesabıma başkası girdi" şüphesiyle
  // değiştiriliyorsa beklenen davranış budur. İsteği yapan cihaza yeni bir
  // oturum verilir.
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
    // Geçersiz veya süresi dolmuş token zaten kullanılamaz; çıkış her
    // durumda başarılı sayılır.
  }
}
