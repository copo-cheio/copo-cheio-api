import {AuthenticationBindings} from "@loopback/authentication";
import {Getter,inject} from "@loopback/core";
import {BelongsToAccessor,repository} from "@loopback/repository";
import {PostgresSqlDataSource} from "../datasources";
import {Event,EventInstance,EventInstanceRelations} from "../models";
import {BaseRepository} from "./_base.repository";
import {EventRepository} from "./event.repository";

export class EventInstanceRepository extends BaseRepository<
  EventInstance,
  typeof EventInstance.prototype.id,
  EventInstanceRelations
> {
  public readonly event: BelongsToAccessor<
    Event,
    typeof EventInstance.prototype.id
  >;

  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource,
    @repository.getter("EventRepository")
    protected eventRepositoryGetter: Getter<EventRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<any>
  ) {
    super(EventInstance, dataSource, getCurrentUser);
    this.event = this.createBelongsToAccessorFor(
      "event",
      eventRepositoryGetter
    );
    this.registerInclusionResolver("event", this.event.inclusionResolver);
  }
}
