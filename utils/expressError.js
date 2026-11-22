//ExpressError.js
module.exports= class ExpresError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message=message;
  }
}