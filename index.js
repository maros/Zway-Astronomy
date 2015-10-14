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

Astronomy.prototype.events = [
    'sunrise',          // sunrise (top edge of the sun appears on the horizon)
    'sunriseEnd',       // sunrise ends (bottom edge of the sun touches the horizon)
    'goldenHourEnd',    // morning golden hour (soft light, best time for photography) ends
    'solarNoon',        // solar noon (sun is in the highest position)
    'goldenHour',       // evening golden hour starts
    'sunsetStart',      // sunset starts (bottom edge of the sun touches the horizon)
    'sunset',           // sunset (sun disappears below the horizon, evening civil twilight starts)
    'dusk',             // dusk (evening nautical twilight starts)
    'nauticalDusk',     // nautical dusk (evening astronomical twilight starts)
    'night',            // night starts (dark enough for astronomical observations)
    'nadir',            // nadir (darkest moment of the night, sun is in the lowest position)
    'nightEnd',         // night ends (morning astronomical twilight starts)
    'nauticalDawn',     // nautical dawn (morning nautical twilight starts)
    'dawn'              // dawn (morning nautical twilight ends, morning civil twilight starts)
];

Astronomy.prototype.init = function (config) {
    Astronomy.super_.prototype.init.call(this, config);
    
    var self = this;
    
    // See https://github.com/mourner/suncalc
    executeFile("modules/Astronomy/suncalc.js");
    
    this.latitude       = config.latitude.toString();
    this.longitude      = config.longitude.toString();
    var langFile        = self.controller.loadModuleLang("Astronomy");
    _.each(self.events,function(event) {
        self[event+'Timer'] = null;
    });
    
    this.vDev = this.controller.devices.create({
        deviceId: "Astronomy_"+this.id,
        defaults: {
            deviceType: "sensorMultilevel",
            metrics: {
                probeTitle: "astronomy",
                title: langFile.title
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
    
    if (this.vDev) {
        this.controller.devices.remove(this.vDev.id);
        this.vDev = null;
    }
    
    clearTimeout(this.timer);
    
    _.each(self.events,function(event) {
        if (typeof(self[event+'Timeout']) === 'number') {
            clearTimeout(self[event+'Timeout']);
            self[event+'Timeout'] = null;
        }
    });
    
    Astronomy.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

Astronomy.prototype.updateCalculation = function () {
    var self        = this;
    //var langFile    = self.controller.loadModuleLang("Astronomy");
    var now         = new Date();
    var position    = SunCalc.getPosition(now, self.config.latitude, self.config.longitude);
    var times       = SunCalc.getTimes(now, self.config.latitude, self.config.longitude);
    var azimuth     = position.azimuth * 180 / Math.PI;
    var altitude    = position.altitude * 180 / Math.PI;
    
    console.log("Astronomy calculation");
    if (altitude < -2) {
        //self.vDev.set("metrics:title",langFile.night);
        self.vDev.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/night.png");
    } else {
        //self.vDev.set("metrics:title",langFile.day);
        self.vDev.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/day.png");
    }
    self.vDev.set("metrics:level",altitude);
    self.vDev.set("metrics:azimuth",azimuth);
    self.vDev.set("metrics:altitude",altitude);
    
    _.each(self.events,function(event) {
        self.vDev.set("metrics:"+event,times[event]);
        
        if (typeof(self[event+'Timeout']) !== 'number') {
            var diff = times[event].getTime() - now.getTime();
            if (diff > 0) {
                console.log("Install "+event+" timeout in "+diff);
                self[event+'Timeout'] = setTimeout(function() { self.callEvent(event); },diff);
            }
        }
    });
    
    this.controller.emit("astronomy.setPos", {
        azimuth: azimuth,
        altitude: altitude
    });
};

Astronomy.prototype.callEvent = function (event) {
    console.log("Astronomy event "+event);
    this[event+'Timeout'] = null;
    this.controller.emit("astronomy."+event);
};

 