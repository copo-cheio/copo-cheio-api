import {AuthenticationBindings} from '@loopback/authentication';
import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {
  CheckInV2Repository,
  DevRepository,
  StaffRepository,
  TeamRepository,
  TeamStaffRepository,
  UserRepository,
} from '../repositories';
import {AuthService} from './auth.service';

/*
 * Fix the service type. Possible options can be:
 * - import {User} from 'your-module';
 * - export type User = string;
 * - export interface User {}
 */
export type User = unknown;

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @repository(StaffRepository) public staffRepository: StaffRepository,
    @repository(TeamRepository) public teamRepository: TeamRepository,
    @repository('DevRepository') public devRepository: DevRepository,
    @repository('CheckInV2Repository')
    public checkInV2Repository: CheckInV2Repository,
    @repository(TeamStaffRepository)
    public teamStaffRepository: TeamStaffRepository,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                     V2                                     */
  /* -------------------------------------------------------------------------- */
  async findCheckInOngoingOrder() {
    return this.checkInV2Repository.findUserCheckWithInOrder(
      this.currentUser.id,
    );
  }

  async findCheckInOrders() {
    /* const checkIn = await */
  }

  /* -------------------------------------------------------------------------- */
  /*                                     V1                                     */
  /* -------------------------------------------------------------------------- */

  async getUserByFirebaseUserId(firebaseUserId: string) {
    return this.userRepository.findOne({
      where: {firebaseUserId: firebaseUserId},
    });
  }
  async getFullUserAccess(userId: string) {
    // Where this mf works
    const staff = await this.staffRepository.findAll({
      where: {userId, deleted: false},
    });
    const staffIds = staff.map((record: any) => record.id);
    const teamStaffs = await this.teamStaffRepository.findAll({
      where: {
        staffId: {inq: staffIds},
        deleted: false,
      },
    });

    const teams: any = {};
    const roles: any = {
      bar: {
        teams: [],
        companys: [],
      },
      admin: {
        teams: [],
        companys: [],
      },
      door: {
        teams: [],
        companys: [],
      },
      manager: {
        teams: [],
        companys: [],
      },
    };
    for (const record of teamStaffs) {
      const teamId = record.teamId;
      if (teamId && !teams.hasOwnProperty(teamId)) {
        const team = await this.teamRepository.findById(teamId);
        teams[teamId] = {
          staffId: record.staffId,
          teamId: teamId,
          userId: userId,
          roles: record.roles,
          companyId: team.companyId,
        };
        for (const role of record?.roles || []) {
          const teamRoleIndex = roles[role].teams.indexOf(teamId);
          const companyRoleIndex = roles[role].companys.indexOf(team.companyId);
          if (teamRoleIndex == -1) roles[role].teams.push(teamId);
          if (companyRoleIndex == -1) roles[role].companys.push(team.companyId);
        }
      }
    }

    return {teams, roles};
  }

  async getFavorites(userId: string) {
    const favorites: any = await this.userRepository.favorites(userId);
    const result: any = {
      events: [],
      places: [],
    };
    for (let i = 0; i < favorites.length; i++) {
      const fav: any = favorites[i];
      const id: any = fav.eventId || fav.placeId;
      if (fav.eventId && result.events.indexOf(id) == -1)
        result.events.push(id);
      if (fav.placeId && result.places.indexOf(id) == -1)
        result.places.push(id);
    }

    return result;
  }

  async updatePushNotificationToken(token: string) {
    const user = this.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    /*     const signIn = await this.devRepository.findByAction(
      'user',
      'sign-in',
      user.uid,
    ); */

    await this.userRepository.updateById(this.currentUser.id, {
      pushNotificationToken: token,
    });
    /*     await this.devRepository.updateById(signIn.id, {
      data: {...signIn.data, pushNotificationToken: token},
    }); */
    return {success: true, cu: this.currentUser.id, token};
  }
  async getActiveCheckIn() {
    const user = await this.getUserDetails();
    if (!user?.checkIn?.active) {
      throw new Error('User not checked in');
    }

    return {
      userId: user.user.uid,
      user: user.user,
      balconyId: user.checkIn.balconyId,
      placeId: user.checkIn.placeId,
      role: user.checkIn.role,
    };
  }
  async getUserDetails() {
    // Fetches the logged-in user
    const user = this.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const checkIn = await this.devRepository.findByAction(
      'user',
      'check-in',
      user.uid,
    );

    return {user, checkIn: checkIn.data}; // This contains details like id, name, roles, etc.
  }
}
