const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ success: false, error: error.errors });
  }
};

module.exports = validateBody;
