import jwt from "jsonwebtoken";


const authenticateUser = async (req, res, next) => {
  try {
    const token = req?.cookies?.seiagents;
    if (!token)
      return res
        .status(401)
        .send({
          success: false,
          message: "No token provided for authentication",
        });

    const decode = await jwt.verify(token, "45409feeefqw.OPIPOI909343Mafdaerdf.eri393529fiadfasdf5pdfakdfeopk");
    req.walletAddress = decode.walletAddress;
    req.userID = decode.userID;
    next();
  } catch (err) {
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
};


export default authenticateUser;