// Map of userId → Socket
export const clients = new Map();
export const addClient = (userId, socket) => {
    console.log("User Added to clients", userId);
    clients.set(userId.toString(), socket);
};
export const removeClient = (userId) => {
    console.log("User Removed from clients", userId);
    clients.delete(userId.toString());
};
export const getClient = (userId) => {
    return clients.get(userId.toString());
};
