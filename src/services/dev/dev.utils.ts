export function parseCreateOrder(data: any = {}, refId: string) {
  return {...data, user: {id: refId}};
}

export function createTimeline(
  orderId: string,
  status: string,
  staffId: string = 'e5ed35ae-f951-4a70-a129-e298a92c07cc',
) {
  return {
    id: '12ab87d2-73ff-4a79-872c-89390b4cde84',
    created_at: '2024-11-12T19:25:34.975Z',
    updated_at: '2024-11-12T19:25:34.975Z',
    orderId: orderId,
    action: status,
    title: status,
    staffId: staffId,
    timelineKey: status,
    staff: {
      deleted: false,
      deletedOn: null,
      deletedBy: null,
      id: staffId,
      created_at: '2024-09-30T04:30:23.982Z',
      updated_at: '2024-09-30T04:30:23.982Z',
      name: 'Filipe',
      avatar:
        'https://lh3.googleusercontent.com/a/ACg8ocI-GCGkmacL9DIKSmik1s-asg3Tib0F62HU4s0VfbmmgFwA9g=s96-c',
      email: 'pihh.backup@gmail.com',
      firebaseUserId: 'IrU8vmqxK8R9qcp1EP2Yl4Ddvx92',
      latitude: '38.5061208',
      longitude: '-9.1559578',
      isDeleted: false,
    },
  };
}
