import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import request from 'request';
import {responseError} from '../utils/query';

@injectable({scope: BindingScope.TRANSIENT})
export class SpotifyService {
  private FILE_KEY = 'spotify.service';

  public API_URL = 'https://accounts.spotify.com/api/token';
  private CLIENT_ID = '74d1b969e84d4042897a121936cb0219'; //process.env.CLIENT_ID;
  private CLIENT_SECRET = '8f8ae7ba294348768a218d42c87b355a'; //process.env.CLIENT_SECRET;
  private ENCRYPTION_SECRET = 'the-secret'; //process.env.ENCRYPTION_SECRET;
  public CLIENT_CALLBACK_URL = 'copocheio://callback'; //process.env.CLIENT_CALLBACK_URL;

  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  async spotifyRequest(params: any = {}) {
    const {API_URL, CLIENT_ID, CLIENT_SECRET} = this;
    return new Promise((resolve, reject) => {
      request.post(
        API_URL,
        {
          form: params,
          headers: {
            Authorization:
              'Basic ' +
              new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
          },
          json: true,
        },
        (err, resp) => (err ? reject(err) : resolve(resp)),
      );
    })
      .then((resp: any) => {
        if (resp.statusCode !== 200) {
          return Promise.reject({
            statusCode: resp.statusCode,
            body: resp.body,
          });
        }
        return Promise.resolve(resp.body);
      })
      .catch(err => {
        return Promise.reject({
          statusCode: 500,
          body: JSON.stringify({}),
        });
      });
  }

  // Helper functions
  encrypt(text: any) {
    return CryptoJS.AES.encrypt(text, this.ENCRYPTION_SECRET).toString();
  }

  decrypt(text: any) {
    const bytes = CryptoJS.AES.decrypt(text, this.ENCRYPTION_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async authenticate(params: any = {}) {
    if (!params.code) {
      /*       return res.json({
        "error": "Parameter missing"
      }); */
      throw responseError(this.FILE_KEY + '::refresh', 'No token');
    }

    try {
      const session = await this.spotifyRequest({
        grant_type: 'authorization_code',
        redirect_uri: this.CLIENT_CALLBACK_URL,
        code: params.code,
      });

      return {
        access_token: session.access_token,
        expires_in: session.expires_in,
        refresh_token: this.encrypt(session.refresh_token),
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw responseError(this.FILE_KEY + '::refresh', 'Spotify Auth', error);
    }
  }

  async refresh(params: any = {}) {
    if (!params.refresh_token) {
      throw responseError(this.FILE_KEY + '::refresh', 'No token');
    }
    try {
      const session = await this.spotifyRequest({
        grant_type: 'refresh_token',
        refresh_token: this.decrypt(params.refresh_token),
      });
      return session;
    } catch (error) {
      throw responseError(
        this.FILE_KEY + '::refresh',
        'Spotify Refresh',
        error,
      );
    }
  }
}
