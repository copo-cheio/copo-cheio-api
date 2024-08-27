import {belongsToTransformer} from '../shared/database'

export const DefaultPlaylist = {
  place: "00000000-0000-0000-0000-000000000031",
  event: "00000000-0000-0000-0000-000000000032",
  artist:"00000000-0000-0000-0000-000000000033",

}


export const PlaylistBelongsToTransformer = (record:any, type:"place"|"event" |"artist" ="event")=>{
  return belongsToTransformer(record, type , "playlistId" , DefaultPlaylist)
}


