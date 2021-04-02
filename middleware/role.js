module.exports = (role) => {
  return (req, res, next) => {
    console.log("user role", req.user.role);
    console.log("required role", role);
    if (req.user && req.user.role === "super_admin") return next();
    else if (req.user && req.user.role === role) next();
    else res.status(404).send({ message: "Access denied, Unauthorized user" });
  };
};
