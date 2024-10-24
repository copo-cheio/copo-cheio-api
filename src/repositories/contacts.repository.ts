import {inject} from "@loopback/core";
import {SoftCrudRepository} from "loopback4-soft-delete";
import {PostgresSqlDataSource} from "../datasources";
import {Contacts,ContactsRelations} from "../models";

export class ContactsRepository extends SoftCrudRepository<
  Contacts,
  typeof Contacts.prototype.id,
  ContactsRelations
> {
  constructor(
    @inject("datasources.PostgresSql") dataSource: PostgresSqlDataSource
  ) {
    super(Contacts, dataSource);
  }

  async createRecord(refId: string, data: any = {}) {
    await this.create({
      refId,
      email: data?.email || "",
      phone: data?.phone || "",
      website: data?.website || "",
      social_facebook: data?.social_facebook || "",
      social_instagram: data?.social_instagram || "",
      social_threads: data?.social_threads || "",
    });
  }
}
