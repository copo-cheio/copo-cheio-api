// Uncomment these imports to begin using these cool features!

import {Filter,repository} from "@loopback/repository";
import {get,getModelSchemaRef,param,response} from "@loopback/rest";

import {OpeningHours} from "../models/opening-hours.model";
import {OpeningHoursRepository} from "../repositories/opening-hours.repository";

// import {inject} from '@loopback/core';

export class OpeningHoursController {
  constructor(
    @repository(OpeningHoursRepository)
    public openingHoursRepository: OpeningHoursRepository
  ) {}

  @get("/opening-hours")
  @response(200, {
    description: "Array of OpeningHours model instances",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: getModelSchemaRef(OpeningHours, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(OpeningHours) filter?: Filter<OpeningHours>
  ): Promise<any[]> {
    const placeId = "a813bc90-d422-4d60-aa48-1e7d6c69ae8e";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dayofweek = new Date().getDay();
    const prevdayofweek = yesterday.getDay();
    let hours: any = new Date().getHours();
    let minutes: any = new Date().getMinutes();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    let time = [hours, minutes, "00"].join(":");

    const query = `
    SELECT * from openinghours WHERE 
      ( openhour > closehour and closehour != '00:00' and ( 
        (openhour <= $1 and dayofweek = $2 ) or (closehour >= $1 and dayofweek = $3 )))
      OR 
      ( ((openhour < closehour and closehour != '00:00' and closehour > $1) OR closehour='00:00') AND openhour <= $1  AND dayofweek = $2 )
      AND deleted = false 
      AND placeId = $4  
    `

    const params =[time,dayofweek,prevdayofweek,placeId]



    return this.openingHoursRepository.dataSource.execute(query,params)
  }
}
