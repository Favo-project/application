module.exports = (app) => {
  const authRoutes = require("../routes/auth.routes");
  const campaignRoutes = require("../routes/campaign.routes");
  const userRoutes = require("../routes/user.routes");
  const uploadRoutes = require("../routes/upload.routes");
  const cartRoutes = require("../routes/cart.routes");
  const storeRoutes = require("../routes/store.routes");

  app.use("/auth", authRoutes);
  app.use("/campaigns", campaignRoutes);
  app.use("/users", userRoutes);
  app.use("/upload", uploadRoutes);
  app.use("/cart", cartRoutes);
  app.use("/store", storeRoutes);
};
