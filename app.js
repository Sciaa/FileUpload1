'use strict';

let express= require('express')
    ,multer = require('multer')
    ,upload = multer()
    ,app = express()

    ,Jimp = require('jimp')
    ,fs = require('fs')
    ,path = require('path')
    ,_ = require('lodash')
    ,Promise = require('bluebird')
    ,fileType = require('file-type');
    
    
        function convertImgs(files){

            let promises = [];

            _.forEach(files, (file)=>{

                //Create a new promise for each image processing
                let promise = new Promise((resolve, reject)=>{

                //Resolve image file type
                let type = fileType(file.buffer);

                //Create a jimp instance for this image
                new Jimp(file.buffer, (err, image)=>{

                    //Resize this image
                    image.resize(512, 512)
                        //lower the quality by 90%
                        .quality(10)
                        .getBuffer(type.mime, (err, buffer)=>{
                            //Transfer image file buffer to base64 string
                            let base64Image = buffer.toString('base64');
                            let imgSrcString = "data:" + type.mime + ';base64, ' + base64Image;
                            //Resolve base94 string
                            resolve(imgSrcString);
                        });
                    })
                });

                promises.push(promise);
            });

            //Return promise array
            return Promise.all(promises);
        };    

app.get('/', (req, res, next)=>{
    res.sendFile(__dirname+'/index.htm');
});

app.post('/uploadImg', upload.array('pics'), (req, res, next)=>{

    //Call the convertImgs method and pass the image files as its argument
    convertImgs(req.files).then((imageStringArray)=>{

        //After all image processing finished, send the base64 image string to client
        res.json(imageStringArray)

    })
});
    

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);
