var fs = require('fs');
const path = require('path');

function LoadV(cb){
	fs.readFile('vars.dmow', function(err, buf) {
  		cb(buf.toString());
	});
}

function SaveV(d, cb){
	var data = d;
	fs.writeFile('vars.dmow', data, function(err, data){
   		if (err) console.log(err);
    	console.log("Variables Written");
    	cb(true)
	});
}

function SaveB(fn,d){
	var data = d;
	fs.writeFile('./storage/blocks/'+fn+'.dmow', JSON.stringify(data), function(err, data){
   	if (err) console.log(err);
    		console.log("Block written");
	});
}

function LoadB(fn,cb){
	fs.readFile('./storage/blocks/'+fn, function(err, buf) {
  		cb(buf.toString());
	});
}

function ReadConfiguration(cb){
	fs.readFile('./config.d', function(err, buf) {
  		cb(buf.toString());
	});
}

function ContainsB(fn,cb){
	fs.readFile('./storage/blocks/'+fn, function(err, buf) {
		if(!err){
			cb(true)
		}else{
			cb(false)
		}	
	});
}

function VerifyB(b){
	//TODO: continue verification
	return true
}

function CleanAllB(){
	const directory = './storage/blocks/';
	fs.readdir(directory, (err, files) => {
	  if (err) throw err;
	  for (const file of files) {
	    fs.unlink(path.join(directory, file), err => {
	      if (err) throw err;
	    });
	  }
	});
}

module.exports = {
	LoadV,
	SaveV,
	SaveB,
	LoadB,
	ContainsB,
	VerifyB,
	CleanAllB,
	ReadConfiguration
}