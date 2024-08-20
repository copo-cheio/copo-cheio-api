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
import {Place} from "../models";
import {PlaceRepository} from "../repositories";

/*
{
  "offset": 0,
  "limit": 100,
  "skip": 0,
  "order": "string",
  "where": {
    "additionalProp1": {}
  },
  "fields": {
    "id": true,
    "created_at": true,
    "updated_at": true,
    "name": true,
    "coverId": true
  },
  "include": [
  "balconies","cover"
  ]
}
*/

export class PlaceController {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository
  ) {}

  @post("/places")
  @response(200, {
    description: "Place model instance",
    content: { "application/json": { schema: getModelSchemaRef(Place) } },
  })
  async create(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Place, {
            title: "NewPlace",
            exclude: ["id", "updated_at", "created_at"],
          }),
        },
      },
    })
    place: Place
  ): Promise<Place> {
    return this.placeRepository.create(place);
  }

  @get("/places/count")
  @response(200, {
    description: "Place model count",
    content: { "application/json": { schema: CountSchema } },
  })
  async count(@param.where(Place) where?: Where<Place>): Promise<Count> {
    return this.placeRepository.count(where);
  }

  @get("/places")
  @response(200, {
    description: "Array of Place model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(Place, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Place) filter?: Filter<Place>): Promise<Place[]> {
    return this.placeRepository.find(filter);
  }

  @patch("/places")
  @response(200, {
    description: "Place PATCH success count",
    content: { "application/json": { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Place, { partial: true }),
        },
      },
    })
    place: Place,
    @param.where(Place) where?: Where<Place>
  ): Promise<Count> {
    return this.placeRepository.updateAll(place, where);
  }

  @get("/places/{id}")
  @response(200, {
    description: "Place model instance",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Place, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string("id") id: string,
    @param.filter(Place, { exclude: "where" })
    filter?: FilterExcludingWhere<Place>
  ): Promise<Place> {
    return this.placeRepository.findById(id, filter);
  }

  @get("/places/{id}/full")
  @response(200, {
    description: "Place model instance with all dependencies",
    content: {
      "application/json": {
        schema: getModelSchemaRef(Place, { includeRelations: true }),
      },
    },
  })
  async findByIdFull(
    @param.path.string("id") id: string,
    @param.filter(Place, { exclude: "where" })
    filter?: FilterExcludingWhere<Place>
  ): Promise<Place> {
    return this.placeRepository.findById(id, {
      "include": [
        {
          relation: 'balconies',
          scope:{
            include:["cover"]
          }

        },
        {
          relation: 'cover',
        },
      ]


  });
  }

  @patch("/places/{id}")
  @response(204, {
    description: "Place PATCH success",
  })
  async updateById(
    @param.path.string("id") id: string,
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Place, { partial: true }),
        },
      },
    })
    place: Place
  ): Promise<void> {
    await this.placeRepository.updateById(id, place);
  }

  @put("/places/{id}")
  @response(204, {
    description: "Place PUT success",
  })
  async replaceById(
    @param.path.string("id") id: string,
    @requestBody() place: Place
  ): Promise<void> {
    await this.placeRepository.replaceById(id, place);
  }

  @del("/places/{id}")
  @response(204, {
    description: "Place DELETE success",
  })
  async deleteById(@param.path.string("id") id: string): Promise<void> {
    await this.placeRepository.deleteById(id);
  }
}
