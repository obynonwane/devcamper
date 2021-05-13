const advancedRsult = (model, populate) => async (req, res, next) => {
  let query;

  //make a copy request query
  const reqQuery = { ...req.query };
  console.log(reqQuery);

  //Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //loop over removeField and delete them from the reqQuery
  removeFields.forEach((params) => delete reqQuery[params]);

  //create query string
  let queryStr = JSON.stringify(reqQuery);

  //create operators ($gt, $gte, $lt, $lte, $in)
  //find a match at the begining or end of a word (b); find global match (g) instead
  //stoping at the first occurance
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //finding resource
  query = model.find(JSON.parse(queryStr));

  //select
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt"); //default sort
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //executing the query
  const results = await query;

  //Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedRsult;
