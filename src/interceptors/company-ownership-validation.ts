import {AuthenticationBindings} from '@loopback/authentication';
import {
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Next,
} from '@loopback/context';
import {Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, RestBindings} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Request} from 'express-serve-static-core';
import {CompanyRepository} from '../repositories';
import {AuthService} from '../services';

export class CompanyOwnershipValidation implements Provider<Interceptor> {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    public currentUser: UserProfile, // Inject the current user profile
    @repository(CompanyRepository)
    public companyRepository: CompanyRepository,
    @inject('services.AuthService')
    protected authService: AuthService,
  ) {}

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: Next,
  ): Promise<InvocationResult> {
    // Pre-processing logic

    const request: any = invocationCtx.getSync('rest.http.request');
    const user: any = invocationCtx.getSync('security.user');

    try {
      const companyId = await this.authService.getSignedInManagerCompany(
        user.id,
      );

      user.companyId = companyId;

      if (typeof invocationCtx.args[0] == 'object') {
        invocationCtx.args[0].companyId = companyId;
      } else {
        invocationCtx.args.push({companyId: companyId});
      }
    } catch (ex) {
      const error = new HttpErrors['422']('Unauthorized');
      error.name = 'Unauthorized';
      return error;
    }

    const result = await next(); // Proceed with the next step in the request lifecycle

    return result;
  }
}
