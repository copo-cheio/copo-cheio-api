// Uncomment these imports to begin using these cool features!

import {intercept} from "@loopback/core";
import {FilterExcludingWhere,repository} from "@loopback/repository";

import {authenticate} from "@loopback/authentication";
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from "@loopback/rest";
import {StaffQueryFull} from "../blueprints/stafff.blueprint";
import {TeamQueryFull} from "../blueprints/team.blueprint";
import {DEFAULT_MODEL_ID} from "../constants";
import {addCompanyOwnership} from "../interceptors/add-company-ownership.interceptor";
import {Product,Staff,Team,TeamStaff} from "../models";
import {
  CompanyRepository,
  EventRepository,
  PlaceRepository,
  PriceRepository,
  ProductIngredientRepository,
  ProductOptionRepository,
  ProductRepository,
  StaffRepository,
  TeamRepository,
  TeamStaffRepository,
} from "../repositories";
import {transactionWrapper} from "../shared/database";
import {uniqueBy} from "../utils/query";

// import {inject} from '@loopback/core';

export class ManagerController {
  constructor(
    @repository(TeamRepository)
    public teamRepository: TeamRepository,
    @repository(CompanyRepository)
    public companyRepository: CompanyRepository,
    @repository(TeamStaffRepository)
    public teamStaffRepository: TeamStaffRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(StaffRepository)
    public staffRepository: StaffRepository,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(ProductOptionRepository)
    public productOptionRepository: ProductOptionRepository,
    @repository(ProductIngredientRepository)
    public productIngredientRepository: ProductIngredientRepository,
    @repository(PriceRepository)
    public priceRepository: PriceRepository
  ) {}

  @get("/manager")
  // @authenticate('firebase')
  @intercept("services.ACL")
  async getAdminData(payload: any = {}) {
    console.log(payload);
    return { data: "Admin data goes here", payload };
  }
  @get("/search")
  // @authenticate('firebase')
  @intercept("services.Search")
  async getSearchData(payload: any = {}) {
    return { data: "Admin data goes here", payload };
  }

  /* ********************************** */
  /*                STAFF               */
  /* ********************************** */

  @get("/manager/staff")
  @response(200, {
    description: "Staff model instance with all dependencies",
    content: {},
  })
  async findStaff(
    @param.filter(Team, { exclude: "where" })
    filter?: FilterExcludingWhere<Staff>
  ): Promise<any> {
    const records = await this.staffRepository.findAll(StaffQueryFull);

    return uniqueBy(records, "userId");
  }

  @post("/manager/team/staff")
  @response(200, {
    description: "TeamStaff model instance",
    content: { "application/json": { schema: getModelSchemaRef(TeamStaff) } },
  })
  async createTeamStaff(
    @requestBody({
      content: {},
    })
    teamStaff: Omit<TeamStaff, "id">
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const { teamId, staffId, roles } = teamStaff;
      const record = await this.teamStaffRepository.findOne({
        where: { teamId, staffId },
      });
      if (record && record?.id) {
        const result = await this.teamStaffRepository.updateById(
          record.id,
          { roles: roles || [] },
          { transaction }
        );
        return result;
      } else {
        const result = await this.teamStaffRepository.create(
          { teamId, staffId, roles: roles || [] },
          { transaction }
        );

        return result;
      }
    };
    const res = await transactionWrapper(this.teamStaffRepository, callbackFn);

