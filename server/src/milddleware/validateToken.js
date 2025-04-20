const validateToken = (req, res, next) => {
  const token = req.cookie.seiagent;
  if (!token) {
    throw new CustomError("No token provided", 401);
  }

  try {
    // Remove Bearer prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    const decoded = jwt.verify(token, this.jwtSecret);
    req.token = decoded;
    next();
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Oops! something went wrong while validating the token",
      });
  }
};

export default validateToken;
