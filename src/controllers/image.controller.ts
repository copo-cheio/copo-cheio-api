import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from "@loopback/repository";
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from "@loopback/rest";
import {Image} from "../models";
import {ImageRepository} from "../repositories";
import {QrFactoryService} from '../services';
import {storageService} from '../services/minio/service';

export class ImageController {
  constructor(
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
    @inject("services.QrFactoryService")
    protected qrFactoryService: QrFactoryService,
  ) {}

  @post("/images")
  @response(200, {
    description: "Image model instance",
    content: { "application/json": { schema: getModelSchemaRef(Image) } },
  })
  async create(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Image, {
            title: "NewImage",
            exclude: ["id", "updated_at", "created_at"],
          }),
        },
      },
    })
    image: Omit<Image, "id">
  ): Promise<Image> {
    return this.imageRepository.create(image);
  }

  @get("/images/count")
  @response(200, {
    description: "Image model count",
    content: { "application/json": { schema: CountSchema } },
  })
  async count(@param.where(Image) where?: Where<Image>): Promise<Count> {
    return this.imageRepository.count(where);
  }

  @get("/images")
  @response(200, {
    description: "Array of Image model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(Image, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Image) filter?: Filter<Image>): Promise<Image[]> {
    return this.imageRepository.find(filter);
  }

  @patch("/images")
  @response(200, {
    description: "Image PATCH success count",
    content: { "application/json": { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Image, { partial: true }),
          exclude: ["id", "updated_at", "created_at"],
        },
      },
    })
    image: Image,
    @param.where(Image) where?: Where<Image>
  ): Promise<Count> {
    return this.imageRepository.updateAll(image, where);
  }

  @get("/images/{id}")
  @response(200, {
    description: "Image model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Image, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string("id") id: string,
    @param.filter(Image, { exclude: "where" })
    filter?: FilterExcludingWhere<Image>
  ): Promise<Image> {
    return this.imageRepository.findById(id, filter);
  }

  @patch("/images/{id}")
  @response(204, {
    description: "Image PATCH success",
  })
  async updateById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Image, { partial: true }),
          exclude: ["id", "updated_at", "created_at"],
        },
      },
    })
    image: Image
  ): Promise<void> {
    await this.imageRepository.updateById(id, image);
  }

  @put("/images/{id}")
  @response(204, {
    description: "Image PUT success",
  })
  async replaceById(
    @param.path.string("id") id: string,
    @requestBody() image: Image
  ): Promise<void> {
    await this.imageRepository.replaceById(id, image);
  }

  @del("/images/{id}")
  @response(204, {
    description: "Image DELETE success",
  })
  async deleteById(@param.path.string("id") id: string): Promise<void> {
    await this.imageRepository.deleteById(id);
  }


  @post("/create/qr")
  // @authenticate("firebase")
  @response(200, {
    description: "Order model instance",
    content: { }
  })
  async createQr(
    @requestBody({
      content: {},
    })
    qr: any
  ): Promise<any> {

    const id = qr.refId;
    const type = qr.type;
    const action = qr.action; // CHECK_IN for instance
    let image = await this.imageRepository.findOne({
      where: {
        refId: id,
        type: "qr",
        description:action
      },
    });
    if (!image) {
      const qrRecord = await this.qrFactoryService.generateAndUploadQrCode(
        {
          action: action,
          type: type,
          refId: id,
        },
        id,
        type
      );
      image = await this.imageRepository.findOne({
        where: {
          refId: id,
          type: "qr",
          description: action
        },
      });
    }
    if (image) {
      await this.imageRepository.updateById(image?.id, {
        orderId: id,
      });
    }

  }

  @post("/upload/image")
  // @authenticate("firebase")
  @response(200, {
    description: "Order model instance",
    content: { }
  })
  async uploadImage(
    @requestBody({
      content: {},
    })
    file: any
  ): Promise<any> {

    return storageService().image(file)

  }
}
