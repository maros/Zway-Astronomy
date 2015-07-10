# Zway-Astronomy

Zway Astronomy module for calculating the current solar position

# Configuration

## latitude,longitude

Geo coordinates for the used position

# Virtual Devices

This module creates a virtual device that displays the angle of the sun
above the horizon in degrees. Additionally the following metrics are set

*    metrics:azimuth: Sun position degrees
*    metrics:altitude: Altitude above horizont
*    metrics:sunrise: Todays sunrise as unix timestamp (may be past)
*    metrics:sunset: Todays sunset as unix timestamp (may be past)

# Events

## astronomy.sunrise

## astronomy.sunset

# License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or any 
later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
