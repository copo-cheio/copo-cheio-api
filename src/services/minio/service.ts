import {v4 as uuid} from 'uuid';
import {DEFAULT_MINIO_BUCKET} from "./constants";
// import Image from "../../config/models/Image";
import minioClient,{minioClientSetup,multerUpload} from "./client";

const Multer = require('multer')


export const storageService = () => {

    const image = async (req: any, ref_id: string, type: string) => {
        const img: any = await storageService().minioFileUpload(req);
        console.log(img)
        // await Image.destroy({
        //     where: {
        //         ref_id, type
        //     }
        // })
        // const result = await Image.create({
        //     ref_id,
        //     type,
        //     url: img.url
        // })
        // return result.toJSON()
    }
    const thumbnail = (req: any, ref_id: string) => image(req, ref_id, 'thumbnail')
    const cover = (req: any, ref_id: string) => image(req, ref_id, 'cover')

    const parseFileName = (name: string) => {
        name = uuid() + name
        name = name.replace(/\s+/g, '-')
        //const uploadedFileUrl = minioClientSetup.bucketUrl + name
        return name
    }
    const fileUpload = async (req: any, res: any) => {
        return new Promise((resolve: any, reject: any) => {
            multerUpload.single('file')(req, res, function (err: any) {
                if (err instanceof Multer.MulterError) {
                    // A Multer error occurred when uploading.
                    return reject(err);
                } else if (err) {
                    return reject(err)
                    // An unknown error occurred when uploading.
                }
                const bucket = DEFAULT_MINIO_BUCKET;
                const name = parseFileName(req.file.originalname)
                const uploadedFileUrl = minioClientSetup.bucketUrl + name

                // @ts-ignore
                minioClient.putObject(bucket, name, req.file.buffer, function (error: any, etag: any) {
                    if (error) {
                        console.error(error);
                        reject(error)
                    }

                    resolve({ url: uploadedFileUrl, etag });

                })
                // Everything went fine.

            })

        })


    }
    const minioFileUpload = async (req: any) => {
        const bucket = DEFAULT_MINIO_BUCKET;
        const name = parseFileName(req.file.originalname)
        const uploadedFileUrl = minioClientSetup.bucketUrl + name

        return new Promise((resolve: any, reject: any) => {

            // @ts-ignore
            minioClient.putObject(bucket, name, req.file.buffer, function (error: any, etag: any) {
                if (error) {
                    console.error(error);
                    reject(error)
                }

                resolve({ url: uploadedFileUrl, etag });

            })
        })
    }
    const upload = async (req: any, res: any) => {
        await init()
        return await fileUpload(req, res)

    }

    const createBucket = async () => {
        return await minioClient.makeBucket(DEFAULT_MINIO_BUCKET, 'us-east-1')
    }

    const init = async () => {
        const exists = await minioClient.bucketExists(DEFAULT_MINIO_BUCKET)
        if (!exists) {

            await createBucket()
        }
    }
    const listBuckets = async () => {

        const buckets = await minioClient.listBuckets()
        // console.log('Success', buckets)
        return buckets

    }


    return {
        upload, listBuckets, fileUpload, minioFileUpload, image, thumbnail
        , cover
    }
}
