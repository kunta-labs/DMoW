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

var mosca = require('mosca');
var mqtt = require('mqtt')
var fs = require('fs');
var DB = require('./DB.js')
const crypto = require("crypto");
const vm = require('vm')
const args = process.argv;
var clients = []
var transaction_memory = []
var client = null;
var syncInterval = null;
var Configuration = {}
var LatestBlock = {}
var restrictions = ["OnNewMessage","OnNewBlock","OnCreate"] //TODO: check for incorrect usage

var settings = {
	port:parseInt(args[2])
}

var server = new mosca.Server(settings);
server.on('ready', function(){
        console.log("init");
});

function InitPeer(p){
	client = mqtt.connect('mqtt://'+p.location)
	client.on('connect', function () {
		client.subscribe('use_case_1', function (err) {
    			if (!err) {
    				console.log("Successfully Connected to "+p.location)
    			}
		})
	})
	client.on('message', function (topic, message) {
  		var messageObject = JSON.parse(message)
  		if (messageObject.type == "sync"){
  			DB.ContainsB(messageObject.block.hash, (function(iHaveBlock){
	  			if( !iHaveBlock ){ 
	  				if(DB.VerifyB(messageObject.block)){ 
	  					DB.SaveB(messageObject.block.index, messageObject.block)
	  				}
	  			}
  			}))
  		}else if (messageObject.type == "chainfunction"){
  			var loadedFunction = Configuration[messageObject.scenario.toString()]
	    	LoadExecuteSave( loadedFunction, {}, (function(){
	    		//chain function, load execute save calback
	    	}) )	
  		}else if(messageObject.type =="transaction"){
  			console.log("[transaction]")
  			console.log(messageObject)
  			transaction_memory.push(messageObject)
  		} 
  		//client.end()
	})
	clients.push(client)
}

function LoadExecuteSave(c, d = null, cb){
	DB.LoadV((function(O){
		console.log(JSON.parse(O))
		var sb_content = {"sb": JSON.parse(O), "fs": fs, "T":d}
		let result = vm.runInNewContext(c+";sb;", sb_content)
		DB.SaveV( JSON.stringify(result) , (function(r){
			cb(r)
		}))
	}))
}

function PublishToClients(t,d){
	clients.forEach((c) => {
		c.publish(t,d)
	})
}

function InitiateGenesis(g){
	let G = g
	var h = sha256(JSON.stringify(G));
	G.hash = h
	DB.SaveB("0", G)
}

function NewBlock(current_height, previous_block){
	var loadedFunction = Configuration["OnNewBlock"]			
	LoadExecuteSave( loadedFunction , {}, (function(r){
		transaction_memory.forEach((t) => {
			var scope = t.class.toString()
			var loadedFunction = Configuration[scope]			
			LoadExecuteSave( loadedFunction , t.data, (function(){
				console.log("New Block, tx, LXS")
			}))
		})
		let ProposedBlock = {
			"index": current_height,
			"application_name": "DMoW",
			"timestamp": Date.now(),
			"previous": previous_block.hash,
			"transactions": transaction_memory 
		}
		let ProposedBlockHash = sha256(JSON.stringify(ProposedBlock))
		ProposedBlock.hash = ProposedBlockHash
		transaction_memory = []
		DB.SaveB(current_height, ProposedBlock)
	}))	
}

function ChainSync(){
	const block_folder = './storage/blocks/';
	var block_height = 0
	var last_fn = "0.dmow"
	fs.readdirSync(block_folder).forEach(file => {
	  var file_block_number = parseInt(file.split(".")[0])
	  if(file == "0.dmow"){
	  	//genesis found
	  }
	  if(file_block_number > block_height){
	  	block_height = file_block_number
	  	last_fn = file
	  }
	})
	DB.LoadB(last_fn, (function(b){
		LatestBlock = JSON.parse(b)
		var commandObject = {"type":"sync","block": LatestBlock}
		PublishToClients('use_case_1', JSON.stringify(commandObject) )
		NewBlock(block_height+1, LatestBlock)
	}))	
}

function sha256(data) {
    var hash_result = crypto.createHash("sha256").update(data, "binary").digest("base64");
    var buf = Buffer.from(hash_result, 'base64');
	return buf.toString('hex');
}

function syncWithPeers(){
	peers.forEach( (p) => {
 		InitPeer(p)
	})
}

function resetInterval(){
	syncInterval = setInterval(ChainSync, 10000)
}

let peers = [{
		"location": "127.0.0.1:"+args[4] //self
}]

if(args[2] != 1883){
	//other peer
	peers.push({
		"location": "127.0.0.1:"+args[2]
	})
}

DB.CleanAllB()
syncWithPeers();

//initiate
DB.ReadConfiguration((function(c){
	Configuration = JSON.parse(c)
	let sandbox = Configuration.Sandbox
	DB.SaveV( JSON.stringify(sandbox) , (function(){
		Configuration.Genesis.C = sha256(JSON.stringify(Configuration)) 
		InitiateGenesis(Configuration.Genesis)
		setTimeout((function(){
			var loadedFunction = Configuration["OnCreate"]			
			LoadExecuteSave( loadedFunction, {}, (function(){
				console.log("After OnCreate")
			}) )
		}),2000)
		resetInterval()
	}))
}))

if(args[5] == "--as-peer" ){
	setTimeout((function(){
		var commandObject_transaction = {
				"type":"transaction",
				"class": "tx1",
				"data": {
					"new_var": "top ramen"
				}
		}
		PublishToClients('use_case_1', JSON.stringify(commandObject_transaction) )
		console.log("published as a fake peer")
	}),4000)
}

