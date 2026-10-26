/**
 * Wraps async route handlers so rejected promises reach the error middleware
 * instead of hanging the request.
 */
export default function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
