import {repository} from "@loopback/repository";
import {
  del,
  param,
  post,
  Request,
  requestBody,
  response,
} from "@loopback/rest";
import {RequestHandler} from "express-serve-static-core";
import {Client} from "minio";
import multer from "multer";
import {v4 as uuidv4} from "uuid";
import {
  EventRepository,
  ImageRepository,
  IngredientRepository,
  PlaceRepository,
  ProductRepository,
} from "../repositories";
import minioClient,{minioClientSetup} from "../services/minio/client";

export class FileUploadController {
  private minioClient: Client;

  constructor(
    @repository(IngredientRepository)
    public ingredientRepository: IngredientRepository,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository
  ) {
    this.minioClient = minioClient;
  }

  COVER_MODELS: any = {
    place: { repository: this.placeRepository },
    event: { repository: this.eventRepository },
  };
  THUMMBNAIL_MODELS: any = {
    product: { repository: this.productRepository },
    ingredient: { repository: this.ingredientRepository },
  };

  @del("/gallery/{id}/{refId}")
  @response(204, {
    description: "Ticket DELETE success",
  })
  async deleteGalleryById(
    @param.path.string("id") id: string,
    @param.path.string("refId") refId: string
  ): Promise<void> {
    await this.imageRepository.deleteAll({
      and: [
        {
          id,
        },
        { refId },
        { type: "gallery" },
      ],
    });
  }

  @post("/upload/gallery", {
    responses: {
      "200": {
        description: "File uploaded successfully",
        content: { "application/json": { schema: { type: "object" } } },
      },
    },
  })
  async galleryUpload(
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
                type: "string",
              },
              model: {
                type: "string",
              },
            },
          },
        },
      },
    })
    request: Request
  ): Promise<object> {
    return this.fileUploadHelper(request, "gallery");
  }

  @post("/upload/thumbnail", {
    responses: {
      "200": {
        description: "File uploaded successfully",
        content: { "application/json": { schema: { type: "object" } } },
      },
    },
  })
  async thumbnailUpload(
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
                type: "string",
              },
              model: {
                type: "string",
              },
            },
          },
        },
      },
    })
    request: Request
  ): Promise<object> {
    return this.fileUploadHelper(request, "thumbnail");
  }
  /*
=======
  @post("/upload/thumbnail", {
    responses: {
      "200": {
        description: "File uploaded successfully",
        content: { "application/json": { schema: { type: "object" } } },
      },
    },
  })
  async thumbnailUpload(
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
                type: "string",
              },
              model: {
                type: "string",
              },
            },
          },
        },
      },
    })
    request: Request
  ): Promise<object> {

    return this.fileUploadHelper(
      request,
      "thumbnail"

    );
  }

>>>>>>> 3cac5f1bda9fd5f1ddf4ff8f843d3978cebc7b28
*/
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
                type: "string",
              },
              model: {
                type: "string",
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
    const imagePayload: any = {
      url: minioClientSetup.bucketUrl + fileName,
      type: "cover",
      refId: request.body.refId || "00000000-0000-0000-0000-000000000001",
    };
    const imageRecord = await this.imageRepository.create(imagePayload);
    const { body, data }: any = request;

    if (request?.body?.refId && request?.body?.model) {
      let model: any = this.COVER_MODELS[request?.body?.model];
      let repo: any = model?.repository;
      // console.log(model, request.body.model);
      if (repo && repo.findById && request.body.refId) {
        // @ts-ignore

        const record = await repo.findById(request.body.refId);
        if (record) {
          record.coverId = imageRecord.id;
          await repo.updateById(record.id, record);
        }
      }
    }

    return imageRecord;
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

  async fileUploadHelper(request: Request, type?: string): Promise<object> {
    console.log('up')
    const upload = multer().single("file");
    const handler = this.promisify(upload);
    await handler(request);

    const bucketName = "copo-cheio"; //minioClientSetup.bucketUrl// Replace with your bucket name
    const file = (request as any).file;
    let refId = request.body.refId || "00000000-0000-0000-0000-000000000002";
    let table = request.body.model;
    type = type || "cover";
    console.log({refId,table,type})

    if (!file) {
      throw new Error("File not found in request");
    }

    const fileName = uuidv4() + "-" + file.originalname;

    // Upload file to MinIO
    await this.minioClient.putObject(bucketName, fileName, file.buffer);

    // Update image payload
    const imagePayload: any = {
      url: minioClientSetup.bucketUrl + fileName,
      type,
      refId,
    };
    const imageRecord = await this.imageRepository.create(imagePayload);

    console.log({imageRecord})
    // const { body, data }: any = request;

    if (refId && table) {
      let model: any = this.COVER_MODELS[table];
      if (type == "thumbnail") {
        model = this.THUMMBNAIL_MODELS[table];
      }
      let repo: any = model?.repository;

      if (repo && repo.findById && refId) {
        // @ts-ignore
        try {
          const record = await repo.findById(refId);
          if (record) {
            let fileKey = "coverId";
            if (type == "thumbnail") {
              fileKey = "thumbnailId";
            }

            record[fileKey] = imageRecord.id;

            console.log({ rid: record.id, refId, type, model });
            await repo.updateById(record.id, record);
          }
        } catch (ex) {}
      }
    }

    return imageRecord;
  }
}
