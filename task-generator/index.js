const axios = require('axios');
const socketIOClient = require('socket.io-client');

const API_URL = 'http://localhost:5000';

var minTime = 5;
var maxTime = 10;

var minTitleNum = 100000;
var maxTitleNum = 999999;

var minPriority = 1;
var maxPriority = 5;

const socket = socketIOClient(API_URL);

function taskGenerator(){

    var randTitleNum = Math.floor(Math.random()*(maxTitleNum-minTitleNum+1)) + minTitleNum;
    var randPriorityNum = Math.floor(Math.random()*(maxPriority-minPriority+1)) + minPriority;

    // request post rest api
    var dateTime = new Date();
    dateTime.setMonth(dateTime.getMonth() + 1);
    var bodyParams = {};
    bodyParams.dueDate = dateTime.getFullYear() + '-' + 
        (dateTime.getMonth() + 1) + '-' + 
        dateTime.getDate() + ' ' +
        dateTime.getHours() + ':' +
        dateTime.getMinutes() + ':' +
        dateTime.getSeconds();
    bodyParams.title = 'Task' + randTitleNum;
    bodyParams.description = '';
    bodyParams.priority = randPriorityNum + '';
    bodyParams.status = 'Normal';

    console.log('dueDate:' + bodyParams.dueDate);
    console.log('title:' + bodyParams.title);
    console.log('priority:' + bodyParams.priority);    

    axios.post(API_URL+'/tasks', bodyParams)
    .then(function(response) {
        console.log('result:' + response.data);
        socket.emit('toServer', 'reload');
    })
    .catch(function(error){
        console.log(error);
    });

    // set random timeout
    var randTime = Math.floor(Math.random()*(maxTime-minTime+1)) + minTime;
    console.log('gen timeout: ' + randTime);
    setTimeout(taskGenerator, randTime * 1000);
}

taskGenerator();
setInterval(() => {
    axios.get(API_URL+'/tasks').then(response => response.data)
    .then((data) => {
        data.forEach( (element, i) => {
            if (element.postponeUntil != null){
                var d1 = new Date(element.postponeUntil);
                var d2 = new Date();
                if (d1.getTime() < d2.getTime()){
                    axios.put(API_URL+'/tasks/'+element.id, {
                        initPostponeUntil: 'a'
                    }).then(response => {
                        console.log(response.data);
                    })
                }
            }            
            console.log(element.title);
        })
    })
}, 60 * 1000);