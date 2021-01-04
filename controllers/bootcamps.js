const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const { param } = require("../routes/bootcamps");
const { Query } = require("mongoose");

//@desc     Get all bootcamps
//@desc     GET /api/v1/bootcamps
//@desc     Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //make a copy request query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ["select"];

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
  query = Bootcamp.find(JSON.parse(queryStr));

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

  //executing the query
  const bootcamps = await query;

  res.json({
    status: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@desc     Get single bootcamps
//@desc     GET /api/v1/bootcamps/:id
//@desc     Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return new ErrorResponse(
      `Resource not found with id of ${req.params.id}`,
      404
    );
  }
  res.status(200).json({ status: true, data: bootcamp });
});

//@desc     Create a new Bootcamp
//@desc     POST /api/v1/bootcamps
//@desc     Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc     Update Bootcamp
//@desc     PUT /api/v1/bootcamps/:id
//@desc     Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return new ErrorResponse(
      `Resource not found with id of ${req.params.id}`,
      404
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Delete Bootcamp
//@desc     DELETE /api/v1/bootcamps/:id
//@desc     Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return new ErrorResponse(
      `Resource not found with id of ${req.params.id}`,
      404
    );
  }

  res.status(200).json({ success: true, data: {} });
});

//@desc     Get  Bootcamp within a Radius
//@desc     DELETE /api/v1/bootcamps/radius/:zipcode/:distance
//@desc     Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lon
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calculate radius using radians
  //Divide dist by radius of Earth
  //Earth Radius = 3,963 mi / 6378 km

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
