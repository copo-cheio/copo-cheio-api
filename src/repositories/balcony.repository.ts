import {Getter,inject} from "@loopback/core";
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from "@loopback/repository";
import {SqliteDbDataSource} from "../datasources";
import {Balcony,BalconyRelations,Image,Place} from "../models";
import {ImageRepository} from "./image.repository";
import {PlaceRepository} from "./place.repository";

export class BalconyRepository extends DefaultCrudRepository<
  Balcony,
  typeof Balcony.prototype.id,
  BalconyRelations
> {
  public readonly place: BelongsToAccessor<Place, typeof Balcony.prototype.id>;

  public readonly cover: BelongsToAccessor<Image, typeof Balcony.prototype.id>;

  constructor(
    @inject("datasources.SqliteDb") dataSource: SqliteDbDataSource,
    @repository.getter("PlaceRepository")
    protected placeRepositoryGetter: Getter<PlaceRepository>,
    @repository.getter("ImageRepository")
    protected imageRepositoryGetter: Getter<ImageRepository>
  ) {
    super(Balcony, dataSource);
    this.cover = this.createBelongsToAccessorFor(
      "cover",
      imageRepositoryGetter
    );
    this.registerInclusionResolver("cover", this.cover.inclusionResolver);
    this.place = this.createBelongsToAccessorFor(
      "place",
      placeRepositoryGetter
    );
    this.registerInclusionResolver("place", this.place.inclusionResolver);

    (this.modelClass as any).observe("persist", async (ctx: any) => {
      ctx.data.updated_at = new Date();
    });
  }
}
