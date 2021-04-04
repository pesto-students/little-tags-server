module.exports = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) next();
    res.status(404).send({ message: "Access denied, Unauthorized user" });
  };
};
