// Bound read-only work even when DNS discovery or a slow socket outlives driver timeouts.
function withDeadline(operation, timeoutMS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error('Database operation timed out');
      error.name = 'MongoOperationTimeoutError';
      reject(error);
    }, timeoutMS);
    Promise.resolve(operation).then(value => {
      clearTimeout(timer);
      resolve(value);
    }, error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
module.exports = { withDeadline };
