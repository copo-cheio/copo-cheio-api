import {repository} from "@loopback/repository";
import {get,param,post,requestBody,response} from "@loopback/rest";
import CryptoJS from 'crypto-js';
import {v7} from "uuid";
import {EventFullQuery} from "../blueprints/event.blueprint";
import {Event} from "../models";
import {EventRepository} from "../repositories";
import {debugLogger} from '../utils/dev';
import {replaceAll} from '../utils/validations';
const MODELS: any = {
  event: {
    model: Event,
    repository: "eventRepository",
    fullQuery: EventFullQuery,
  },
};

const KEY = v7().split("-")[0];

function decrypt(cipherText: any = "") {
  // Get real text
  const log = debugLogger("decrypt")
  log.log(cipherText.length)
  cipherText = replaceAll(cipherText,'__314__','/')
  log.log(cipherText.length)
  // let i = 0
  //Decode from text
  const $key = KEY;
  // const $password = "#9E1LetkJd@" //process.env.EMAIL_PASSWORD?.split('#')[1];
  const $password = "" //process.env.EMAIL_PASSWORD?.split('#')[1];

  const secret = $password + $key;


  // log.log({cipherText,secret})

  // console.log(++i);
  var key: any = CryptoJS.enc.Utf8.parse(secret);
  // console.log(++i);
  var iv = CryptoJS.enc.Utf8.parse(key);
  // console.log(++i);
  var cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(cipherText),
  });
  // console.log(++i);
  var decryptedFromText = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv });
  // console.log(++i);
  var res = decryptedFromText.toString(CryptoJS.enc.Utf8);
  // console.log(++i);
  // console.log({res,decryptedFromText,cipherText});
  return JSON.parse(res);

  // const $password = document.querySelector(ELEMENTS.PASSWORD).value;
  //       const $key = document.querySelector(ELEMENTS.KEY).value;
  //       const secret = $password + $key;
  //       var key = CryptoJS.enc.Utf8.parse(secret);
  //       var iv = CryptoJS.enc.Utf8.parse(key);
  // // IV is a base64 string
  // let iv1 = CryptoJS.enc.Base64.parse(iv);

  // var key = CryptoJS.enc.Utf8.parse(secret);
  // var cipherBytes = CryptoJS.enc.Base64.parse(cipherText);

  // var decrypted = CryptoJS.AES.decrypt({ciphertext: cipherBytes}, key, {
  //     iv: iv1,
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7
  // });

  // return decrypted.toString(CryptoJS.enc.Utf8);
}

export class DevelopmentController {
  constructor(
    @repository(EventRepository)
    public eventRepository: EventRepository
  ) {}

  /*
  @post('/development')
  @response(200, {
    description: 'Event model instance',
    content: {'application/json': {schema: getModelSchemaRef(Event)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {
            title: 'NewEvent',
            exclude: ['id'],
          }),
        },
      },
    })
    event: Omit<Event, 'id'>,
  ): Promise<Event> {
    return this.eventRepository.create(event);
  }
  */

  @get("/development/list")
  @response(200, {
    description: "Array of available models",
  })
  async list(): // @param.filter(Event) filter?: Filter<Event>,
  Promise<any> {

    return new Promise((res) => {
      setTimeout(() => {
        res({
          models: Object.keys(MODELS),
          key: KEY,
        });
      }, 10);
    });
    // return this.eventRepository.find(filter);
  }
  @get("/development/filter/{model}")
  @response(200, {
    description: "Array of available models",
  })
  async queryParams(
    @param.path.string("model") model: string
  ): Promise<any> {
    return new Promise((res) => {
      setTimeout(() => {
        res(MODELS[model].fullQuery);
      }, 10);
    });
  }
  @get("/development/query/{model}/{payload}")
  @response(200, {
    description: "Array of available models",
  })
  async filterParams(
    @param.path.string("model") model: string,
    @param.path.string("payload") payload: string
  ): Promise<any> {
    return new Promise((res) => {
      setTimeout(() => {
        console.log({model,payload})
        res({ model,payload, decrypted: decrypt(payload) });
      }, 10);
    });
  }

  // @post("/development/query/{model}")
  // @response(200, {
  //   description: "Array of available models",
  // })
  // async queryModel(
  //   @param.path.string("model") model: string,

  // ): Promise<any> {
  //   return new Promise((res) => {
  //     setTimeout(() => {
  //       console.log({model,payload})
  //       res({ model,payload, decrypted: decrypt(payload) });
  //     }, 10);
  //   });
  // }




  @post("/development/query/{model}")
  @response(200, {
    description: "Array of available models",
  })

  async create(
    @param.path.string("model") model: string,
    @requestBody({
      content: {

      },
    })
    data:any
  ): Promise<any> {

    // @ts-ignore
    return this?.[MODELS[model]?.repository]?.find(decrypt(data.payload))

  }

}
