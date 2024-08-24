export const sortByDistance = ($user_lat: any, $user_lng: any) => {
  return `SELECT
    id, (
      6371 * acos (
      cos ( radians($user_lat) )
      * cos( radians( latitude ) )
      * cos( radians( longitude ) - radians($user_lng) )
      + sin ( radians($user_lat) )
      * sin( radians( latitude ) )
    )
) AS distance
FROM address
HAVING distance < 30
ORDER BY distance
`;
};

// Haversine formula to calculate distance
// export const haversine=   (lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const toRadians = (degrees: number) => degrees * (Math.PI / 180);
//   const R = 6371; // Earth's radius in km

//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c; // Distance in km
// }
