import moment from 'moment';

export default [
  {
    name: 'All Challenges',
    allIncluded: true,
    sortingOptions: ['Most recent'],
  },
  {
    name: 'My challenges',
    check(item) {
      return item.myChallenge;
    },
    sortingOptions: [
      'Most recent',
      'Time to submit',
      '# of registrants',
      '# of submissions',
      'Prize high to low',
      'Title A-Z',
    ],
    getApiUrl: (pageIndex, limit = 50, username = 'tonyj') => (
      `${process.env.API_URL}/members/${username}/challenges/?&filter=status=active&limit=${limit}&orderBy=submissionEndDate`
    ),
  },
  {
    name: 'Open for registration',
    check(item) {
      return item.status === 'ACTIVE';
    },
    sortingOptions: [
      'Most recent',
      'Time to register',
      'Phase end time',
      '# of registrants',
      '# of submissions',
      'Prize high to low',
      'Title A-Z',
    ],
    info: {
      phaseName: 'registration',
    },
    getApiUrl: (pageIndex, limit = 50) => (
      `${process.env.API_URL}/challenges/?pageIndex=${pageIndex}&limit=${limit}`
    ),
  },
  {
    name: 'Ongoing challenges',
    check(item) {
      return !item.registrationOpen.startsWith('Yes') && item.status === 'ACTIVE';
    },
    sortingOptions: [
      'Most recent',
      'Current phase',
      'Title A-Z',
      'Prize high to low',
    ],
    // this api endpoint probably doesn't match the filter criteria exactly
    // kept for reference
    // getApiUrl: (pageIndex, limit = 50) => (
    //   `http://api.topcoder.com/v2/challenges/active?pageIndex=${pageIndex}&limit=${limit}`
    // ),
  },
  {
    name: 'Past challenges',
    check(item) {
      return item.status === 'COMPLETED';
    },
    sortingOptions: [
      'Most recent',
      'Title A-Z',
      'Prize high to low',
    ],
    getApiUrl: (pageIndex, limit = 50) => (
      `${process.env.API_URL}/challenges/?filter=status=completed&pageIndex=${pageIndex}&limit=${limit}`
    ),
  },
  /**
  // Removed: sidebar link points to another page
  {
    name: 'Open for review',
    check(item) {
      return item.currentPhaseName === 'Review';
    },
    sortingOptions: [
      'Most recent',
      '# of registrants',
      '# of submissions',
      'Prize high to low',
      'Title A-Z',
    ],
    // No api endpoint available currently
    // the commented out api endpoint is most likely wrong
    // kept for reference
    // getApiUrl: (pageIndex, limit = 50) => {
    //   const yesterday = new Date();
    //   yesterday.setDate(yesterday.getDate() - 1);
    //   const yesterdayFormatted = yesterday.toJSON().slice(0, 10);
    //
    //   return `http://api.topcoder.com/v2/challenges/open?pageIndex=${pageIndex}&limit=${limit}&submissionEndTo=${yesterdayFormatted}`;
    // },
  },
  */
  {
    name: 'Upcoming challenges',
    check(item) {
      return item.status === 'DRAFT';
    },
    sortingOptions: [
      'Most recent',
      'Title A-Z',
      'Prize high to low',
    ],
    getApiUrl: (pageIndex, limit = 50) => (
      `${process.env.API_URL}/challenges/?filter=status=draft&pageIndex=${pageIndex}&limit=${limit}`
    ),
  },
];
