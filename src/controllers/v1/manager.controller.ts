// Uncomment these imports to begin using these cool features!

import {inject, intercept} from '@loopback/core';
import {FilterExcludingWhere, repository} from '@loopback/repository';

import {authenticate} from '@loopback/authentication';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {StaffQueryFull} from '../../blueprints/stafff.blueprint';
import {TeamQueryFull} from '../../blueprints/team.blueprint';
import {DEFAULT_MODEL_ID} from '../../constants';
import {addCompanyOwnership} from '../../interceptors/add-company-ownership.interceptor';
import {Product, Staff, Team, TeamStaff} from '../../models/v1';
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
} from '../../repositories/v1';
import {ProductService} from '../../services';
import {transactionWrapper} from '../../shared/database';
import {uniqueBy} from '../../utils/query';

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
    public priceRepository: PriceRepository,
    @inject('services.ProductService')
    protected productService: ProductService,
  ) {}

  @get('/manager')
  // @authenticate('firebase')
  @intercept('services.ACL')
  async getAdminData(payload: any = {}) {
    console.log(payload);
    return {data: 'Admin data goes here', payload};
  }
  @get('/search')
  // @authenticate('firebase')
  @intercept('services.Search')
  async getSearchData(payload: any = {}) {
    return {data: 'Admin data goes here', payload};
  }

  /* ********************************** */
  /*                STAFF               */
  /* ********************************** */

  @get('/manager/staff')
  @response(200, {
    description: 'Staff model instance with all dependencies',
    content: {},
  })
  async findStaff(
    @param.filter(Team, {exclude: 'where'})
    filter?: FilterExcludingWhere<Staff>,
  ): Promise<any> {
    const records = await this.staffRepository.findAll(StaffQueryFull);

    return uniqueBy(records, 'userId');
  }

  @post('/manager/team/staff')
  @response(200, {
    description: 'TeamStaff model instance',
    content: {'application/json': {schema: getModelSchemaRef(TeamStaff)}},
  })
  async createTeamStaff(
    @requestBody({
      content: {},
    })
    teamStaff: Omit<TeamStaff, 'id'>,
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const {teamId, staffId, roles} = teamStaff;
      const record = await this.teamStaffRepository.findOne({
        where: {teamId, staffId},
      });
      if (record && record?.id) {
        const result = await this.teamStaffRepository.updateById(
          record.id,
          {roles: roles || []},
          {transaction},
        );
        return result;
      } else {
        const result = await this.teamStaffRepository.create(
          {teamId, staffId, roles: roles || []},
          {transaction},
        );

        return result;
      }
    };
    const res = await transactionWrapper(this.teamStaffRepository, callbackFn);

    return res || {};
  }

  @patch('/manager/team/staff')
  @response(204, {
    description: 'TeamStaff PATCH success',
  })
  async updateById(
    @requestBody({
      content: {},
    })
    teamStaff: TeamStaff,
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const {teamId, staffId, roles} = teamStaff;
      const record = await this.teamStaffRepository.findOne({
        where: {and: [{teamId}, {staffId}]},
      });
      if (record && record.id) {
        return this.teamStaffRepository.updateById(record.id, {
          roles: roles || [],
        });
      } else {
        return this.teamStaffRepository.create({
          teamId,
          staffId,
          roles: roles || [],
        });
      }
    };
    return transactionWrapper(this.teamStaffRepository, callbackFn);
  }

  @del('/manager/team/staff/{teamId}/{staffId}')
  @authenticate('firebase')
  @response(204, {
    description: 'TeamStaff DELETE success',
  })
  async deleteById(
    @param.path.string('teamId') teamId: string,
    @param.path.string('staffId') staffId: string,
  ): Promise<void> {
    return transactionWrapper(
      this.teamStaffRepository,
      async (transaction: any) =>
        this.teamStaffRepository.deleteAll(
          {
            teamId,
            staffId,
          },
          transaction,
        ),
    );
  }

  /* ********************************** */
  /*                TEAMS               */
  /* ********************************** */

  @get('/manager/teams')
  @response(200, {
    description: 'Teams model instance with all dependencies',
    content: {},
  })
  async findTeamsFull(
    @param.filter(Team, {exclude: 'where'})
    filter?: FilterExcludingWhere<Team>,
  ): Promise<any> {
    const teams = await this.teamRepository.findAll(TeamQueryFull);
    return teams;
  }

  @get('/manager/teams/{id}/full')
  @response(200, {
    description: 'Place model instance with all dependencies',
    content: {},
  })
  async findTeamByIdFull(
    @param.path.string('id') id: string,
    @param.filter(Team, {exclude: 'where'})
    filter?: FilterExcludingWhere<Team>,
  ): Promise<any> {
    const team = await this.teamRepository.findById(id, TeamQueryFull);
    return team;
  }

  @post('/manager/teams')
  @intercept(addCompanyOwnership) // Use the `log` function
  @response(200, {
    description: 'Team model instance',
    content: {},
  })
  async createTeamS(
    @requestBody({
      content: {},
    })
    teamStaff: Omit<any, 'id'>,
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const {name, companyId, description} = teamStaff;
      const {staff} = teamStaff;
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
      for (const member of staff || []) {
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

  @patch('/manager/teams')
  @response(204, {
    description: 'Team PATCH success',
  })
  async updateTeamById(
    @requestBody({
      content: {},
    })
    team: any,
  ): Promise<any> {
    const callbackFn = async (transaction: any) => {
      const id = team.id;
      delete team.id;
      const record = await this.teamRepository.updateById(id, team);

      return {};
    };
    return transactionWrapper(this.teamRepository, callbackFn);
  }

  @post('/manager/products')
  @response(200, {
    description: 'Product model instance',
    content: {},
  })
  async create(
    @requestBody({
      content: {},
    })
    payload: any,
  ): Promise<Product> {
    return this.productService.create(payload);
  }

  @patch('/manager/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {},
  })
  async updateProduct(
    @param.path.string('id') id: string,
    @requestBody({
      content: {},
    })
    payload: any,
  ): Promise<Product> {
    return this.productService.updateProduct(id, payload);
  }

  // /manager/product-option/'+newOption.id+'/include-by-default/
  @get('/manager/product-option/{id}/include-by-default/{value}')
  @response(200, {
    description: 'Place model instance with all dependencies',
    content: {},
  })
  async updateDefaultInclusion(
    @param.path.string('id') id: string,
    @param.path.string('value') value: string,
  ): Promise<any> {
    await this.productOptionRepository.updateById(id, {
      includedByDefault: value == 'true',
    });
    return this.productOptionRepository.findById(id);
  }
}
