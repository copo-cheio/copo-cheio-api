import { /* inject, */ BindingScope,inject,injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../blueprints/balcony.blueprint';
import {PlaceQueryFull} from '../blueprints/place.blueprint';
import {ActivityRepository,BalconyRepository,EventRepository,PlaceRepository} from '../repositories';
import {PlaceService} from './place.service';

@injectable({scope: BindingScope.TRANSIENT})
export class ActivityService {
  constructor(/* Add @inject to inject parameters */

    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
    @inject("services.PlaceService")
    protected placeService: PlaceService
  ) {}

  /*
   * Add service methods here
   */
  async checkIn(userId:string,placeId:string){
    try{

      // let {userId,placeId,eventId } = params;
      let place:any;
      let event:any;
      let checkIn:any;
      let shoppingCart:any;
      let menu:any;

      // if(eventId){
        //   event = await this.eventRepository.findById(eventId,EventFullQuery)
        //   placeId = event.place.id;
        //   console.log('event done')
        // // }
        console.log('place start')

        place = await this.placeRepository.findById(placeId,PlaceQueryFull);
        event = await this.placeService.findCurrentEvent(placeId)
        let eventId =event.id
        console.log('place done')
        console.log('checkIn start',{userId,placeId,eventId,action:"check-in"})
        checkIn = await this.activityRepository.create({
          userId,
          placeId,
          eventId,
          action: "check-in"
        })
        console.log('checkIn done')
        console.log('balcony start')
        menu = await this.balconyRepository.findById(place.balconies[0].id,BalconyFullQuery)
        console.log('track stock')
/*
        menu.menu.ingredients = [];
        for(let product of menu.menuProducts) {
          for(let ingredient of product.ingredients) {
            if(menu.menu.ingredients.indexOf(ingredient.id)==-1){
              menu.menu.ingredients.push(ingredient.id)
            }
          }
        }

        menu.menu.ingredients = menu.menu.ingredients.map((id:string)=>{
           return {
            id,
            quantity:100
           }
        })
        */
        console.log('balcony done')

        return {
          place,
          event,
          refId: checkIn.id,
          menu:menu.menu
        }
      }catch(ex){
        throw ex
      }
  }

  async checkOut(params:any={}){
    return {}
  }
}

