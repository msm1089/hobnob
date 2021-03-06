function errorHandler(err, req, res, next) {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err &&
    err.type === 'entity.parse.failed'
  ) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    return res.json({ message: 'Payload should be in JSON format' });
  }
  next();
  return res.json;
}

export default errorHandler;
