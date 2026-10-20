import { ROLES } from '../constants/index.js';
import { Salon } from '../models/Salon.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokens.js';

// Authentication: "Bu isteği kim yapıyor?"
// Authorization header'ındaki access token doğrulanır ve kullanıcı
// veritabanından okunur. Token geçerli olsa bile kullanıcı silinmiş
// olabilir; ayrıca rolü token'dan değil veritabanından almak, frontend'in
// gönderdiği hiçbir role güvenmediğimiz anlamına gelir.
export async function authenticate(req, _res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Bu işlem için giriş yapmalısınız.');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'Oturumunuz geçersiz veya süresi dolmuş.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Oturumunuz geçersiz veya süresi dolmuş.');

  req.user = user;
  next();
}

// Authorization: "Bu kullanıcı bu işlemi yapabilir mi?"
// authenticate'ten sonra çalışır. 401 "kim olduğunu bilmiyorum", 403 ise
// "kim olduğunu biliyorum ama iznin yok" demektir.
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Bu işlem için yetkiniz yok.');
    }
    next();
  };
}

// /api/salon/me altındaki bütün işlemler "giriş yapan kullanıcının salonu"
// üzerinde çalışır. Salon kimliği istekten alınmaz; token'daki kullanıcıdan
// türetilir. Böylece bir salon sahibi URL'yi veya body'yi değiştirerek başka
// bir salonun verisine ulaşamaz. Sonraki katmanlar yalnızca req.salon'u kullanır.
export async function attachSalon(req, _res, next) {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new ApiError(404, 'Bu hesaba bağlı bir salon bulunamadı.');

  req.salon = salon;
  next();
}

export const customerOnly = [authenticate, authorize(ROLES.CUSTOMER)];
export const salonOnly = [authenticate, authorize(ROLES.SALON), attachSalon];
