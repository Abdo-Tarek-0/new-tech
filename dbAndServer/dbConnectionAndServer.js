import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server } from "socket.io";
import socketCache from "../src/services/cache.services/socket.cache.js";
dotenv.config();

const dbConnectionAndServer = (app) => {
  return mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected successfully to DB");
      const expressServer = app.listen(process.env.PORT || 5000, () =>
        console.log(`Server listening on port ${process.env.PORT || 5000}`)
      );

      const io = new Server(expressServer, {
        cors: {
          origin: "*",
        },
      });

      io.on("connection", (socket) => {
        console.log("A user connected.", socket.id);
        socket.on("addUser", (userId, isAdmin, cb) => {
          socketCache.addUser(userId, socket.id, isAdmin);
          const users = socketCache.getUsers((user) => user.isAdmin === false);

          io.emit("getUsers", users);
          if (cb && typeof cb === "function") cb(users);
        });
        socket.on("sendMessageToUser", ({ message, receiverId, adminId }) => {
          const user = socketCache.getUsers((user) => user.userId === receiverId);
          const admins = socketCache.getUsers((user) => user.isAdmin === true);

          admins?.forEach((admin) => {
            if (admin.userId != adminId) {
              io.to(admin.socketId).emit(
                "sendMessageFromAdminToAdmin",
                message
              );
            }
          });

          if (user && user.length > 0) {
            user?.forEach((u) => {
              io.to(u.socketId).emit("getMessageFromAdmin", message);
            });
          } else {
            console.log("User not found.");
          }
        });
        socket.on("sendMessageToAdmins", (message) => {
          const admins = socketCache.getUsers((user) => user.isAdmin === true);
          const currentUser = socketCache.getUserBySocketId(socket.id);
          if (!currentUser) return;

          console.log("current user", currentUser);
          const users = socketCache.getUsers((user) => (user?.userId === currentUser?.userId && socket?.id !== user?.socketId));
          console.log("filtered users", users);

          admins?.forEach((admin) => {
            io.to(admin.socketId).emit("getMessageFromUser", message);
          });
          users?.forEach((user) => {
            io.to(user.socketId).emit("userSentMessage", message);
          });
        });
        socket.on("adminOpenedChat", (conv) => {
          const admins = socketCache.getUsers((user) => user.isAdmin === true);

          admins?.forEach((admin) => {
            io.to(admin?.socketId).emit("makeChatSeen", conv);
          });
        });
        socket.on("disconnect", () => {
          socketCache.removeUser(socket.id);
          const users = socketCache.getUsers();

          io.emit("getUsers", users);
          console.log("A user disconnected.", socket.id);
        });
      });
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};

export { dbConnectionAndServer };
