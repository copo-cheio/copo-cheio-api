import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody} from '@loopback/rest';
import {
  EventRepository,
  StaffRepository,
  TeamStaffRepository,
  UserRepository,
} from '../repositories';
import {AuthService, SpotifyService} from '../services';
import {UserService} from '../services/user.service';

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(StaffRepository)
    public staffRepository: StaffRepository,
    @repository(TeamStaffRepository)
    public teamStaffRepository: TeamStaffRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @inject('services.AuthService')
    private authService: AuthService,
    @inject('services.UserService')
    private userService: UserService,
    @inject('services.SpotifyService')
    private spotifyService: SpotifyService,
  ) {}

  @get('/__/auth/handler', {
    responses: {
      '200': {
        description: 'Auth belonging to Balcony',
        content: {},
      },
    },
  })
  async test() {
    console.log(this);
  }
  @post('/auth/google')
  async googleAuth(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
            },
            required: ['token'],
          },
        },
      },
    })
    body: {
      token: string;
      app?: string;
      coordinates?: any;
    },
  ) {
    const responsePayload: any = {};
    try {
      // Verify the Firebase ID token
      const decodedToken = await this.authService.verifyIdToken(body.token);

      let user: any = await this.userRepository.findOne({
        where: {email: decodedToken.email, firebaseUserId: decodedToken.uid},
        include: [{relation: 'favorites'}],
      });
      if (!user) {
        user = await this.userRepository.create({
          email: decodedToken.email,
          firebaseUserId: decodedToken.uid,
          avatar: decodedToken.picture,
          name: decodedToken.name,
        });
      }

      const latitude = body?.coordinates?.latitude;
      const longitude = body?.coordinates?.longitude;

      if (latitude && longitude) {
        responsePayload.latitude = latitude;
        responsePayload.longitude = longitude;
        await this.userRepository.updateById(user.id, {latitude, longitude});
      } else {
        if (user?.latitude && user?.longitude) {
          responsePayload.latitude = user.latitude;
          responsePayload.longitude = user.longitude;
        }
      }
      if (body.app == 'admin') {
        const userWorksAt = await this.staffRepository.findAll({
          where: {and: [{userId: user.id}, {role: 'admin'}]},
        });
        if (userWorksAt?.[0]) {
          responsePayload.companyId = userWorksAt[0].companyId;
          responsePayload.staffId = userWorksAt[0].id;
          responsePayload.id = userWorksAt[0].userId;
        }
      } else if (body.app == 'staff') {
        // Get all places where staff works
        const userWorksAt = await this.staffRepository.findAll({
          where: {userId: user.id},
        });
        const staffIds: any = [...new Set(userWorksAt.map(u => u.id))];
        const userTeams = await this.teamStaffRepository.findAll({
          where: {staffId: {inq: staffIds}},
        });
        responsePayload.staffIds = staffIds;
        responsePayload.userTeams = [...new Set(userTeams.map(t => t.teamId))];
      } else {
        responsePayload.favorites = await this.userRepository.getFavorites(
          user.id,
        );
      }

      // Example: return user information
      return {
        message: 'User authenticated',
        userId: decodedToken.uid,
        email: decodedToken.email,
        ...responsePayload,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  @get('/auth/spotify')
  async spotifyAuth(@param.query.string('code') code: string) {
    return this.spotifyService.authenticate({code});
  }
  @post('/auth/refresh-spotify')
  async spotifyRefresh(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              refresh_token: {type: 'string'},
            },
          },
        },
      },
    })
    body: {
      refresh_token?: string;
    },
  ) {
    return this.spotifyService.authenticate(body);
  }
}
