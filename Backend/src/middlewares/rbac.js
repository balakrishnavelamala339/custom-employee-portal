// Assumes verifyToken has already run and set req.user = { id, email, role }
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
    }

    next();
  };
};

module.exports = verifyRole;
