function checkContentTypeIsJson(req, res, next) {
  if (req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
    res.status(415);
    res.set('Content-Type', 'application/json');
    return res.json({
      message: 'The "Content-Type" header must always be "application/json"'
    });
  }
  next();
  return res.json;
}

export default checkContentTypeIsJson;
