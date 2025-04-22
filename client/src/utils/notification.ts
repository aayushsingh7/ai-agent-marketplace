import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Notification class to handle toasts
class Notification {
  // Display success toast
  //@ts-ignore
  static success(message, options = {}) {
    toast.success(message, {
      position: "top-right",
      className: "custom-notification",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: { fontSize: "17px" },
      //   theme: "dark",
      transition: Bounce,
      ...options, // Allow overriding the default options
    });
  }

  // Display error toast
  //@ts-ignore
  static error(message, options = {}) {
    toast.error(message, {
      position: "top-right",
      className: "custom-notification",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      style: { fontSize: "17px" },
      progress: undefined,
      //   theme: "dark",
      transition: Bounce,
      ...options, // Allow overriding the default options
    });
  }

  // Display info toast
  //@ts-ignore
  static info(message, options = {}) {
    toast.info(message, {
      position: "top-right",
      className: "custom-notification",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      style: { fontSize: "17px" },
      progress: undefined,
      //   theme: "dark",
      transition: Bounce,
      ...options, // Allow overriding the default options
    });
  }

  // Display warning toast
  //@ts-ignore
  static warning(message, options = {}) {
    toast.warning(message, {
      position: "top-right",
      autoClose: 5000,
      className: "custom-notification",
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: { fontSize: "17px" },
      //   theme: "dark",
      transition: Bounce,
      ...options, // Allow overriding the default options
    });
  }

  // Display custom toast
  //@ts-ignore
  static custom(type, message, options = {}) {
    //@ts-ignore
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      style: { fontSize: "17px" },
      progress: undefined,
      //   theme: "dark",
      transition: Bounce,
      ...options, // Allow overriding the default options
    });
  }
}

export default Notification;