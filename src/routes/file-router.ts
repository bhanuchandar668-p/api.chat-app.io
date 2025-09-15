import factory from "../factory.js";
import { FileHandlers } from "../handlers/file-handlers.js";

const fileRouter = factory.createApp();

const fileHandlers = new FileHandlers();

fileRouter.post("/upload-url", ...fileHandlers.uploadFileHandlers);

fileRouter.post("/download-url", ...fileHandlers.downloadFileHandlers);

export default fileRouter;
