var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;


 
server.listen(8001);
console.log('record serve started at port 8001');

app.get('/', function (req, res) {
  res.sendFile('index.html');
});

/**
app.get('/files', function (req, res) {

 
  console.log(req.query.filepath);
  //res.send('hello world');
  res.sendfile(req.query.filepath);

});**/

 
app.use('/static', express.static(__dirname + '/uploads'));

io.on('connection', function (socket) {
  //socket.emit('news', { hello: 'world' });
   	console.log('a client connected');
       var newdir='uploads/recording/'+(new Date()).getTime();
	mkdirp(newdir, function(err) { 

    		console.log(err);

	});
 
	 socket.emit('connected',{path:newdir});
        
	//var wstream = fs.createWriteStream('uploads/test.webm');
	socket.on('stream', function (data) {
              
	     	
            var filename=(new Date()).getTime();
	     var videoFile=newdir+'/'+filename+'.webm';
	     var audioFile=newdir+'/'+filename+'.wav'
            var mergedFile=newdir+'/'+filename+'-merged.webm';	
	     fs.writeFileSync(newdir+'/'+filename+'.webm', data.vdata);
	     fs.writeFileSync(newdir+'/'+filename+'.wav', data.adata);
             var command = "ffmpeg -i " + audioFile + " -i " + videoFile + " -map 0:0 -map 1:0 " + mergedFile;
             var mergecommand="mencoder  -oac mp3lame -lameopts abr:br=24 -ovc copy -o "+newdir+"/combined.webm "+newdir+"/*.webm";
              exec(command, function (error, stdout, stderr) {
			if (stdout) console.log(stdout);
			if (stderr) console.log(stderr);

			if (error) {
			    console.log('exec error: ' + error);
			    //socket.emit('connected',{path:newdir});

			} else {
			    console.log("file merged:"+mergedFile)
			    fs.unlink(audioFile);
			    fs.unlink(videoFile);
			}
			if(data.last){
			    socket.emit('finished',{path:newdir});
			    exec(mergecommand, function (error, stdout, stderr) {
				if (stdout) console.log(stdout);
			       if (stderr) console.log(stderr);
				if (error) {
			    		console.log('exec error: ' + error);}	
                                
			     })

			}

               });
             
   		
             console.log('recorder finished');
		 
		 
	});
	  socket.on('disconnect', function(){
	    console.log('user disconnected');
	    //if(wstream){
		//wstream.end();
		//	fs.unlink(tmp_path);
	    //}
	  });
    
  
});
