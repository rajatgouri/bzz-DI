var sql = require("mssql");

exports.init = function(io) {

    io.on('connection', function(socket) {
        console.log('Connection Setup to socket');

        socket.on('setUserID', (id) => {
            socket.user = id;
            sql.query(`update JWT set Online = '1' where EMPID = ${id}`);
            io.sockets.emit('updated-wqs');
        })

    
        socket.on('update-wqs', () => {
            io.sockets.emit('updated-wqs');
        })


        socket.on('update-reminder', () => {
            io.sockets.emit('updated-reminder');
        })

        socket.on('disconnect',  function () { 

            if(socket.user == undefined) {
                return 
            }

            io.sockets.emit('updated-wqs');


            sql.query(`update JWT set Online = '0' where EMPID = ${socket.user}`);
        });


        socket.on('disconnected',  function () {
                io.sockets.emit('updated-wqs');

                if(socket.user == undefined) {
                    return 
                }
                
                sql.query(`update JWT set Online = '0' where EMPID = ${socket.user}`);
        });

        
    })
} 