    return res || {};
  }

  @patch("/manager/team/staff")
  @response(204, {
    description: "TeamStaff PATCH success",
  })
  async updateById(
    @requestBody({
      content: {},
    })
    teamStaff: TeamStaff
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const { teamId, staffId, roles } = teamStaff;
      const record = await this.teamStaffRepository.findOne({
        where: { and: [{ teamId }, { staffId }] },
      });
      if (record && record.id) {
        return await this.teamStaffRepository.updateById(record.id, {
          roles: roles || [],
        });
      } else {
        return await this.teamStaffRepository.create({
          teamId,
          staffId,
          roles: roles || [],
        });
      }
    };
    return transactionWrapper(this.teamStaffRepository, callbackFn);
  }

  @del("/manager/team/staff/{teamId}/{staffId}")
  @authenticate("firebase")
  @response(204, {
    description: "TeamStaff DELETE success",
  })
  async deleteById(
    @param.path.string("teamId") teamId: string,
    @param.path.string("staffId") staffId: string
  ): Promise<void> {
    return transactionWrapper(
      this.teamStaffRepository,
      async (transaction: any) =>
        this.teamStaffRepository.deleteAll(
          {
            teamId,
            staffId,
          },
          transaction
        )
    );
  }

  /* ********************************** */
  /*                TEAMS               */
  /* ********************************** */

  @get("/manager/teams")
  @response(200, {
    description: "Teams model instance with all dependencies",
    content: {},
  })
  async findTeamsFull(
    @param.filter(Team, { exclude: "where" })
    filter?: FilterExcludingWhere<Team>
  ): Promise<any> {
    const teams = await this.teamRepository.findAll(TeamQueryFull);
    return teams;
  }

  @get("/manager/teams/{id}/full")
  @response(200, {
    description: "Place model instance with all dependencies",
    content: {},
  })
  async findTeamByIdFull(
    @param.path.string("id") id: string,
    @param.filter(Team, { exclude: "where" })
    filter?: FilterExcludingWhere<Team>
  ): Promise<any> {
    const team = await this.teamRepository.findById(id, TeamQueryFull);
    return team;
  }

  @post("/manager/teams")
  @intercept(addCompanyOwnership) // Use the `log` function
  @response(200, {
    description: "Team model instance",
    content: {},
  })
  async createTeamS(
    @requestBody({
      content: {},
    })
    teamStaff: Omit<any, "id">
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const { name, companyId, description } = teamStaff;
      const { staff } = teamStaff;
      let coverId = teamStaff.coverId;
      if (!coverId) {
        const company = await this.companyRepository.findById(companyId);
        coverId = company.coverId || DEFAULT_MODEL_ID.coverId;
      }
      const team = await this.teamRepository.create({
        name,
        companyId,
        coverId,
        description,
      });
      for (let member of staff || []) {
        await this.teamStaffRepository.create({
          staffId: member.staffId,
          roles: member.roles,
          teamId: team.id,
        });
      }
      return team;
    };
    const res = await transactionWrapper(this.teamRepository, callbackFn);

    return res || {};
  }

  @patch("/manager/teams")
  @response(204, {
    description: "Team PATCH success",
  })
  async updateTeamById(
    @requestBody({
      content: {},
    })
    team: any
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const id = team.id;
      delete team.id;
      const record = await this.teamRepository.updateById(id, team);

      return {};
    };
    return transactionWrapper(this.teamRepository, callbackFn);
  }

  @post("/manager/products")
  @response(200, {
    description: "Product model instance",
    content: {},
  })
  async create(
    @requestBody({
      content: {},
    })
    payload: any
  ): Promise<Product> {
    return transactionWrapper(
      this.productRepository,
      async (transaction: any) => {
        const _product = {
          name: payload.name,
          description: payload.description,
          thumbnailId: payload.thumbnailId,
          tagIds: payload.tagIds || [],
        };
        const _options = payload.options || [];
        const _ingredients = payload.ingredients || [];

        const product: any = await this.productRepository.create(_product);

        for (let option of _options) {
          const _price = await this.priceRepository.create({
            price: option?.price?.price || 0,
            currencyId:
              option?.price?.currencyId ||
              "bc6635ea-7273-4518-b18a-c066fb300b1f",
          });

          const productOption: any = await this.productOptionRepository.create({
            productId: product.id,
            priceId: _price.id,
            ingredientId: option,
            includedByDefault: option.includedByDefault,
            group: option.group,
          });
          console.log(3, { productOption });
        }
        for (let ingredient of _ingredients) {
          const productIngredient = await this.productIngredientRepository.create(
            {
              productId: product.id,
              ingredientId: ingredient.ingredientId,
            }
          );
        }

        return this.productRepository.findById(product.id);
      }
    );
  }

  @patch("/manager/products/{id}")
  @response(200, {
    description: "Product model instance",
    content: {},
  })
  async updateProduct(
    @param.path.string("id") id: string,
    @requestBody({
      content: {},
    })
    payload: any
  ): Promise<Product> {
    return transactionWrapper(
      this.productRepository,
      async (transaction: any) => {
        const _product = {
          name: payload.name,
          description: payload.description,
          thumbnailId: payload.thumbnailId,
          tagIds: payload.tagIds || [],
        };
        const _options = payload.options || [];
        const _ingredients = payload.ingredients || [];

        // let product: any = await this.productRepository.findById(id);
        let product: any = await this.productRepository.updateById(
          id,
          _product
        );
        product = await this.productRepository.findById(id);

        let priceIds: any = [];
        let productOptionIds: any = [];
        let productIngredientIds: any = [];

        for (let option of _options) {
          let priceId = option?.price?.id;
          if (!priceId || priceId == "") {
            const _price = await this.priceRepository.create({
              price: option?.price?.price || 0,
              currencyId:
                option?.price?.currencyId ||
                "bc6635ea-7273-4518-b18a-c066fb300b1f",
            });

            priceId = _price.id;
          } else {
            await this.priceRepository.updateById(priceId, {
              price: option?.price?.price || 0,
              currencyId:
                option?.price?.currencyId ||
                "bc6635ea-7273-4518-b18a-c066fb300b1f",
            });
          }

          let productOptionId = option.id;
          let _productOption: any = {};
          let productOption: any = {};

          if (productOptionId && productOptionId !== "") {
            _productOption = await this.productOptionRepository.findById(
              productOptionId
            );

          }
          if (_productOption?.id) {
            productOptionId = _productOption.id;
            productOption = _productOption;
            await this.productOptionRepository.updateById(_productOption.id, {
              productId: product.id,
              priceId: priceId,
              ingredientId: option.ingredientId,
              includedByDefault: option.includedByDefault,
              group: option.group,
            });
          } else {
            productOption = await this.productOptionRepository.create({
              productId: product.id,
              priceId: priceId,
              ingredientId: option.ingredientId,
              includedByDefault: option.includedByDefault,
              group: option.group,
            });

            productOptionId = productOption.id;
          }

          priceIds.push(priceId);
          productOptionIds.push(productOptionId);
        }
        for (let ingredient of _ingredients) {
          let productIngredientId = ingredient.id;
          console.log(2,{ingredient,productIngredientId})
          let productIngredient: any = {};
          if (!productIngredientId || productIngredientId == "") {
            productIngredient = await this.productIngredientRepository.create({
              productId: product.id,
              ingredientId: ingredient.ingredientId,
            });
            productIngredientId = productIngredient.id;

          }
          productIngredientIds.push(productIngredientId);
        }
        console.log({productOptionIds,
          productIngredientIds})
        await this.productOptionRepository.deleteAll({
          // where: {
          and: [{ productId: product.id }, { id: { nin: productOptionIds } }],

          // productId: product.id,               // Filtering by projectId = "x"
          // id: {                         // Excluding ids in the array [1, 2, 3]
          //   nin: productOptionIds,
          // },
          // }
        });
        await this.productIngredientRepository.deleteAll({
          // where: {
          and: [
            { productId: product.id },
            { id: { nin: productIngredientIds } },
          ],

          // productId: product.id,               // Filtering by projectId = "x"
          // id: {                         // Excluding ids in the array [1, 2, 3]
          //   nin: productOptionIds,
          // },
          // }
        });

        //   id:{nin:productIds},

        // },transaction)
        // await this.productIngredientRepository
        // await this.priceRepository

        return this.productRepository.findById(product.id);
      }
    );
  }
}
