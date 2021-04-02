const bcrypt = require("bcryptjs");

const generatePasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);

  const passwordHash = await bcrypt.hash(password, salt);

  return passwordHash;
};

const verifyPasswordHash = async (password, passwordHash) => {
  const isMatch = await bcrypt.compare(password, passwordHash);
  return isMatch;
};

module.exports = { generatePasswordHash, verifyPasswordHash };
