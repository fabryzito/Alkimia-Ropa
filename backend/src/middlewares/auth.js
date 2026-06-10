import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && user.status !== "inactive") {
      req.user = user;
    }

    return next();
  } catch (error) {
    return next();
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No autorizado - Token no proporcionado",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    if (req.user.status === "inactive") {
      return res.status(401).json({
        success: false,
        error: "Usuario inactivo",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "No autorizado - Token inválido",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `No tenés permiso para acceder a este recurso`,
      });
    }

    next();
  };
};