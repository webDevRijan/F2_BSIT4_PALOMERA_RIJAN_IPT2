export function notFoundHandler(req, res) {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.originalUrl} was not found.` });
}

export function errorHandler(error, req, res, next) {
  const status = error.status || (error.code === "LIMIT_FILE_SIZE" ? 400 : 500);
  const message =
    error.code === "LIMIT_FILE_SIZE"
      ? "The cover image must be 5 MB or smaller."
      : error.message || "Something went wrong on the server.";

  if (status >= 500) console.error(error);
  res.status(status).json({ message });
}
