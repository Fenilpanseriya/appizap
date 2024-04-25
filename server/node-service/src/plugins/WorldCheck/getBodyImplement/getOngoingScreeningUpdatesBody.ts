export default function getBodyOngoingScreeningUpdates(queryOptions: any) {
  const body: any = {};

  if (!queryOptions.updateDate) {
    throw Error('Update Date cannot be empty');
  } else {
    const [day, month, year] = queryOptions.updateDate.split('/');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    body.query = `updateDate>='${isoDate}'`;
  }

  body.pagination = {
    currentPage: 1,
    itemsPerPage: queryOptions.itemsPerPage || 10,
  };

  body.sort = [
    {
      columnName: 'updateDate',
      order: queryOptions.order || 'ASCENDING',
    },
  ];

  return body;
}
