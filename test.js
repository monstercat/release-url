
var test    = require('tape')
var mongojs = require('mongojs')
var aws     = require('aws-sdk')
var getUrl  = require('./')

var db = mongojs('test', ["ReleasePackage"])
var client = new aws.S3()

test('does it work', function (t) {
  t.plan(2);

  var params = {
    ReleasePackage: db.ReleasePackage,
    client: client,
    releaseId: mongojs.ObjectId("5673a12fd09d61193084e046"),
    releaseParams: {
      format: 'mp3',
      quality: 2
    }
  };

  getUrl(params, function (err, url) {
    t.error(err, "no err!");
    t.ok(url, url);
    db.close();
  })


})
