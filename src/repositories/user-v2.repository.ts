export const UserV2Transformer = (data: any = []) => {
  const transformer = (item: any = {}) => {
    return {
      photoUrl: item.avatar,
      photoURL: item.avatar,
      created_at: item.created_at,
      uid: item.firebaseUserId,
      id: item.id,
      name: item.name,
      fullName: item.name,
    };
  };
  return Array.isArray(data)
    ? data.map(UserV2Transformer)
    : UserV2Transformer(data);
};
