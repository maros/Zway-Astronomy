/*** Astronomy Z-Way HA module *******************************************

Version: 1.0.0
(c) Maroš Kollár, 2015
-----------------------------------------------------------------------------
Author: maros@k-1.com <maros@k-1.com>
Description:
    This module checks weather updates via weatherundergound.com

******************************************************************************/

function Astronomy (id, controller) {
    // Call superconstructor first (AutomationModule)
    Astronomy.super_.call(this, id, controller);
}

inherits(Astronomy, AutomationModule);

_module = Astronomy;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

Astronomy.prototype.init = function (config) {
    Astronomy.super_.prototype.init.call(this, config);
    
    var self = this;
    
    // See https://github.com/mourner/suncalc
    executeFile("modules/Astronomy/suncalc.js");
    
    this.latitude = config.latitude.toString();
    this.longitude = config.longitude.toString();
    this.sunsetTimer = null;
    this.sunriseTimer = null;
    
    this.vDev = this.controller.devices.create({
        deviceId: "Astronomy_"+this.id,
        defaults: {
            deviceType: "sensorMultilevel",
            metrics: {
                probeTitle: 'Sun Altitude'
            }
        },
        overlay: {
            metrics: {
                scaleTitle: "°"
            }
        },
        moduleId: this.id
    });
    
    this.timer = setInterval(function() {
        self.updateCalculation(self);
    }, 60*1000);
    self.updateCalculation();
};

Astronomy.prototype.stop = function () {
    var self = this;
    Astronomy.super_.prototype.stop.call(this);
    
    if (this.vDev) {
        this.controller.devices.remove(this.vDev.id);
        this.vDev = null;
    }
    
    _.each(['sunrise','sunset'],function(key) {
        if (typeof(self[key+'Timeout']) === 'number') {
            clearTimeout(self[key+'Timeout']);
            self[key+'Timeout'] = null;
        }
    });
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

Astronomy.prototype.updateCalculation = function () {
    var self        = this;
    var langFile    = self.controller.loadModuleLang("Astronomy");
    var now         = new Date();
    var position    = SunCalc.getPosition(now, self.config.latitude, self.config.longitude);
    var times       = SunCalc.getTimes(now, self.config.latitude, self.config.longitude);
    var azimuth     = position.azimuth * 180 / Math.PI;
    var altitude    = position.altitude * 180 / Math.PI;
    
    console.log("Astronomy calculation");
    if (altitude < -2) {
        self.vDev.set("metrics:title",langFile.night);
        self.vDev.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/night.png");
    } else {
        self.vDev.set("metrics:title",langFile.day);
        self.vDev.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/day.png");
    }
    self.vDev.set("metrics:level",altitude);
    self.vDev.set("metrics:azimuth",azimuth);
    self.vDev.set("metrics:altitude",altitude);
    self.vDev.set("metrics:sunrise",times.sunrise);
    self.vDev.set("metrics:sunset",times.sunset);
    
    this.controller.emit("astronomy.setPos", {
        azimuth: azimuth,
        altitude: altitude
    });
    
    _.each(['sunrise','sunset'],function(key) {
        if (typeof(self[key+'Timeout']) !== 'number') {
            var diff = times[key].getTime() - now.getTime();
            if (diff > 0) {
                console.log("Install "+key+" timeout in "+diff);
                self[key+'Timeout'] = setTimeout(function() { self.callEvent(key); },diff);
            }
        }
    });
};

Astronomy.prototype.callEvent = function (event) {
    console.log("Astronomy event "+event);
    this[event+'Timeout'] = null;
    this.controller.emit("astronomy."+event);
};

 