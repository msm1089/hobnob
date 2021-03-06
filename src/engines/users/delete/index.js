function del(req, db) {
  if (req.params.userId !== req.user.id) {
    return Promise.reject(new Error('Forbidden'));
  }
  return db
    .delete({
      index: process.env.ELASTICSEARCH_INDEX,
      type: 'user',
      id: req.params.userId
    })
    .then(() => undefined)
    .catch(err => {
      if (err.status === 404) {
        return Promise.reject(new Error('Not Found'));
      }
      return Promise.reject(new Error('Internal Server Error'));
    });
}

export default del;
