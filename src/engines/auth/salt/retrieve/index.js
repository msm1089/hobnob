const NO_RESULTS_ERROR_MESSAGE = 'no-results';

function retrieveSalt(req, db, getSalt) {
  if (!req.query.email) {
    return Promise.reject(new Error('Email not specified'));
  }
  return db
    .search({
      index: process.env.ELASTICSEARCH_INDEX,
      type: 'user',
      body: {
        query: {
          match: {
            email: req.query.email
          }
        }
      },
      _sourceIncludes: 'digest'
    })
    .then(res => {
      const user = res.hits.hits[0];
      return user ? user._source.digest : Promise.reject(new Error(NO_RESULTS_ERROR_MESSAGE));
    })
    .then(getSalt);
}

export default retrieveSalt;
