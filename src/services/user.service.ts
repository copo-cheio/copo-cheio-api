import { /* inject, */ BindingScope,injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {StaffRepository,TeamRepository,TeamStaffRepository,UserRepository} from '../repositories';

/*
 * Fix the service type. Possible options can be:
 * - import {User} from 'your-module';
 * - export type User = string;
 * - export interface User {}
 */
export type User = unknown;

@injectable({ scope: BindingScope.TRANSIENT })
export class UserService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(StaffRepository) public staffRepository: StaffRepository,
    @repository(TeamRepository) public teamRepository: TeamRepository,
    @repository(TeamStaffRepository) public teamStaffRepository: TeamStaffRepository,


  ) {}

  async getUserByFirebaseUserId(firebaseUserId:string){
    return await this.userRepository.findOne({where:{firebaseUserId:firebaseUserId}})
  }
  async getFullUserAccess(userId:string){


    // Where this mf works
    const staff = await this.staffRepository.findAll({where:{userId,deleted:false}})
    const staffIds = staff.map((record:any)=> record.id)
    const teamStaffs = await this.teamStaffRepository.findAll({where:{
      staffId:{inq:staffIds},
      deleted:false
    }})


    const teams:any = {}
    const roles:any = {
      bar:{
        teams:[],
        companys:[]
      },
      admin:{
        teams:[],
        companys:[]
      },
      door:{
        teams:[],
        companys:[]
      },
      manager:{
        teams:[],
        companys:[]
      }
    }
    for(let record of teamStaffs){
      const teamId = record.teamId
      if(teamId && !teams.hasOwnProperty(teamId)){
        const team = await this.teamRepository.findById(teamId)
        teams[teamId]= {
          staffId:record.staffId,
          teamId: teamId,
          userId: userId,
          roles: record.roles,
          companyId:team.companyId
        }
        for(let role of record?.roles || []){
          let teamRoleIndex = roles[role].teams.indexOf(teamId);
          let companyRoleIndex = roles[role].companys.indexOf(team.companyId);
          if(teamRoleIndex == -1) roles[role].teams.push(teamId)
          if(companyRoleIndex == -1) roles[role].companys.push(team.companyId)
        }
      }
    }




    return {teams,roles}
  }

  async getFavorites(userId:string){
    let favorites:any = await this.userRepository.favorites(userId)
    let result:any = {
      events:[],
      places:[]
    }
    for(let i =0; i < favorites.length; i++){
      let fav:any = favorites[i]
      let id:any = fav.eventId || fav.placeId
      if(fav.eventId && result.events.indexOf(id) ==-1) result.events.push(id)
      if(fav.placeId && result.places.indexOf(id) ==-1) result.places.push(id)
    }

    return result
  }
  /*
   * Add service methods here
   */

  // async queryLoop(callbackFn: any) {
  //   let eventIds: any = [];
  //   let keepRunning = true;
  //   let records: any = [];
  //   let i = 0;
  //   while (keepRunning) {
  //     if (i >= 100) break;
  //     i++;
  //     try {
  //       const record = await callbackFn(eventIds);
  //       if (record) {
  //         record.event.startDate = record.startDate;
  //         record.event.endDate = record.endDate;
  //         records.push(record);
  //         eventIds.push(record.eventId);
  //       } else {
  //         keepRunning = false;
  //       }
  //     } catch (ex) {
  //       keepRunning = false;
  //     }
  //   }
  //   return records;
  // }
}
