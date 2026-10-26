const jwt = require('jsonwebtoken');
const User = require('../models/User');
const COOKIE = 'dt_session';
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/', maxAge: 8 * 60 * 60 * 1000 });
function sessionCookie(res, user) {
  const token = jwt.sign({ sub: String(user._id), version: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '8h', algorithm: 'HS256' });
  res.cookie(COOKIE, token, cookieOptions());
}
function clearSession(res) { res.clearCookie(COOKIE, { ...cookieOptions(), maxAge: undefined }); }
async function requireAuth(req, res, next) {
  try {
    const value = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`));
    if (!value) return res.status(401).json({ message: 'Please sign in to continue.' });
    const claims = jwt.verify(decodeURIComponent(value.slice(COOKIE.length + 1)), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(claims.sub).select('+tokenVersion').lean();
    if (!user || (user.tokenVersion || 0) !== claims.version) return res.status(401).json({ message: 'Your session has ended. Please sign in again.' });
    req.user = user;
    return next();
  } catch (error) {
    if (/JsonWebToken|TokenExpired|NotBefore|CastError|URIError/.test(error.name)) return res.status(401).json({ message: 'Please sign in again.' });
    return res.status(503).json({ message: 'Unable to check your session. Please try again.' });
  }
}
const allowRoles = (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'You do not have permission for this action.' });
function trustedMutationOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || !req.headers.origin) return next();
  const allowed = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'https://dt-vehicles-frontend.vercel.app', 'https://dt-vehicles-management.vercel.app', process.env.FRONTEND_URL].filter(Boolean);
  return allowed.includes(req.headers.origin) ? next() : res.status(403).json({ message: 'Request origin is not allowed.' });
}
const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
module.exports = { requireAuth, allowRoles, trustedMutationOrigin, sessionCookie, clearSession, publicUser };
