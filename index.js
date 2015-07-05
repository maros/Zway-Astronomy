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
    executeFile("lib/suncalc.js");
    
    this.latitude = config.latitude.toString();
    this.longitude = config.longitude.toString();
    
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
    self.updateCalculation(self);
};

Astronomy.prototype.stop = function () {
    Astronomy.super_.prototype.stop.call(this);
    
    if (this.vDev) {
        this.controller.devices.remove(this.vDev.id);
        this.vDev = null;
    }
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

Astronomy.prototype.updateCalculation = function (instance) {
    var self = instance;
    var langFile = self.controller.loadModuleLang("Astronomy");
    
    var position = SunCalc.getPosition(new Date(), self.config.latitude, self.config.longitude);
    var times = SunCalc.getTimes(new Date(), self.config.latitude, self.config.longitude);
    var azimuth = position.azimuth * 180 / Math.PI;
    var altitude = position.altitude * 180 / Math.PI;
    
    if (position.altitude > -2) {
        self.vDev.set("metrics:title",langFile.night);
        self.vDev.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/night.png");
    } else {
        self.vDev.set("metrics:title",langFile.day);
        self.vDev.set("metrics:icon", "/ZAutomation/api/v1/load/modulemedia/Astronomy/day.png");
    }
    self.vDev.set("metrics:level",altitude);
    self.vDev.set("metrics:azimuth",azimuth);
    self.vDev.set("metrics:altitude",altitude);
    self.vDev.set("metrics:sunrise",times.sunrise.value);
    self.vDev.set("metrics:sunset",times.sunset.value);
};


 