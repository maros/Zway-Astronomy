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
    
    this.latitude = config.location.toString();
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
                scaleTitle: "°",
                title: "Sun"
            }
        },
        moduleId: this.id
    });
    
    this.timer = setInterval(function() {
        self.updateCalculation(self);
    }, 60*2*1000);
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
    // See https://github.com/mourner/suncalc
};


 