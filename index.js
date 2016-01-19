/*** Astronomy Z-Way HA module *******************************************

Version: 1.05
(c) Maroš Kollár, 2015
-----------------------------------------------------------------------------
Author: Maroš Kollár <maros@k-1.com>
Description:
    This module checks weather updates via weatherundergound.com

******************************************************************************/

function Astronomy (id, controller) {
    // Call superconstructor first (AutomationModule)
    Astronomy.super_.call(this, id, controller);
    
    this.latitude   = undefined;
    this.longitude  = undefined;
    this.vDev       = undefined;
    this.timer      = undefined;
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
        self[event+'Timer'] = undefined;
    });
    
    this.vDev = this.controller.devices.create({
        deviceId: "Astronomy_"+this.id,
        defaults: {
            deviceType: "sensorMultilevel",
            metrics: {
                title: langFile.m_title
            }
        },
        overlay: {
            metrics: {
                probeTitle: "Astronomy",
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
        this.vDev = undefined;
    }
    
    clearTimeout(this.timer);
    
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
    
    console.log("[Astronomy] Calculate");
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
        if (times[event].getHours() === now.getHours()
            && times[event].getMinutes() === now.getMinutes()
            && times[event].getDate() === now.getDate()) {
            console.log("[Astronomy] Event "+event);
            self.controller.emit("astronomy."+event);
        }
    });
};