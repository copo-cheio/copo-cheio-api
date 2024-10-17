import sanitizeHtml from "sanitize-html";
import {AddressBelongsToTransformer} from "./address.blueprint";
import {ImageBelongsToTransformer} from "./image.blueprint";
import {PlaceBelongsToTransformer} from "./place.blueprint";
import {PlaylistBelongsToTransformer} from "./playlist.blueprint";
import {ScheduleBelongsToTransformer} from "./schedule.blueprint";
import {IncludeAddressRelation} from "./shared/address.include";
import {IncludeCover} from "./shared/image.include";
import {IncludeLineupRelation} from "./shared/lineup.include";
import {IncludeOpeningHoursRelation} from "./shared/openinghours.include";
import {IncludePlaceRelation} from "./shared/place.include";
import {IncludePlaylistRelation} from "./shared/playlist.include";
import {QueryFilterBaseBlueprint} from "./shared/query-filter.interface";
import {IncludeRulesRelation} from "./shared/rule.include";
import {IncludeScheduleRelation} from "./shared/schedule.include";
import {IncludeTagsRelation} from "./shared/tag.include";
import {IncludeTicketsRelation} from "./shared/ticket.include";

export const EventsQuery: any = {
  ...QueryFilterBaseBlueprint,
  fields: {
    id: true,
    name: true,
    description: true,
    email: true,
    webpage: true,
    status: true,
    coverId: true,
    addressId: true,
    scheduleId: true,
    playlistId: true,
    placeId: true,
    endDate: true,
    startDate:true,
    type: true,
    tagIds: true,
    recurrenceType: true,
    recurrenceEndDate: true,
    isRecurring: true, // True if recurring, false if one-time event
    eventType: true,
  },
  include: [
    "cover",
    IncludeAddressRelation,
    IncludeScheduleRelation,
    IncludePlaceRelation,
    IncludeOpeningHoursRelation,
    IncludeTagsRelation,
    IncludePlaylistRelation,
    { relation: "instances" }, // Include event instances (occurrences)
    { relation: "recurringSchedule" }, // Include recurring schedules
  ],
};

export const EventFullQuery: any = {
  fields: {
    id: true,
    name: true,
    description: true,
    email: true,
    webpage: true,
    status: true,
    endDate: true,
    startDate:true,
    type: true,
    coverId: true,
    addressId: true,
    scheduleId: true,
    playlistId: true,
    placeId: true,
    tagIds: true,
    recurrenceType: true,
    recurrenceEndDate: true,
    isRecurring: true, // True if recurring, false if one-time event
    eventType: true,
  },
  include: [
    IncludeCover,
    IncludeAddressRelation,
    IncludeScheduleRelation,
    IncludePlaceRelation,
    IncludePlaylistRelation,
    IncludeRulesRelation,
    IncludeTicketsRelation,
    IncludeLineupRelation,
    IncludeTagsRelation,
    IncludeOpeningHoursRelation,
    { relation: "instances" }, // Include event instances (occurrences)
    { relation: "recurringSchedule" }, // Include recurring schedules
  ],
};

export const EventCreateSchema = {
  type: "object",
  required: ["name", "placeId"],
  properties: {
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    email: {
      type: "string",
    },
    webpage: {
      type: "string",
    },
    placeId: {
      type: "string",
    },
    coverId: {
      type: "string",
    },
    addressId: {
      type: "string",
    },

    scheduleId: {
      type: "string",
    },

    type: {
      type: "string",
    },
    endDate: {
      type: "date",
    },
    tagIds: {
      type: "array",
    },
    tickets: {
      type: "array",
    },
  },
};

const EVENT_DEFAULTS = {
  endDate: {
    once: "1900-01-01 ",
    repeat: "3145-01-01 ",
  },
};
export const getEventEndDate = async (event: any) => {
  const type = event?.schedule?.scheduleType || event.type || "once";
  let endDate = new Date(EVENT_DEFAULTS.endDate.once);
  if (type == "once") {
    let scheduleRanges: any[] = event?.schedule?.scheduleRanges || [
      { end: { datetime: EVENT_DEFAULTS.endDate.once } },
    ];
    for (let scheduleRange of scheduleRanges) {
      let scheduleEnd = scheduleRange?.end?.datetime
        ? new Date(scheduleRange?.end?.datetime)
        : endDate;
      if (scheduleEnd > endDate) {
        endDate = scheduleEnd;
      }
    }
  } else if (type == "repeat") {
    endDate = new Date(EVENT_DEFAULTS.endDate.repeat);
  }
  event.endDate = endDate;
  event.type = type;

  return event;
};

export const EventCreateTransformer = async (event: any) => {
  event.name = sanitizeHtml(event.name || "");
  event.description = sanitizeHtml(event.description || "");
  /* ************ Schedule ************ */
  event = await getEventEndDate(event);
  event = ScheduleBelongsToTransformer(event, event?.type || "once");

  /* ************** Image ************* */
  event = ImageBelongsToTransformer(event, "cover");

  /* ************* Address ************ */
  event = AddressBelongsToTransformer(event, "event");

  /* ************** Place ************* */
  event = PlaceBelongsToTransformer(event, "place");

  /* ************** Tags ************** */
  event.tagIds = Array.isArray(event.tagIds) ? event.tagIds : [];

  /* ************ Playlist ************ */
  event = PlaylistBelongsToTransformer(event, "event");

  /* ************** Live ************** */
  event.live = 0;

  return event;
};

export const EventValidation = async (repository: any, data: any) => {
  console.log({ data: JSON.stringify(data) });
  let isLive = () => {
    let isValid = true;
    const notDefaultBelongsTo = ["addressId", "scheduleId", "placeId"];
    const notNull = [
      "name",
      "coverId",
      "playlistId",
      "tagIds",
      // "playlistId",
      ...notDefaultBelongsTo,
    ];

    for (let nN of notNull) {
      if (data[nN] == null) {
        isValid = false;
        return false;
      }
    }
    for (let nonDefault of notDefaultBelongsTo) {
      if (data[nonDefault] && data[nonDefault].indexOf("00000000") > 0) {
        isValid = false;
        return false;
      }
    }

    return isValid;
  };

  let live = isLive();
  if (data.live !== live) {
    data.live = live;
    await repository.updateById(data.id, data);
  }

  return data;
};
