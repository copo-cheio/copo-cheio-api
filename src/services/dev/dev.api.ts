export class DevServiceApi {
  private initialized = false;
  devRepository: any;
  userRepository: any;
  getPlaceRepository: any;
  getBalconyRepository: any;
  getMenuRepository: any;
  getOrderRepository: any;
  pushNotificationService: any;

  constructor() {}

  public async findByAction(app: any, action: any, refId: string) {
    const record: any = await this.devRepository.findOne({
      where: {and: [{refId}, {app}, {action}]},
    });
    return record;
  }

  async createByAction(app: any, action: any, refId: string, data: any) {
    const payload = {
      app,
      action,
      refId,
      data,
    };

    const record: any = await this.devRepository.create(payload);
    return record;
  }

  public async findOrCreateByAction(
    app: any,
    action: any,
    refId: string,
    data: any,
  ) {
    let record: any = await this.findByAction(app, action, refId);
    if (!record) {
      record = await this.createByAction(app, action, refId, data);
      record = await this.findByAction(app, action, refId);
    }
    return record;
  }
  public async findOrCreateThenUpdateByAction(
    app: any,
    action: any,
    refId: string,
    data: any,
  ) {
    let record: any = await this.findOrCreateByAction(app, action, refId, data);
    await this.devRepository.updateById(record.id, {
      app,
      refId,
      action,
      data,
    });
    record = await this.findByAction(app, action, refId);
    return record;
  }

  public init(
    devRepositoryGetter: any,
    userRepositoryGetter: any,
    getPlaceRepository: any,
    getBalconyRepository: any,
    getMenuRepository: any,
    getOrderRepository: any,
    pushNotificationService: any,
  ) {
    if (this.initialized) return;
    this.initialized = true;
    this.devRepository = devRepositoryGetter;
    this.userRepository = userRepositoryGetter;
    this.getPlaceRepository = getPlaceRepository;
    this.getBalconyRepository = getBalconyRepository;
    this.getMenuRepository = getMenuRepository;
    this.getOrderRepository = getOrderRepository;
    this.pushNotificationService = pushNotificationService;
  }
}
