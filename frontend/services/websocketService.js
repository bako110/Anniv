// websocketService.js
import io from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../constants/config";

let socket = null;

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) {
    console.warn("Aucun token trouvé, socket non connecté");
    return;
  }

  // Si déjà connecté, on évite de reconnecter
  if (socket && socket.connected) {
    return;
  }

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connecté avec id:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket déconnecté");
  });

  socket.on("userStatus", (data) => {
    console.log("Status utilisateur:", data);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onUserStatusChange = (callback) => {
  if (!socket) return;
  socket.on("userStatus", callback);
};

export const offUserStatusChange = (callback) => {
  if (!socket) return;
  socket.off("userStatus", callback);
};

export { socket };
