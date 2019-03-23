// dependencies
var AWS = require('aws-sdk')
var gm = require('gm')
 .subClass({ imageMagick: true }) // Enable ImageMagick integration.
var util = require('util')
// constants
var MAX_WIDTH = 100
var MAX_HEIGHT = 100
// get reference to S3 client
var s3 = new AWS.S3()
exports.handler = async function (event) {
 // Read options from the event.
 console.log('Reading options from event:\n', util.inspect(event, { depth: 5 }))
 var srcBucket = event.Records[0].s3.bucket.name
 // Object key may have spaces or unicode non-ASCII characters.
 var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
 var dstBucket = srcBucket + '-resized'
 var dstKey = 'resized-' + srcKey
 // Infer the image type.
 var typeMatch = srcKey.match(/\.([^.]*)$/)
 if (!typeMatch) {
 console.error('unable to infer image type for key ' + srcKey)
 return
 }
 var imageType = typeMatch[1]
 if (imageType !== 'jpg' && imageType !== 'png') {
 console.log('skipping non-image ' + srcKey)
 return
 }
 // Download the image from S3 var downloadImage = function () {
 var downloadImage = function () {
 console.log('Downloading image...')
 return new Promise(resolve => {
 var params = {
 Bucket: srcBucket,
 Key: srcKey
 }
 s3.getObject(params, function (err, data) {
	if (err) console.log(err, err.stack) // an error occurred
	else {
	resolve(data)
	console.log('Downloaded image')
	}
	})
	})
	}
	// Transform image using ImageMagick
	var resizeImage = function () {
	console.log('Resizing image...')
	return new Promise(resolve => {
	gm(srcObject.Body).size(function (err, size) {
	// Infer the scaling factor to avoid stretching the image unnaturally.
	if (err) { // an error occurred
	console.log(err)
	return 0
	} else {
	var scalingFactor = Math.min(
	MAX_WIDTH / size.width,
	MAX_HEIGHT / size.height
	)
	var width = scalingFactor * size.width
	var height = scalingFactor * size.height
	// Transform the image buffer in memory.
	this.resize(width, height)
	.toBuffer(imageType, function (err, buffer) {
	if (err) console.log(err) // an error occurred
	else {
	console.log('Resized image')
	resolve(buffer)
	}
	})
	}
	})
	})
	}
	// Upload the transformed image to a different S3 bucket.
	var uploadImage = function () {
	console.log('Uploading resized image...')
	return new Promise(resolve => {
	var params = {
	Bucket: dstBucket,
	Key: dstKey,
	Body: dstObject,
	ContentType: srcObject.ContentType
	}
	s3.putObject(params, function (err, data) {
	if (err) console.log(err, err.stack) // an error occurred
	else {
	console.log('Uploaded resized image')// successful response
	}
	})
	})
	}
	let srcObject = await downloadImage()
	let dstObject = await resizeImage()

	await uploadImage()
}