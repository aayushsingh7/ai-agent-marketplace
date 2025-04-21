const validateAgentAccessToken = (req, res, next) => {
  const token = req.headers["sei-agents-api-key"];
  if (!token) {
    return res.status(401).send({ message: "No token provided", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.creditID = decoded.userCreditID;
    req.userID = decoded.userID;
    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Oops! something went wrong while validating the token",
    });
  }
};

export default validateAgentAccessToken;
