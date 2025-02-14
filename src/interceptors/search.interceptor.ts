import {Ipware} from '@fullerstack/nax-ipware';
import {
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Next,
  Provider,
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {RestBindings} from '@loopback/rest';
import axios from 'axios';
import {Request} from 'express-serve-static-core';
import {FirebaseAuthHelper} from '../auth-strategies/firebase-strategy';
import {SearchRepository} from '../repositories';
import {AuthService} from '../services';
import {UserService} from '../services/user.service';
const ipware = new Ipware();
const apiKey =
  process.env.IPSTACK_API_KEY || 'a9baa913bf97762421b18fd2c5458f48';
/**
 * Intersects what user is searching, where, and stores it into the database
 */
export class SearchInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,

    @inject('services.UserService')
    protected userService: UserService,
    @inject('services.AuthService')
    protected authService: AuthService,
    @repository(SearchRepository)
    public searchRepository: SearchRepository,
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

    let user: any = {};
    const firebaseUserId: any =
      await FirebaseAuthHelper.getAuthenticatedUser(request);
    if (firebaseUserId) {
      user = await this.userService.getUserByFirebaseUserId(firebaseUserId);
    }

    let latitude: any;
    let longitude: any;
    let provider = 'browser';
    let ipAddress =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    const searchPayload: any = {
      url: request.url,
      provider,
      ipAddress,
      ip: ipware.getClientIP(request),
    };
    if (user?.id) {
      searchPayload.userId = user.id;
      latitude = user.latitude;
      longitude = user.longitude;
    }
    console.log('-------------------------------------------');
    console.log({1: searchPayload});
    console.log('-------------------------------------------');

    if (!latitude || !longitude) {
      // ipAddress = replaceAll(replaceAll(ipAddress, ":", ""), "f", "");
      // if (ipAddress == "1") {
      ipAddress = (await axios.get('https://api.ipify.org?format=json')).data
        .ip;
      // }
      if (ipAddress) {
        searchPayload.ipAddress = ipAddress;
        const geoLocation = await this.getGeoData(ipAddress);
        latitude = geoLocation.latitude;
        longitude = geoLocation.longitude;
        provider = geoLocation.connection_type;
        searchPayload.data = geoLocation;
      }
    }

    searchPayload.latitude = latitude;
    searchPayload.longitude = longitude;
    searchPayload.provider = provider;

    // let x = await axios.get('https://api.ipify.org?format=json')
    console.log('-------------------------------------------');
    console.log({searchPayload});
    console.log('-------------------------------------------');

    // const userAccess:any = await this.userService.getFullUserAccess(user.Id)

    // invocationCtx.args[0] = invocationCtx.args[0] || {} ;
    // invocationCtx.args[0].__userAccess= userAccess
    const result = await next(); // Proceed with the next step in the request lifecycle

    // // Post-processing logic
    // console.log('Method execution complete.');

    return result;
  }

  async getGeoData(ip: string) {
    const url = `https://api.ipstack.com/${ip}?access_key=${apiKey}`;

    const response = await axios.get(url);
    const data = response.data;

    // Example data structure from ipstack API
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      country: data.country_name,
      connection_type: data.connection_type,
    };
  }
}
