import * as Minio from 'minio';
import {DEFAULT_MINIO_BUCKET} from './constants';


var Multer = require("multer");

const storage = Multer.memoryStorage()


const minioClientConfig = {

    endPoint: 'minio-server-xqnl.onrender.com',
    // port: 9000,
    useSSL: true,
    // useSSL: false,
    accessKey: process.env.NX_MINIO_ACCESS_KEY || "",
    secretKey: process.env.NX_MINIO_SECRET_KEY || ""

}
export const minioClient = new Minio.Client(minioClientConfig);
export const multerUpload = Multer({ storage })
export const minioClientSetup: any = {
    ...minioClientConfig,
    get serverUrl() {
        let url = "http://"
        if (this.useSSL) {
            url = "https://"
        }
        return url + minioClientConfig.endPoint + "/"
    },
    get bucketUrl(): any {
        let bucketUrl = this.serverUrl + DEFAULT_MINIO_BUCKET + '/'
        return bucketUrl
    }
}

delete minioClientSetup.accessKey
delete minioClientSetup.secretKey

export default minioClient
