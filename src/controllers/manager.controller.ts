// Uncomment these imports to begin using these cool features!

import {intercept} from '@loopback/core';
import {FilterExcludingWhere,repository} from '@loopback/repository';

import {get,param,response} from '@loopback/rest';
import {TeamQueryFull} from '../blueprints/team.blueprint';
import {Team} from '../models';
import {EventRepository,PlaceRepository,TeamRepository,TeamStaffRepository} from '../repositories';

// import {inject} from '@loopback/core';


export class ManagerController {
  constructor(
    @repository(TeamRepository)
    public teamRepository : TeamRepository,
    @repository(TeamStaffRepository)
    public teamStaffRepository : TeamStaffRepository,
    @repository(EventRepository)
    public eventRepository : EventRepository,
    @repository(PlaceRepository)
    public placeRepository : PlaceRepository,
  ) {

  }

  @get('/manager')
  // @authenticate('firebase')
  @intercept('services.ACL')
  async getAdminData(payload:any ={}) {
    console.log(payload)
    return {data: 'Admin data goes here',payload};
  }


  @get("/manager/teams/{id}/full")
  @response(200, {
    description: "Place model instance with all dependencies",
    content: {

    },
  })
  async findTeamByIdFull(
    @param.path.string("id") id: string,
    @param.filter(Team, { exclude: "where" })
    filter?: FilterExcludingWhere<Team>
  ): Promise<any> {

    const team = await this.teamRepository.findById(id, TeamQueryFull)
    // const crew = await this.teamStaffRepository.findAll({where:{teamId:id,deleted:false},include:[{relation:"staff", scope:{include: [{relation:"user"}]}}]})
    // const events = await this.eventRepository.events
    /*
    Preciso de : staff, org, eventos e sitos
    */

    return team
  }
}
