export const isValidEmail = (email: string = '') => {
  const str: any = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
  return str && str?.length > 0 ? true : false;
};

export const isValidHttpUrl = (str: string) => {
  let url;

  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

export function replaceAll(str: string = '', find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export const validateUuid = (id: any, fallback: string) => {
  const valid = typeof id == 'string' && id.split('-').length > 4; //validate(id);
  return {
    valid,
    uuid: valid ? id : fallback,
  };
};
