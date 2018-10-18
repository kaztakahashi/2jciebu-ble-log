'use strict';
var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([],true);
        console.log('startScanning');
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {
    if (peripheral.advertisement && peripheral.advertisement.manufacturerData) {
        var manufacturerData = peripheral.advertisement.manufacturerData;
        var type = manufacturerData.toString("hex");
        var buffer = manufacturerData;
        var uuid = peripheral.id;
        var macAddress = peripheral.id.match(/[0-9a-z]{2}/g).join(":");
        var rssi = peripheral.rssi;
        var now = new Date();

        if (type.startsWith("d50201") && buffer.length == 21) {
            console.log(peripheral.id + ': ' + type + '\(' + now.toLocaleString() + '\)') ;

            if (buffer.length < 21) {
                console.log(macAddress + " is not configure OMRON-Env. Expected AD lenght 21, actual " + buffer.length);
            } else {
                var envData;
                try {
                    var dataOffset = -5;
                    envData = {
                        timastamp: now.toLocaleString(),
                        UUID: uuid,
                        ID: macAddress,
                        rssi: rssi + " dBm",
                        Temperature: buffer.readInt16LE(dataOffset + 9) / 100 + ' ℃',  // 単位：0.01 degC
                        Humidity: buffer.readUInt16LE(dataOffset + 11) / 100 + ' %',   // 単位：0.01 %RH
                        ambient_light: buffer.readUInt16LE(dataOffset + 13) + ' lx',    // 単位：1 lx
                        pressure: buffer.readUInt32LE(dataOffset + 15) / 1000 + ' hPa',    // 単位：0.001 hPa
                        Noise: buffer.readUInt16LE(dataOffset + 19) / 100 + ' dB',      // 単位：0.01 dB
                        eTVOC: buffer.readUInt16LE(dataOffset + 21)  + ' ppb',      // 単位：ppb
                        eCO2: buffer.readUInt16LE(dataOffset + 23)  + ' ppm'      // 単位：ppm
                    };
                } catch(err) {
                    console.log(err);
                }
                var result;
                for ( var key in envData ) {
                    if ( result === undefined ) {
                        result = envData[key].toString() ;
                    } else {
                        result += ', ' + envData[key].toString() ;
                    }
                }
                console.log ( result ) ;
            }
        }
    }
});
