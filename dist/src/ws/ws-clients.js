export const clients = new Map();
export const addClient = (userId, ws) => {
    clients.set(userId, ws);
};
export const removeClient = (userId) => {
    clients.delete(userId);
};
export const getClient = (userId) => clients.get(userId);
