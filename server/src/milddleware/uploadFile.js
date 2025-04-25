import cloudinary from "cloudinary";

const uploadFile = async (req, res, next) => {
  const { agentIcon } = req.body;
  try {
    const newImage = await cloudinary.v2.uploader.upload(agentIcon, {
      folder: "sei_agents/",
      format: "webp",
      transformation: {
        quality: 80,
        fetch_format: "webp",
      },
    });

    req.body.agentIcon = newImage.secure_url;
    next();
  } catch (err) {
    res.status(500).send(err);
  }
};

export default uploadFile;