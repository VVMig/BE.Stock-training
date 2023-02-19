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
