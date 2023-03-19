import moment from 'moment';

export const getRandomDate = () => {
  const randomTimestamp =
    Date.now() - Math.random() * (Date.now() - new Date('2020').getTime());
  const randomDate = new Date(randomTimestamp);

  return randomDate;
};

export const getRandomDateWithRange = (
  start: moment.Moment,
  end: moment.Moment,
) =>
  moment(start.valueOf() + Math.random() * (end.valueOf() - start.valueOf()));

export const generateRandomRangeDates = () => {
  const randomDate = getRandomDate();

  return randomDate;
};

export const hoursToMilliseconds = (hours: number | string) => {
  if (typeof hours === 'number') {
    return hours * 60 * 60 * 1000;
  }

  const index = hours.indexOf('h');

  const hoursStr = hours.substring(0, index);

  // Convert the hours string to a number and return it
  return parseInt(hoursStr, 10) * 60 * 60 * 1000;
};
