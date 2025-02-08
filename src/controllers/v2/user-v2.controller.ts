// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody, response} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

import {DevRepository} from '../../repositories';
import {AuthService} from '../../services';
import {UserService} from '../../services/user.service';

// import {inject} from '@loopback/core';

export class UserV2Controller {
  constructor(
    @repository('DevRepository') public devRepository: DevRepository | any,
    @inject('services.AuthService')
    protected authService: AuthService,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.UserService')
    protected userService: UserService,
  ) {}

  @post('/v2/user/update-push-token')
  @authenticate('firebase')
  @response(200, {
    description: 'Array of available models',
  })
  async updatePushNotificationToken(
    @requestBody({})
    body: any,
  ): Promise<any> {
    return this.userService.updatePushNotificationToken(body.token);
  }
}
