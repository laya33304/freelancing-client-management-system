const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check whether user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check user's role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

module.exports = allowRoles;
