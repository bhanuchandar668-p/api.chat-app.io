import factory from "../factory.js";
import { fileNameHelper } from "../helpers/app-helper.js";
import { S3DataServiceProvider } from "../services/aws/s3-data-service.js";
import { sendResponse } from "../utils/resp-utils.js";
import { validateReq } from "../validations/validate-req.js";
const s3DataService = new S3DataServiceProvider();
export class FileHandlers {
    uploadFileHandlers = factory.createHandlers(async (c) => {
        const req = await c.req.json();
        const validData = await validateReq("file:upload", req, "File upload validation failed");
        let fileKey = fileNameHelper(validData.file_name);
        fileKey = `profiles/${fileKey}`;
        const urlOptions = {
            isPublic: validData.is_public || false,
        };
        const presignedUrl = await s3DataService.getPresignedUrl(fileKey, urlOptions);
        const resp = {
            file_key: fileKey,
            target_url: presignedUrl,
        };
        return sendResponse(c, 200, "File upload url generated", resp);
    });
    downloadFileHandlers = factory.createHandlers(async (c) => {
        const req = await c.req.json();
        const validData = await validateReq("file:download", req, "File download validation failed");
        const fileKey = validData.file_key;
        const presignedUrl = await s3DataService.getPresignedUrl(fileKey, {
            method: "get",
        });
        const resp = {
            download_url: presignedUrl,
        };
        return sendResponse(c, 200, "File download url generated", resp);
    });
}
