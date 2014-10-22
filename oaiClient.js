var http = require('http');
var et = require('elementtree');


function OaiClient(url){
  this.url = url;
}

OaiClient.prototype.fetchService = function(params, callback){
  var url = this.url + '?verb=' + params;
       
  var req = http.get(url, function(res) {
    var chunks = [];

    res.on('data', function(chunk) {
      chunks.push(chunk);
    });

    res.on('end', function() {
      var buf = Buffer.concat(chunks);
      callback(null, buf.toString())
    });
  });

  req.on('error', callback);
  req.end();
}

OaiClient.prototype.listSets = function(callback){
  this.fetchService('ListSets', callback);
}

OaiClient.prototype.identify = function(callback){
  this.fetchService('Identify', callback);

}

OaiClient.prototype.listMetadataFormats = function(){
  this.fetchService('ListMetadataFormats', callback);
}

OaiClient.prototype.listRecords = function(metadataPrefix, setSpec, token, callback){
  var params = '';
  if(setSpec){
    params = 'ListRecords&metadataPrefix='+metadataPrefix+'&set='+setSpec;
  } else {
    params = 'ListRecords&metadataPrefix='+metadataPrefix;
  }
  if(token){
    params = 'ListRecords&resumptionToken='+token;
  }
  this.fetchService(params, callback);
}

OaiClient.prototype.harvest = function(metadataPrefix, setSpec, token,  callback){
  var self = this;
    
  myCallback = function(err, data){
    if(err){
      return callback(err);  
    }
    token = et.parse(data).find('ListRecords/resumptionToken');
    callback(err, data);
    if(token.text){
      self.listRecords(metadataPrefix, null, token.text, myCallback);
    }
  }

 this.listRecords(metadataPrefix, null, token, myCallback);
}

module.exports = OaiClient;
