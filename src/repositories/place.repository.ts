import {Getter,inject} from "@loopback/core";
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  repository
} from "@loopback/repository";
import {SqliteDbDataSource} from "../datasources";
import {Address,Balcony,Image,Place,PlaceRelations,Schedule,Tag,TagReferences, Event} from "../models";
import {AddressRepository} from './address.repository';
import {BalconyRepository} from "./balcony.repository";
import {ImageRepository} from "./image.repository";
import {ScheduleRepository} from './schedule.repository';
import {TagReferencesRepository} from './tag-relations.repository';
import {TagRepository} from './tag.repository';
import {EventRepository} from './event.repository';

/**
  {
    "id": "a813bc90-d422-4d60-aa48-1e7d6c69ae8e",
    "name": "Test place",
    "description": "description",
    "coverId": "c7082619-a902-4682-8b48-68ad59c33e3c",
    "addressId": "addressid"
  }
*/
export class PlaceRepository extends DefaultCrudRepository<
  Place,
  typeof Place.prototype.id,
  PlaceRelations
> {
  public readonly balconies: HasManyRepositoryFactory<
    Balcony,
    typeof Place.prototype.id
  >;
  public readonly cover: BelongsToAccessor<Image, typeof Balcony.prototype.id>;

  public readonly address: BelongsToAccessor<Address, typeof Place.prototype.id>;

  public readonly schedule: BelongsToAccessor<Schedule, typeof Place.prototype.id>;

  public readonly tags: HasManyThroughRepositoryFactory<Tag, typeof Tag.prototype.id,
          TagReferences,
          typeof Place.prototype.id
        >;

  public readonly events: HasManyRepositoryFactory<Event, typeof Place.prototype.id>;

  constructor(
    @inject("datasources.SqliteDb") dataSource: SqliteDbDataSource,
    @repository.getter("BalconyRepository")
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @repository.getter("ImageRepository")
    protected imageRepositoryGetter: Getter<ImageRepository>, @repository.getter('AddressRepository') protected addressRepositoryGetter: Getter<AddressRepository>, @repository.getter('ScheduleRepository') protected scheduleRepositoryGetter: Getter<ScheduleRepository>, @repository.getter('TagReferencesRepository') protected tagReferencesRepositoryGetter: Getter<TagReferencesRepository>, @repository.getter('TagRepository') protected tagRepositoryGetter: Getter<TagRepository>, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>,
  ) {
    super(Place, dataSource);
    this.events = this.createHasManyRepositoryFactoryFor('events', eventRepositoryGetter,);
    this.registerInclusionResolver('events', this.events.inclusionResolver);
    this.tags = this.createHasManyThroughRepositoryFactoryFor('tags', tagRepositoryGetter, tagReferencesRepositoryGetter,);
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
    this.schedule = this.createBelongsToAccessorFor('schedule', scheduleRepositoryGetter,);
    this.registerInclusionResolver('schedule', this.schedule.inclusionResolver);
    this.address = this.createBelongsToAccessorFor('address', addressRepositoryGetter,);
    this.registerInclusionResolver('address', this.address.inclusionResolver);
    this.cover = this.createBelongsToAccessorFor(
      "cover",
      imageRepositoryGetter
    );
    this.registerInclusionResolver("cover", this.cover.inclusionResolver);
    this.balconies = this.createHasManyRepositoryFactoryFor(
      "balconies",
      balconyRepositoryGetter
    );
    this.registerInclusionResolver(
      "balconies",
      this.balconies.inclusionResolver
    );

    (this.modelClass as any).observe("persist", async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
