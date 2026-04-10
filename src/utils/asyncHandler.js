const asyncHandler = () => (req, res, next) => {
    Promise.resolve(req, res, next)
        .then(() => next())
        .catch((error) => next(error));
}

export default asyncHandler;