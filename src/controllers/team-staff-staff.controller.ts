import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  TeamStaff,
  Staff,
} from '../models';
import {TeamStaffRepository} from '../repositories';

export class TeamStaffStaffController {
  constructor(
    @repository(TeamStaffRepository)
    public teamStaffRepository: TeamStaffRepository,
  ) { }

  @get('/team-staffs/{id}/staff', {
    responses: {
      '200': {
        description: 'Staff belonging to TeamStaff',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Staff),
          },
        },
      },
    },
  })
  async getStaff(
    @param.path.string('id') id: typeof TeamStaff.prototype.id,
  ): Promise<Staff> {
    return this.teamStaffRepository.staff(id);
  }
}
