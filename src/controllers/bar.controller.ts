// Uncomment these imports to begin using these cool features!

import {get,response} from "@loopback/rest";

import {intercept} from "@loopback/core";
import {repository} from "@loopback/repository";
import {PlaceQueryFull} from "../blueprints/place.blueprint";
import {
  CompanyRepository,
  EventRepository,
  PlaceRepository,
  StaffRepository,
  TeamRepository,
  TeamStaffRepository,
} from "../repositories";

// import {inject} from '@loopback/core';

export class BarController {
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
    public staffRepository: StaffRepository
  ) {}

  @get("/bar/check-in-options")
  @intercept("services.ACL")
  @response(200, {
    description: "TeamStaff DELETE success",
  })
  async getCheckInOptions(payload: any = {}): Promise<any> {
    const userAccess = payload?.__userAccess;
    const barTeams: any = userAccess?.roles?.bar?.teams || [];

    const events = await this.eventRepository.findAll({
      where: { teamId: { inq: barTeams } },
    });
    const places = await this.placeRepository.findAll({
      ...PlaceQueryFull,
      where: { id: { inq: [...new Set(events.map((e) => e.placeId))] } },
    });

    return {
      teams: userAccess.teams,
      places: places.map((place: any) => {
        return {
          ...place,
          teams: place?.events?.map((event: any) => {
            return { id: event.teamId, ...userAccess.teams[event.teamId] };
          }),
        };
      }),
    };
  }
}
