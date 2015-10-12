# Zway-Astronomy

Zway Astronomy module for calculating the current solar position. The module
provides various metrics and emits events when the sun reaches certain
positions.

# Configuration

## latitude,longitude

Geo coordinates for the used position

# Virtual Devices

This module creates a virtual device that displays the angle of the sun
above the horizon in degrees. Additionally the following metrics are set

*    metrics:azimuth: Sun position degrees
*    metrics:altitude: Altitude above horizont
*    metrics:sunrise: Top edge of the sun appears on the horizon
*    metrics:sunriseEnd: Bottom edge of the sun touches the horizon
*    metrics:goldenHourEnd: Morning golden hour ends
*    metrics:solarNoon: Sun is in the highest position
*    metrics:goldenHour: Evening golden hour starts
*    metrics:sunsetStart: Bottom edge of the sun touches the horizon
*    metrics:sunset: Sun disappears below the horizon, evening civil twilight starts
*    metrics:dusk: Evening nautical twilight starts
*    metrics:nauticalDusk: Evening astronomical twilight starts
*    metrics:night: Night starts.dark enough for astronomical observations
*    metrics:nadir: Darkest moment of the night, sun is in the lowest position
*    metrics:nightEnd: Night ends. Morning astronomical twilight starts
*    metrics:nauticalDawn: Morning nautical twilight starts)
*    metrics:dawn: Morning nautical twilight ends, morning civil twilight starts

All metrics except azimuth and altitude are stored as JavaScript Date objects,
and may lay in the past since they are only calculated for the current day. 
The device icon indicates day/night.

# Events

## astronomy.setPos - Called whenever azimuth and altitude are recalculated

## astronomy.sunrise

## astronomy.sunset

## astronomy.sunriseEnd

## astronomy.goldenHourEnd

## astronomy.solarNoon

## astronomy.goldenHour

## astronomy.sunsetStart

## astronomy.dusk

## astronomy.nauticalDusk

## astronomy.night

## astronomy.nadir

## astronomy.nightEnd

## astronomy.nauticalDawn

## astronomy.dawn

# License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or any 
later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
