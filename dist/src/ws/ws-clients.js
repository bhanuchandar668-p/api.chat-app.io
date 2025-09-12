export const clients = new Map();
export const addClient = (userId, ws) => {
    console.log("User Added to clients", userId);
    userId = userId.toString();
    clients.set(userId, ws);
};
export const removeClient = (userId) => {
    clients.delete(userId);
};
export const getClient = (userId) => clients.get(userId);
