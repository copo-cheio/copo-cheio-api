import {Getter,inject} from "@loopback/core";
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from "@loopback/repository";
import {SqliteDbDataSource} from "../datasources";
import {Balcony,Image,Place,PlaceRelations} from "../models";
import {BalconyRepository} from "./balcony.repository";
import {ImageRepository} from "./image.repository";

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
  constructor(
    @inject("datasources.SqliteDb") dataSource: SqliteDbDataSource,
    @repository.getter("BalconyRepository")
    protected balconyRepositoryGetter: Getter<BalconyRepository>,
    @repository.getter("ImageRepository")
    protected imageRepositoryGetter: Getter<ImageRepository>
  ) {
    super(Place, dataSource);
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
