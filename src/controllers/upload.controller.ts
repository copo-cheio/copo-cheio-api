import {repository} from "@loopback/repository";
import {post,Request,requestBody} from "@loopback/rest";
import {RequestHandler} from "express-serve-static-core";
import {Client} from "minio";
import multer from "multer";
import {v4 as uuidv4} from "uuid";
import {EventRepository,ImageRepository,PlaceRepository} from "../repositories";
import minioClient,{minioClientSetup} from "../services/minio/client";

export class FileUploadController {
  private minioClient: Client;

  constructor(
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository
  ) {
    this.minioClient = minioClient;
  }

  COVER_MODELS:any = {
    place:{repository:this.placeRepository},
    event:{repository:this.eventRepository }
  }
  @post("/upload/cover", {
    responses: {
      "200": {
        description: "File uploaded successfully",
        content: { "application/json": { schema: { type: "object" } } },
      },
    },
  })
  async fileUpload(
    @requestBody({
      description: "multipart/form-data file to upload",
      required: true,
      content: {
        "multipart/form-data": {
          "x-parser": "stream",
          schema: {
            type: "object",
            properties: {
              file: {
                type: "string",
                format: "binary",
              },
              refId: {
                type: "string"
              },
              model: {
                type: "string"
              },
            },
          },
        },
      },
    })
    request: Request
  ): Promise<object> {
    const upload = multer().single("file");
    const handler = this.promisify(upload);
    await handler(request);

    const bucketName = "copo-cheio"; //minioClientSetup.bucketUrl// Replace with your bucket name
    const file = (request as any).file;

    if (!file) {
      throw new Error("File not found in request");
    }

    const fileName = uuidv4() + "-" + file.originalname;

    // Upload file to MinIO
    await this.minioClient.putObject(bucketName, fileName, file.buffer);

    // Update image payload
    const imagePayload:any = {
      url: minioClientSetup.bucketUrl+fileName,
      type:"cover",
      refId:request.body.refId || "0000000-0000-0000-0000-00000000000",

    }
    const imageRecord = await this.imageRepository.create(imagePayload);
    const {body,data}:any = request

    if(request?.body?.refId && request?.body?.model){
      let model:any = this.COVER_MODELS[request?.body?.model]
      let repo:any = model?.repository
      console.log(model,request.body.model)
      if(repo && repo.findById && request.body.refId){
        // @ts-ignore

        const record = await repo.findById(request.body.refId)
        if(record){

          record.coverId = imageRecord.id
          await repo.updateById(record.id,record)
        }
      }
    }

    return imageRecord
  }

  // Utility to promisify the middleware function
  promisify(middleware: RequestHandler) {
    return (req: any) =>
      new Promise<void>((resolve, reject) => {
        middleware(req, {} as any, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
  }
}

