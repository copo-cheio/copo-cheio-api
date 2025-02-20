import {inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';

import * as admin from 'firebase-admin';
import {
  ActivityV2Repository,
  CheckInV2Repository,
  PlaceRepository,
} from '../repositories';
import {TransactionService} from './transaction.service';

@injectable()
export class AuthService {
  constructor(
    @repository('CheckInV2Repository')
    public checkInV2Repository: CheckInV2Repository,
    @repository('ActivityV2Repository')
    public activityV2Repository: ActivityV2Repository,
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,
    @inject('services.TransactionService')
    private transactionService: TransactionService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                     V2                                     */
  /* -------------------------------------------------------------------------- */
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

          return this.checkInV2Repository.findById(checkIn.id);
        }
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
