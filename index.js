/*** Astronomy Z-Way HA module *******************************************

Version: 1.08
(c) Maroš Kollár, 2015
-----------------------------------------------------------------------------
Author: Maroš Kollár <maros@k-1.com>
Description:
    This module checks weather updates via weatherundergound.com

******************************************************************************/

function Astronomy (id, controller) {
    // Call superconstructor first (AutomationModule)
    Astronomy.super_.call(this, id, controller);
    
    this.latitude       = undefined;
    this.longitude      = undefined;
    this.vDev           = {};
    this.timer          = undefined;
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
    executeFile(self.moduleBasePath()+"/suncalc.js");
    
    self.latitude       = config.latitude.toString();
    self.longitude      = config.longitude.toString();
    var langFile        = self.controller.loadModuleLang("Astronomy");
    _.each(self.events,function(event) {
        self[event+'Timer'] = undefined;
    });
    
    _.each(['altitude','azimuth'],function(type) {
        self.vDev[type]= self.controller.devices.create({
            deviceId: "Astronomy_"+self.id+"_"+type,
            defaults: {
                deviceType: "sensorMultilevel",
                metrics: {
                    icon: 'icon.png',
                    title: langFile[type+'_device']
                }
            },
            overlay: {
                probeType: 'astronomy_sun_'+type,
                metrics: {
                    scaleTitle: "°"
                }
            },
            moduleId: self.id
        });
    });
    
    self.interval = setInterval(function() {
        self.updateCalculation(self);
    }, 60*1000);
    
    self.updateCalculation();
};

Astronomy.prototype.stop = function () {
    var self = this;
    
    _.each(['altitude','azimuth'],function(type) {
        
        if (typeof(self.vDev[type]) !== 'undefined') {
            self.controller.devices.remove(self.vDev[type].id);
            self.vDev[type] = undefined;
        }
    });
    
    clearInterval(self.interval);
    self.timer = undefined;
    
    Astronomy.super_.prototype.stop.call(self);
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
    var azimuth     = position.azimuth * 180 / Math.PI + 180;
    var altitude    = position.altitude * 180 / Math.PI;
    var mode;
    
    console.log("[Astronomy] Calculate");
    if (altitude < -2) {
        mode = 'night';
    } else {
        mode = 'day';
    }
    self.vDev.altitude.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/altitude_"+mode+".png");
    self.vDev.altitude.set("metrics:level",altitude);
    self.vDev.altitude.set("metrics:azimuth",azimuth);
    self.vDev.altitude.set("metrics:altitude",altitude);
    
    if (typeof(self.vDev.azimuth) !== 'undefined') {
        self.vDev.azimuth.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/azimuth_"+mode+".png");
        self.vDev.azimuth.set("metrics:level",azimuth);
        self.vDev.azimuth.set("metrics:azimuth",azimuth);
        self.vDev.azimuth.set("metrics:altitude",altitude);
    }
    
    _.each(self.events,function(event) {
        self.vDev.altitude.set("metrics:"+event,times[event]);
        if (times[event].getHours() === now.getHours()
            && times[event].getMinutes() === now.getMinutes()
            && times[event].getDate() === now.getDate()) {
            console.log("[Astronomy] Event "+event);
            self.controller.emit("astronomy."+event);
        }
    });
};
