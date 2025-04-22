import jwt from "jsonwebtoken"

const validateAgentAccessToken = (req, res, next) => {
  const token = req.headers["sei-agents-api-key"];

  if (!token) {
    return res.status(401).send({ message: "No token provided", success: false });
  }

  if(token.startsWith("owner-privilage")) {
   req.userID = token.split("-").pop();
   req.requestType = "owner-privilage";
   return next();
  }

  if(token.startsWith("trail-use")) {
    req.userID = token.split("-").pop();
    req.requestType = "trail-use"
    return next()
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.requestType = "paid"
    req.creditID = decoded.userCreditID;
    req.userID = decoded.userID;
    next();
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success: false,
      message: "Oops! something went wrong while validating the token",
    });
  }
};

export default validateAgentAccessToken;
