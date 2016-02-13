
var path = require('path')
var bucket = process.env.MONSTERCAT_DATA_BUCKET || 'data.monstercat.com';


/*
 opts:
   ReleasePackage: mongojs ReleasePackage collection 
   client: aws-sdk s3 client
   releaseId: release objectid
   releaseParams:
     format: 'mp3' or 'flac' or 'wav'
     quality: 0,5 (for mp3s)
   awsParams: see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

 params: additional aws getSignedUrl parameters
 example:
   Expires: 60 (60 seconds)
 */
var exports = module.exports = function signReleaseUrl (opts, done) {
  var client = opts.client;
  var awsParams = opts.awsParams || {};
  var releaseParams = opts.releaseParams || {};
  var releaseId = opts.releaseId;
  if (!releaseId) throw Error("releaseId required")
  var col = opts.ReleasePackage;
  getReleasePackage(col, releaseId, releaseParams, function (err, pack) {
    if (err) return done(err);
    awsParams.Key = "blobs/" + pack.blobId;
    awsParams.Bucket = awsParams.bucket || bucket; 
    awsParams.ResponseContentDisposition =
      awsParams.ResponseContentDisposition || contentDist(pack.path);
    client.getSignedUrl('getObject', awsParams, done)
  });
}

function attachment(filename) {
  return "attachment; filename=\"" + filename + "\"";
}
function contentDist(file) {
  return attachment(path.basename(file))
}

function getReleasePackage(ReleasePackage, releaseId, obj, done) {
  var q = {
    releaseId: releaseId,
    status: 'finished'
  };
  return ReleasePackage.find(q).sort('-createdDate', function (err, pkgs) {
    if (err) return done(err);
    if (!pkgs || pkgs.length === 0)
      return done(Error('A valid package was not found for release.'));
    var pack = findPackByFormat(pkgs, obj);
    var fmt = obj.format;
    if (!pack) return done(Error('The format ' + fmt + ' is not supported'));
    return done(undefined, pack);
  });
}

exports.getReleasePackage = getReleasePackage;

function findPackByFormat(pkgs, fmt) {
  for (var i = 0; i < pkgs.length; i++) {
    var pkg = pkgs[i];
    if (!pkg.releases) continue;
    var releases = pkg.releases;
    for (var j = 0; j < releases.length; j++) {
      var pack = releases[j];
      if (pack.format !== fmt.format) continue;
      if ((pack.quality != null) && pack.quality !== +fmt.quality)
        continue;
      if ((pack.bitRate != null) && pack.bitRate !== +fmt.bitRate)
        continue;
      return pack;
    }
  }
}
