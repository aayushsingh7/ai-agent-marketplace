import cloudinary from "cloudinary";

const uploadFile = async (req, res, next) => {
  const { agentIcon } = req.body;
  if(!agentIcon) {
    req.body.agentIcon = "https://res.cloudinary.com/dvk80x6fi/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1745587157/artificial-intelligence-silhouette-vector-icons-isolated-on-white-cyber-technologies-icon_cikjrz.jpg"
    return next()
  }
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