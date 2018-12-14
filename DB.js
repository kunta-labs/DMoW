/*
Copyright 2017-Present The Kunta Protocol Authors
This file is part of the Kunta Protocol library.

The Kunta Protocol is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The Kunta Protocol is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the Kunta Protocol library. If not, see <http://www.gnu.org/licenses/>.
*/

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