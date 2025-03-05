import {inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';

import * as admin from 'firebase-admin';
import {EventFullQuery} from '../blueprints/event.blueprint';
import {
  ActivityV2Repository,
  CheckInV2Repository,
  EventInstanceRepository,
  PlaceRepository,
  StaffRepository,
} from '../repositories';
import {EventRepository} from '../repositories/v1/event.repository';
import {QrFactoryService} from './qr-factory.service';
import {TransactionService} from './transaction.service';

@injectable()
export class AuthService {
  constructor(
    @repository('CheckInV2Repository')
    public checkInV2Repository: CheckInV2Repository,
    @repository('ActivityV2Repository')
    public activityV2Repository: ActivityV2Repository,
    @repository('StaffRepository')
    public staffRepository: StaffRepository,
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,
    @repository('EventRepository')
    public eventRepository: EventRepository,
    @repository('EventInstanceRepository')
    public eventInstanceRepository: EventInstanceRepository,
    @inject('services.QrFactoryService')
    protected qrFactoryService: QrFactoryService,
    @inject('services.TransactionService')
    private transactionService: TransactionService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                     V2                                     */
  /* -------------------------------------------------------------------------- */
  async signInActivityV2(userId, app) {
    let activity: any = {};
    if (app == 'admin') {
      const action = 'sign-in--company';
      activity = await this.activityV2Repository.findOne({
        where: {
          and: [{userId}, {action}, {deleted: false}, {app}],
        },
      });
      if (!activity) {
        const permissions = await this.staffRepository.findOne({
          where: {
            and: [
              {userId},
              {role: {inq: ['admin', 'owner']}},
              {
                deleted: false,
              },
            ],
          },
        });
        if (permissions) {
          activity = await this.activityV2Repository.create({
            userId,
            app,
            referenceId: permissions.companyId,
            action,
          });
        }
      }
    } else if (app == 'staff') {
      await this.qrFactoryService.generateInviteCode(userId);
    }

    return activity;
  }
  async signOutActivityV2(userId, app) {
    let activity: any = {};
    if (app == 'admin') {
      const action = 'sign-in--company';
      activity = await this.activityV2Repository.findOne({
        where: {
          and: [{userId}, {action}, {deleted: false}],
        },
      });
      if (activity) {
        await this.activityV2Repository.deleteById(activity.id);
        await this.activityV2Repository.create({
          userId,
          app,
          referenceId: activity.referenceId,
          action: 'sign-out--company',
        });
      }
    }

    return activity;
  }
  async checkInOutV2(
    active: boolean,
    userId: string,
    app: string,
    type: string,
    role: string,
    expiresAt?: any,
    placeId?: string,
    balconyId?: string,
    eventId?: string,
  ) {
    return this.transactionService.execute(async tx => {
      if (!app || !userId) throw new Error('missing required data');
      type = type || 'place';
      const checkIn: any = await this.checkInV2Repository.findOne({
        where: {and: [{userId}, {app}]},
      });
      const placeInstance =
        await this.placeRepository.findCurrentInstanceById(placeId);
      const placeInstanceId = placeInstance?.id;
      let event: any;
      if (active) {
        const events = await this.eventRepository.findAll({
          where: {and: [{placeId}, {deleted: false}]},
        });
        console.log({placeInstance});
        if (placeInstance) {
          const eventInstances = await this.eventInstanceRepository.findAll({
            where: {
              and: [
                {eventId: {inq: events.map(e => e.id)}},
                {date: placeInstance.date},
              ],
            },
          });
          console.log({eventInstances});
          if (eventInstances && eventInstances?.[0]) {
            event = await this.eventRepository.findById(
              eventInstances[0].eventId,
              EventFullQuery,
            );
          }
        }
      }
      if (checkIn?.id) {
        let reload = false;
        const differences: any = {
          active,
          role,
          placeId,
          type,
          balconyId,
          eventId,
          placeInstanceId,
        };
        for (const key of Object.keys(differences)) {
          if (differences[key] !== checkIn[key]) {
            reload = true;
            break;
          }
        }
        if (reload) {
          differences.expiresAt = expiresAt;
          this.checkInOutActivityV2(
            active ? 'in' : 'out',
            app,
            userId,
            placeId,
            balconyId,
            placeInstanceId,
          );
          await this.checkInV2Repository.updateById(checkIn.id, differences);
        }
        const response = await this.checkInV2Repository.findById(checkIn.id);
        return {...response, event: event};
      } else {
        this.checkInOutActivityV2(
          active ? 'in' : 'out',
          app,
          userId,
          placeId,
          balconyId,
          placeInstanceId,
        );
        return this.checkInV2Repository.create({
          app,
          role,
          placeId,
          type,
          balconyId,
          eventId,
          userId,
          active,
          expiresAt,
          placeInstanceId,
        });
      }
    });
  }

  checkInOutActivityV2(
    direction: string,
    app,
    userId,
    placeId,
    balconyId,
    placeInstanceId,
  ) {
    const signature = 'check-' + direction + '--';
    voidPromiseCall(() =>
      this.activityV2Repository.create({
        app,
        userId,
        action: signature + 'place',
        referenceId: placeId,
      }),
    );
    if (placeInstanceId) {
      voidPromiseCall(() =>
        this.activityV2Repository.create({
          app,
          userId,
          action: signature + 'place-instance',
          referenceId: placeInstanceId,
        }),
      );
    }
    if (app == 'staff') {
      voidPromiseCall(() =>
        this.activityV2Repository.create({
          app,
          userId,
          action: signature + 'balcony',
          referenceId: balconyId,
        }),
      );
    }
  }

  async checkInV2(payload: any = {}) {
    const {userId, app, role, placeId, balconyId, eventId, type, expiresAt} =
      payload;

    return this.checkInOutV2(
      true,
      userId,
      app,
      type,
      role,
      expiresAt,
      placeId,
      balconyId,
      eventId,
    );
  }
  async checkOutV2(payload: any = {}) {
    const {userId, app, role, placeId, balconyId, eventId, type, expiresAt} =
      payload;

    return this.checkInOutV2(
      false,
      userId,
      app,
      type,
      role,
      expiresAt,
      placeId,
      balconyId,
      eventId,
    );
  }

  async verifyCheckIn(body: {userId: string; app: string}) {
    const action: any =
      body.app == 'user' ? 'findUserCheckIn' : 'findStaffCheckIn';

    const result = await this.checkInV2Repository[action](body.userId);
    return result;
  }

  async getSignedInManagerCompany(userId: string) {
    const app = 'admin';
    const action = 'sign-in--company';

    const activity = await this.activityV2Repository.findOne({
      where: {
        and: [{userId}, {action}, {deleted: false}, {app}],
      },
    });

    return activity?.referenceId;
  }
  /* -------------------------------------------------------------------------- */
  /*                                     V1                                     */
  /* -------------------------------------------------------------------------- */

  async loginWithIdToken(body: {
    provider: string;
    idToken: string;
  }): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(body.idToken);

      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  }

  // Method to verify Firebase ID token
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      if (idToken.startsWith('Bearer '))
        idToken = idToken.replace('Bearer ', '');
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  }
}

const voidPromiseCall = (fn: any): void => {
  fn();
};
