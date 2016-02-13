
# monstercat-release-url

  Generate an expiring release download url

## Installation

  Install with npm

    $ npm install monstercat/release-url

## Example

```js
var mongojs = require('mongojs')
var aws     = require('aws-sdk')
var getUrl  = require('monstercat-release-url')

var db = mongojs('test', ["ReleasePackage"])
var client = new aws.S3()

var params = {
  ReleasePackage: db.ReleasePackage,
  client: client,
  releaseId: mongojs.ObjectId("5673a010000d61193084e046"),
  releaseParams: {
    format: 'mp3',
    quality: 2
  }
};

getUrl(params, function (err, url) {
  if (err) throw err;
  console.log("download link: %s", url);
  db.close();
})
```

## API

    opts:
      ReleasePackage: mongojs ReleasePackage collection 
      client: aws-sdk s3 client
      releaseId: release objectid
      releaseParams:
        format: 'mp3' or 'flac' or 'wav'
        quality: 0,5 (for mp3s)
      awsParams: see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

    params: additional aws getSignedUrl parameters
