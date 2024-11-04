import {AuthenticationBindings} from '@loopback/authentication';
import {
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Next,
} from '@loopback/context';
import {
  Provider
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors,RestBindings} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Request} from 'express-serve-static-core';
import {CompanyRepository} from '../repositories';


export class CompanyOwnershipValidation implements Provider<Interceptor> {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    public currentUser: UserProfile, // Inject the current user profile
    @repository(CompanyRepository)
    public companyRepository: CompanyRepository,
  ) {}

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: Next,
  ): Promise<InvocationResult> {
    // Pre-processing logic
    console.log('Intercepting method:', invocationCtx.methodName);

    const request:any = invocationCtx.getSync('rest.http.request')
    const user:any = invocationCtx.getSync('security.user')

    const method = request?.method;

    if(method !== "GET"){
      // let isAdmin = await this.companyRepository.teams.findAll({where:{userId:user.user.id}})
      let isAdmin = true;
      if(!isAdmin){
        const error = new HttpErrors['422']("Unauthorized");
        error.name = "Unauthorized"
        return error;
      }
      if(method == "POST"){
        // Vai buscar a company id do user connectado
        request.body.companyId= "f0eeff9a-4a59-48b7-a1e4-17ddd608b145"
      }else if(method == "PATCH"){

      }else if(method== "DELETE"){

      }
    }
      // Example: Using the repository to fetch data
    // const data = await this.companyRepository.find();
    // console.log('Data from repository:', data);

    const result = await next(); // Proceed with the next step in the request lifecycle

    // Post-processing logic
    console.log('Method execution complete.');

    return result;
  }
}
