|Product|Order|Technical|Tools &|Support &|
|---|---|---|---|---|
|Folder|Now|Documents|Software|Community|

# LM35Precision

## 1 Features

1• Calibrated Directly in Celsius (Centigrade)

- Linear + 10-mV/°C Scale Factor
- 0.5°C Ensured Accuracy (at 25°C)
- Rated for Full −55°C to 150°C Range
- Suitable for Remote Applications
- Low-Cost Due to Wafer-Level Trimming
- Operates From 4 V to 30 V
- Less Than 60-μA Current Drain
- Low Self-Heating, 0.08°C in Still Air
- Non-Linearity Only ±¼°C Typical
- Low-Impedance Output, 0.1 Ω for 1-mA Load
## 2 Applications

- Power Supplies
- Battery Management
- HVAC
- Appliances
### LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017

# Temperature Sensors

## 3 Description

The LM35 series are precision integrated-circuit temperature devices with an output voltage linearly- proportional to the Centigrade temperature. The LM35 device has an advantage over linear temperature sensors calibrated in Kelvin, as the user is not required to subtract a large constant voltage from the output to obtain convenient Centigrade scaling. The LM35 device does not require any external calibration or trimming to provide typical accuracies of ±¼°C at room temperature and ±¾°C over a full −55°C to 150°C temperature range. Lower cost is assured by trimming and calibration at the wafer level. The low-output impedance, linear output, and precise inherent calibration of the LM35 device makes interfacing to readout or control circuitry especially easy. The device is used with single power supplies, or with plus and minus supplies. As the LM35 device draws only 60 μA from the supply, it has very low self-heating of less than 0.1°C in still air. The LM35 device is rated to operate over a −55°C to 150°C temperature range, while the LM35C device is rated for a −40°C to 110°C range (−10° with improved accuracy). The LM35-series devices are available packaged in hermetic TO transistor packages, while the LM35C, LM35CA, and LM35D devices are available in the plastic TO-92 transistor package. The LM35D device is available in an 8-lead surface-mount small-outline package and a plastic TO-220 package.

### <u>Device Information</u>

**(1)**

|PART NUMBER|PACKAGE|BODY SIZE (NOM)|
|---|---|---|
|LM35 the end of the datasheet.|TO-CAN (3) TO-92 (3) SOIC (8) TO-220 (3)|4.699 mm × 4.699 mm 4.30 mm × 4.30 mm 4.90 mm × 3.91 mm 14.986 mm × 10.16 mm|

(1) For all available packages, see the orderable addendum at

### Basic Centigrade Temperature Sensor

### (2°C to 150°C)

+VS (4 V to 20 V)

LM35 OUTPUT 0 mV + 10.0 mV/°C

### Full-Range Centigrade Temperature Sensor

+VS

LM35 VOUT

R1

tVS Choose R1= –VS / 50 µA VOUT = 1500 mV at 150°C VOUT = 250 mV at 25°C VOUT = –550 mV at –55°C

# Centigrade

An IMPORTANT NOTICE at the end of this data sheet addresses availability, warranty, changes, use in safety-critical applications, intellectual property matters and other important disclaimers. PRODUCTION DATA.
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

# Table of Contents

**1 Features**.................................................................. 1
**2 Applications**........................................................... 1
**3 Description**............................................................. 1
**4 Revision History**..................................................... 2
**5 Pin Configuration and Functions**......................... 3
**6 Specifications**......................................................... 4

6.1 Absolute Maximum Ratings...................................... 4
6.2 ESD Ratings.............................................................. 4
6.3 Recommended Operating Conditions....................... 4
6.4 Thermal Information.................................................. 4
6.5 Electrical Characteristics: LM35A, LM35CA Limits... 5
6.6 Electrical Characteristics: LM35A, LM35CA............. 6
6.7 Electrical Characteristics: LM35, LM35C, LM35D
Limits.......................................................................... 8

6.8 Electrical Characteristics: LM35, LM35C, LM35D... 9
6.9 Typical Characteristics............................................ 11
**7 Detailed Description**............................................ 13

7.1 Overview................................................................. 13
7.2 Functional Block Diagram....................................... 13
7.3 Feature Description................................................. 13
7.4 Device Functional Modes........................................ 13
**8 Application and Implementation**........................ 14

8.1 Application Information............................................ 14
8.2 Typical Application.................................................. 15
8.3 System Examples................................................... 16
**9 Power Supply Recommendations**...................... 19
**10 Layout**................................................................... 19

10.1 Layout Guidelines................................................. 19
10.2 Layout Example.................................................... 20
**11 Device and Documentation Support**................. 21

11.1 Receiving Notification of Documentation Updates 21
11.2 Community Resources.......................................... 21
11.3 Trademarks........................................................... 21
11.4 Electrostatic Discharge Caution............................ 21
11.5 Glossary................................................................ 21
**12 Mechanical, Packaging, and Orderable**
**Information**........................................................... 21

**4 Revision History**

**Changes from Revision G (August 2016) to Revision H**

**Changes from Revision F (January 2016) to Revision G**

**Changes from Revision E (January 2015) to Revision F**

**Changes from Revision D (October 2013) to Revision E**

**Changes from Revision C (July 2013) to Revision D**

*Submit Documentation Feedback*

**Page**

**Page**

**Page**

**Page**

**Page**

Copyright © 1999–2017, Texas Instruments Incorporated *LM35*

- Changed NDV Package (TO-CAN) pinout from bottom view back to top view; added textnote to pinout............................. 3
- <u>Added pin numbers to the TO-CAN (TO46) pinout................................................................................................................ 3</u>
- Equation 1, changed From: 10 mV/°F To: 10mv/°C ............................................................................................................ 13
- <u>Power Supply Recommendations, changed From: "4-V to 5.5-V power supply" To: "4-V to 30-V power supply: .............. 19</u>
- <u>Changed NDV Package (TO-CAN) pinout from Top View to Bottom View ........................................................................... 3</u>
- Added *Pin Configuration and Functions* section, *ESD Ratings* table, *Feature Description* section, *Device Functional* *Modes*, *Application and Implementation* section, *Power Supply Recommendations* section, *Layout* section, *Device*
*and Documentation Support* section, and *Mechanical, Packaging, and Orderable Information* section.............................. 1

- Changed *W* to *Ω*.................................................................................................................................................................... 1
- <u>Changed W to Ω in Abs Max tablenote. ................................................................................................................................ 4</u>
Product Folder Links:
**LM35** SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017

**LP Package** **3-Pin TO-92** **(Bottom View)**

## +VS VOUT GND

## 1 2 3

**NEB Package** **3-Pin TO-220** **(Top View)**

LM

|VOUT|1|8|+VS|
|---|---|---|---|
|N.C.|2|7|N.C.|
|N.C.|3|6|N.C.|
|GND|4|5|N.C.|

35DT 1 2 3

N.C. = No connection
**www.ti.com**

# 5 Pin Configuration and Functions

**NDV Package** **3-Pin TO-CAN** **(Top View)**

(1) +VS (3) GND
(2) VOUT
Case is connected to negative pin (GND) Refer the second NDV0003H page for reference

**D Package** **8-PIN SOIC** **(Top View)**

+VS VOUT GND Tab is connected to the negative pin (GND). **NOTE:** The LM35DT pinout is different than the discontinued LM35DP

|Pin|Functions|
|---|---|
||TYPE DESCRIPTION|
|SO8||

**PIN** **NAME TO46 TO92 TO220**

|NAME|TO46|TO92|TO220|
|---|---|---|---|
|VOUT N.C.|2 — —|2 — —|3 — —|
|GND|3 —|3 —|2 —|
|N.C.|— —|— —|— —|
|+VS|1|1|1|

|1|O|Temperature Sensor Analog Output|
|---|---|---|
|2 3|—|No Connection|
|4 5|GROUND|Device terminalground pin, connect to power supply negative|
|6 7|—|No Connection|
|8|POWER|Positive power supply pin|

Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback* *LM35* Product Folder Links:
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

# 6 Specifications

|6.1|Absolute Maximum Ratings|
|---|---|
|6.2|ESD Ratings|
|6.3|Recommended Operating Conditions|
|6.4|Thermal Information|

over operating free-air temperature range (unless otherwise noted)

(1) (2)
**MIN MAX UNIT**

|||MIN|MAX|UNIT|
|---|---|---|---|---|
|Supply voltage||–0.2|35|V|
|Output voltage||–1|6|V|
|Output current|||10|mA|
|Maximum Junction Temperature, TJmax|TO-CAN, TO-92 Package|–60|150 150|°C|
|Storage Temperature, T specifications. apply when operating the device beyond its rated operating conditions.|TO-220, SOIC Package|–65|150|°C|

(1) If Military/Aerospace specified devices are required, please contact the Texas Instruments Sales Office/ Distributors for availability and
(2) Absolute Maximum Ratings indicate limits beyond which damage to the device may occur. DC and AC electrical specifications do not

stg

||VALUE|UNIT|
|---|---|---|
|V(ESD) Electrostatic discharge|±2500|V|

(1) JEDEC document JEP155 states that 500-V HBM allows safe manufacturing with a standard ESD control process.

Human-body model (HBM), per ANSI/ESDA/JEDEC JS-001

(1)
over operating free-air temperature range (unless otherwise noted) **MIN MAX UNIT**

||NDV|LP|D|NEB||
|---|---|---|---|---|---|
||3 PINS||8 PINS|3 PINS||

(1) (2) THERMAL METRIC LM35 UNIT

|||MIN|MAX|UNIT|
|---|---|---|---|---|
||LM35, LM35A|–55|150||
|Specified operating temperature: TMIN to TMAX|LM35C, LM35CA|–40|110|°C|
||LM35D|0|100||
|Supply Voltage (+VS)||4|30|V|

RθJAJunction-to-ambient thermal resistance 400 180 220 90 °C/W <u>RθJC(top)</u>Junction-to-case (top) thermal resistance 24 — — —

(1) For more information about traditional and new thermal metrics, see the *IC Package Thermal Metrics* application report, SPRA953.
(2) For additional thermal resistance information, see *Typical Application*.
*Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated Product Folder Links: *LM35*
## LM35

**www.ti.com** SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017

# 6.5 Electrical Characteristics: LM35A, LM35CA Limits

Unless otherwise noted, these specifications apply: −55°C ≤ TJ ≤ 150°C for the LM35 and LM35A; −40°C ≤ TJ ≤ 110°C for the LM35C and LM35CA; and 0°C ≤ TJ ≤ 100°C for the LM35D. VS = 5 Vdc and ILOAD = 50 μA, in the circuit of Full-Range

|Centigrade Temperature|Sensor. These specifications|||also apply from 2°C to TMAX in the circuit of Figure 14.||||
|---|---|---|---|---|---|---|---|
||||LM35A||LM35CA|||
|PARAMETER|TEST CONDITIONS|TYP|TESTED (1) LIMIT|DESIGN (2) LIMIT|TYP TESTED LIMIT|(1) LIMIT|UNIT DESIGN (2)|

TA = 25°C ±0.2 ±0.5 ±0.2 ±0.5 TA = –10°C ±0.3 ±0.3 ±1

(3)
Accuracy °C TA = TMAX ±0.4 ±1 ±0.4 ±1 TA = TMIN ±0.4 ±1 ±0.4 ±1.5

(4)TMIN≤ ≤TAT≤ ≤TMAX

|Nonlinearity|T –40 °C ≤ ≤|TAT≤ ≤TMAX 125,°C|±0.18||±0.35|±0.15||±0.3 °C|
|---|---|---|---|---|---|---|---|---|
|Sensor gain|TMIN ≤ TA ≤ TMAX||10|9.9||10||9.9 mV/°C|
|(average slope)|–40°C ≤ TJ ≤ 125°C||10|10.1||10||10.1|
|Load regulation|TA = 25°C||±0.4|±1||±0.4|±1||
|0≤IL ≤ 1 mA|TMIN ≤ TA ≤ TMAX, –40°C ≤ TJ ≤ 125°C TA = 25°C||±0.5 ±0.01|±0.05|±3|±0.5 ±0.01|±0.05|±3 mV/mA|
|Line regulation|4V≤VS ≤ 30 V, –40°C ≤ TJ ≤ 125°C||±0.02||±0.1|±0.02||±0.1 mV/V|
||VS = 5 V, 25°C||56|67||56|67||
||VS = 5 V, –40°C ≤ TJ ≤ 125°C||105||131|91||114|
|Quiescent current||||||||µA|
||VS = 30 V, 25°C VS = 30 V, –40°C ≤ TJ ≤ 125°C||56.2 105.5|68|133|56.2 91.5|68|116|
|Change of quiescent|4V≤V|≤ 30 V, 25°C|0.2|1||0.2|1||
|current|4V≤VS ≤ 30 V, –40°C ≤ TJ ≤ 125°C||0.5||2|0.5||2 µA|
|Temperature|||||||||
|coefficient of quiescent current|–40°C ≤ TJ ≤ 125°C||0.39||0.5|0.39||0.5 µA/°C|
|Minimum temperature for rate accuracy|In circuit of Figure 14, I||1.5||2|1.5||2 °C|
|Long term stability|TJ = TMAX, for 1000 hours||±0.08|||±0.08||°C|

J

(5)
(5)
(6) S
(5)
L= 0

(1) Tested Limits are ensured and 100% tested in production.
(2) Design Limits are ensured (but not 100% production tested) over the indicated temperature and supply voltage ranges. These limits are not used to calculate outgoing quality levels.
(3) Accuracy is defined as the error between the output voltage and 10 mv/°C times the case temperature of the device, at specified conditions of voltage, current, and temperature (expressed in °C).
(4) Non-linearity is defined as the deviation of the output-voltage-versus-temperature curve from the best-fit straight line, over the rated temperature range of the device.
(5) Regulation is measured at constant junction temperature, using pulse testing with a low duty cycle. Changes in output due to heating effects can be computed by multiplying the internal dissipation by the thermal resistance.
(6) Quiescent current is defined in the circuit of Figure 14.
Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback*

Product Folder Links: *LM35*
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

# 6.6 Electrical Characteristics: LM35A, LM35CA

Unless otherwise noted, these specifications apply: −55°C ≤ TJ ≤ 150°C for the LM35 and LM35A; −40°C ≤ TJ ≤ 110°C for the LM35C and LM35CA; and 0°C ≤ TJ ≤ 100°C for the LM35D. VS = 5 Vdc and ILOAD = 50 μA, in the circuit of Full-Range

|Centigrade Temperature||Sensor. These specifications also apply from 2°C to TMAX in the circuit of Figure 14.||||
|---|---|---|---|---|---|
|||LM35A||LM35CA||
|PARAMETER|TEST CONDITIONS|MIN TYP|MAX TYP|TYP|UNIT MAX|

±0.2 ±0.2

(2)
TA = 25°C Tested Limit ±0.5 ±0.5

(3)
Design Limit ±0.3 ±0.3

(2)
TA = –10°C Tested Limit

(3)
Design Limit ±1

(1)
Accuracy °C ±0.4 ±0.4

(2)
TA = TMAX Tested Limit ±1 ±1

(3)
Design Limit ±0.4 ±0.4

(2)
TA = TMIN Tested Limit ±1

(3)
Design Limit ±1.5 ±0.18 ±0.15

(4)TMIN≤ ≤TAT≤ ≤TMAX(2)
Nonlinearity Tested Limit °C –40°CJ125,°C

(3)
Design Limit ±0.35 ±0.3 10 10

(2)
TMIN ≤ TA ≤ TMAX Tested Limit 9.9

(3)
Sensor gain Design Limit 9.9 mV/°C (average slope) 10 10

(2)
–40°C ≤ TJ ≤ 125°C Tested Limit 10.1

(3)
Design Limit 10.1 ±0.4 ±0.4

(2)
TA = 25°C Tested Limit ±1 ±1

(5)Design Limit(3)
Load regulation mV/mA 0≤IL ≤ 1 mA ±0.5 ±0.5 TMIN ≤ TA ≤ TMAX,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Design Limit ±3 ±3 ±0.01 ±0.01

(2)
TA = 25°C Tested Limit ±0.05 ±0.05

(3)
Design Limit

(5)
Line regulation mV/V ±0.02 ±0.02 4V≤VS ≤ 30 V,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Design Limit ±0.1 ±0.1

(1) Accuracy is defined as the error between the output voltage and 10 mv/°C times the case temperature of the device, at specified conditions of voltage, current, and temperature (expressed in °C).
(2) Tested Limits are ensured and 100% tested in production.
(3) Design Limits are ensured (but not 100% production tested) over the indicated temperature and supply voltage ranges. These limits are not used to calculate outgoing quality levels.
(4) Non-linearity is defined as the deviation of the output-voltage-versus-temperature curve from the best-fit straight line, over the rated temperature range of the device.
(5) Regulation is measured at constant junction temperature, using pulse testing with a low duty cycle. Changes in output due to heating effects can be computed by multiplying the internal dissipation by the thermal resistance. *Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated
Product Folder Links: *LM35*
## LM35

**www.ti.com** SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017

# Electrical Characteristics: LM35A, LM35CA (continued)

Unless otherwise noted, these specifications apply: −55°C ≤ TJ ≤ 150°C for the LM35 and LM35A; −40°C ≤ TJ ≤ 110°C for the LM35C and LM35CA; and 0°C ≤ TJ ≤ 100°C for the LM35D. VS = 5 Vdc and ILOAD = 50 μA, in the circuit of Full-Range Centigrade Temperature Sensor. These <u>specifications also apply from 2°C to TMAX in the circuit of Figure 14.</u>

|LM35A||LM35CA||
|---|---|---|---|
||||UNIT|
|TYP|MAX|TYP|MAX|
|56||56||
||67||67|
|105||91||
||131||114|
||||µA|
|56.2||56.2||
||68||68|
|105.5||91.5||
||133||116|
|0.2||0.2||
||1||1|
||||µA|
|0.5||0.5||
||2||2|
|0.39||0.39|µA/°C|
||0.5||0.5|
|1.5||1.5||
||||°C|
||2||2|
|±0.08||±0.08|°C|

**PARAMETER TEST CONDITIONS** **MIN TYP**

(2)
VS = 5 V, 25°C Tested Limit

(3)
Design Limit

VS = 5 V,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Quiescent Design Limit

(6)
current

(2)
VS = 30 V, 25°C Tested Limit

(3)
Design Limit

VS = 30 V,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Design Limit

(2)
4V≤VS ≤ 30 V, 25°C Tested Limit Change of Design Limit(3) quiescent

(5)
current 4V≤VS ≤ 30 V,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Design Limit

Temperature

(2)
coefficient of –40°C ≤ TJ ≤ 125°C Tested Limit quiescent current (3) Design Limit

Minimum In circuit of Figure 14, IL= Tested Limit(2) temperature for 0 rate accuracy (3) Design Limit Long term T = T, for 1000 hours stabilityJ MAX

(6) Quiescent current is defined in the circuit of Figure 14.
Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback*

Product Folder Links: *LM35*
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

# 6.7 Electrical Characteristics: LM35, LM35C, LM35D Limits

Unless otherwise noted, these specifications apply: −55°C ≤ TJ ≤ 150°C for the LM35 and LM35A; −40°C ≤ TJ ≤ 110°C for the LM35C and LM35CA; and 0°C ≤ TJ ≤ 100°C for the LM35D. VS = 5 Vdc and ILOAD = 50 μA, in the circuit of Full-Range

|Centigrade Temperature|Sensor. These specifications|||also apply from 2°C to TMAX in the circuit of Figure 14.||||
|---|---|---|---|---|---|---|---|
||||LM35||LM35C, LM35D|||
|PARAMETER|TEST CONDITIONS|TYP|TESTED (1) LIMIT|DESIGN (2) LIMIT|TYP TESTED LIMIT|(1) LIMIT|UNIT DESIGN (2)|

TA = 25°C ±0.4 ±1 ±0.4 ±1 Accuracy, LM35, TA = –10°C ±0.5 ±0.5 ±1.5

(3)°C
LM35C TA = TMAX ±0.8 ±1.5 ±0.8 ±1.5

TA = TMIN ±0.8 ±1.5 ±0.8 ±2 TA = 25°C ±0.6 ±1.5

(3)
Accuracy, LM35D TA = TMAX ±0.9 ±2 °C TA = TMIN ±0.9 ±2

(4)TMIN≤ ≤TAT≤ ≤TMAX
Nonlinearity ±0.3 ±0.5 ±0.2 ±0.5 °C –40°CJ125,°C TMIN ≤ TA ≤ TMAX, Sensor gain –40°C ≤ TJ ≤ 125°C 10 9.8 10 9.8 mV/°C (average slope) 10 10.2 10 10.2 TA= 25°C ±0.4 ±2 ±0.4 ±2

(5)
Load regulation mV/mA 0≤IL ≤ 1 mA TMIN ≤ TA ≤ TMAX, ±0.5 ±5 ±0.5 ±5 –40°C ≤ TJ ≤ 125°C TA = 25°C ±0.01 ±0.1 ±0.01 ±0.1

(5)
Line regulation 4V≤VS ≤ 30 V, mV/V ±0.02 ±0.2 ±0.02 ±0.2 –40°C ≤ TJ ≤ 125°C VS = 5 V, 25°C 56 80 56 80 VS= 5 V, –40°C ≤ TJ≤ 125°C 105 158 91 138

(6)
Quiescent current µA VS = 30 V, 25°C 56.2 82 56.2 82 VS = 30 V, –40°C ≤ TJ ≤ 125°C 105.5 161 91.5 141 4V≤VS ≤ 30 V, 25°C 0.2 2 0.2 2 Change of quiescent

(5) 4V≤VS ≤ 30 V, µA
current 0.5 3 0.5 **3** –40°C ≤ TJ ≤ 125°C Temperature coefficient of –40°C ≤ TJ ≤ 125°C 0.39 0.7 0.39 0.7 µA/°C quiescent current Minimum temperature In circuit of Figure 14, I = 0 1.5 2 1.5 2 °C for rate accuracyL Long term stability TJ = TMAX, for 1000 hours ±0.08 ±0.08 °C

(1) Tested Limits are ensured and 100% tested in production.
(2) Design Limits are ensured (but not 100% production tested) over the indicated temperature and supply voltage ranges. These limits are not used to calculate outgoing quality levels.
(3) Accuracy is defined as the error between the output voltage and 10 mv/°C times the case temperature of the device, at specified conditions of voltage, current, and temperature (expressed in °C).
(4) Non-linearity is defined as the deviation of the output-voltage-versus-temperature curve from the best-fit straight line, over the rated temperature range of the device.
(5) Regulation is measured at constant junction temperature, using pulse testing with a low duty cycle. Changes in output due to heating effects can be computed by multiplying the internal dissipation by the thermal resistance.
(6) Quiescent current is defined in the circuit of Figure 14.
*Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated

Product Folder Links: *LM35*
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

# 6.8 Electrical Characteristics: LM35, LM35C, LM35D

Unless otherwise noted, these specifications apply: −55°C ≤ TJ ≤ 150°C for the LM35 and LM35A; −40°C ≤ TJ ≤ 110°C for the LM35C and LM35CA; and 0°C ≤ TJ ≤ 100°C for the LM35D. VS = 5 Vdc and ILOAD = 50 μA, in the circuit of Full-Range

|Centigrade Temperature||Sensor. These specifications also apply from 2°C to TMAX in the circuit of Figure 14.||||
|---|---|---|---|---|---|
|||LM35||LM35C, LM35D||
|PARAMETER|TEST CONDITIONS|MIN TYP|MAX MIN|TYP|UNIT MAX|

±0.4 TA = 25°C ±1

±0.5 TA = –10°C Accuracy, LM35,

(1)
LM35C ±0.8 TA = TMAX ±1.5

±0.8 TA = TMIN ±1.5

TA = 25°C

Accuracy, T = T

(1) A MAX
LM35D

TA = TMIN

Nonlinearity

(4)T –40 MIN °C ≤ ≤TAT≤ ≤TMAX
125,°C J

TMIN ≤ TA ≤ TMAX, –40°C ≤ TJ ≤ 125°C Sensor gain (average slope)

Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
(3)
Design Limit

Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
Tested Limit

(2)
Design Limit

(3)
±0.3

±0.5 10

9.8
10

10.2
±0.4 ±2

±0.5

±5

±0.4 ±1

±0.5

±1.5 °C ±0.8

±1.5 ±0.8

±2 ±0.6 ±1.5

±0.9 °C ±2 ±0.9

±2 ±0.2 °C ±0.5 10

9.8 mV/°C
10

10.2
±0.4 ±2

mV/mA ±0.5

±5

TA = 25°C

(5)
Load regulation 0≤IL ≤ 1 mA TMIN ≤ TA ≤ TMAX, –40°C ≤ TJ ≤ 125°C

temperature range of the device.

Product Folder Links: *LM35*

(1) Accuracy is defined as the error between the output voltage and 10 mv/°C times the case temperature of the device, at specified conditions of voltage, current, and temperature (expressed in °C).
(2) Tested Limits are ensured and 100% tested in production.
(3) Design Limits are ensured (but not 100% production tested) over the indicated temperature and supply voltage ranges. These limits are not used to calculate outgoing quality levels.
(4) Non-linearity is defined as the deviation of the output-voltage-versus-temperature curve from the best-fit straight line, over the rated
(5) Regulation is measured at constant junction temperature, using pulse testing with a low duty cycle. Changes in output due to heating effects can be computed by multiplying the internal dissipation by the thermal resistance. Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback*
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

# Electrical Characteristics: LM35, LM35C, LM35D (continued)

Unless otherwise noted, these specifications apply: −55°C ≤ TJ ≤ 150°C for the LM35 and LM35A; −40°C ≤ TJ ≤ 110°C for the LM35C and LM35CA; and 0°C ≤ TJ ≤ 100°C for the LM35D. VS = 5 Vdc and ILOAD = 50 μA, in the circuit of Full-Range

||Centigrade Temperature Sensor. These|specifications also apply from 2°C to TMAX in the circuit of Figure 14.||||
|---|---|---|---|---|---|
|||LM35||LM35C, LM35D||
|PARAMETER|TEST CONDITIONS|MIN TYP|MAX MIN|TYP|UNIT MAX|

±0.01 ±0.01

(2)
TA = 25°C Tested Limit ±0.1

(3)
Design Limit ±0.1

(5)
Line regulation mV/V ±0.02 ±0.02 4V≤VS ≤ 30 V,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Design Limit ±0.2 ±0.2 56 56

(2)
VS = 5 V, 25°C Tested Limit 80 80

(3)
Design Limit 105 91 VS = 5 V, –40°C ≤ TJ ≤(2) Tested Limit 125°C

(3)
Quiescent Design Limit 158 138

(6)µA
current 56.2 56.2

(2)
VS = 30 V, 25°C Tested Limit 82 82

(3)
Design Limit

105.5 91.5
VS = 30 V,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Design Limit 161 141

0.2 0.2
(2)
4V≤VS ≤ 30 V, 25°C Tested Limit 2 Change of Design Limit(3)2 quiescent µA

(5) 0.5 0.5
current 4V≤VS ≤ 30 V,(2) Tested Limit –40°C ≤ TJ ≤ 125°C

(3)
Design Limit 3 3

0.39 0.39
Temperature

(2)
coefficient of –40°C ≤ TJ ≤ 125°C Tested Limit µA/°C quiescent current (3) Design Limit 0.7 0.7

1.5 1.5
Minimum

(2)
temperature for In circuit of Figure 14, IL = 0 Tested Limit °C rate accuracy (3) Design Limit 2 2 Long term ±0.08 ±0.08 T = T, for 1000 hours °C stabilityJ MAX

(6) Quiescent current is defined in the circuit of Figure 14.
*Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated

Product Folder Links: *LM35*
## LM35

**www.ti.com** SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017

|6.9 Typical Characteristics||
|---|---|
|400 ƒC/W) 300 200 T0-46 100 T0-92 THERMAL RESISTANCE (0 0 400 800 1200 1600 2000 AIR VELOCITY (FPM) Figure 1. Thermal Resistance Junction To Air|45 40 35 30 25 20 T0-46 15 TIME CONSTANT (SEC) 10 5 T0-92 0 0 400 800 1200 1600 2000 AIR VELOCITY (FPM) Figure 2. Thermal Time Constant|
|120 100 80 60 40 20 0 PERCENT OF FINAL VALUE (%) ±20 0 2 4 6 8 TIME (MINUTES) Figure 3. Thermal Response In Still Air|120 100 80 T0-46 60 T0-92 40 20 0 PERCENT OF FINAL VALUE (%) ±20 0 2 4 6 8 TIME (SEC) Figure 4. Thermal Response In Stirred Oil Bath|
|4.4 4.2 TYPICAL IOUT = 2.0 mA 4.0 3.8 3.6 3.4 TYPICAL 3.2 IOUT = 1.0 mA 3.0 SUPPLY VOLTAGE (V) TYPICAL 2.8 I = 0 A or 50 A OUT 2.6 2.4 25 75 125 175 ±75 ±25 TEMPERATURE (ƒC) Figure 5. Minimum Supply Voltage vs Temperature|160 140 A) 120 100 80 60 40 QUIESCENT CURRENT (20 0 25 75 125 175 ±75 ±25 TEMPERATURE (ƒC) Figure 6. Quiescent Current vs Temperature (in Circuit of Figure 14)|

Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback* Product Folder Links: *LM35*
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

|Typical Characteristics (continued)||
|---|---|
|200 180 A) 160 140 120 100 80 QUIESCENT CURRENT (60 40 25 75 125 175 ±75 ±25 TEMPERATURE (ƒC) Figure 7. Quiescent Current vs Temperature (in Circuit of Full-Range Centigrade Temperature Sensor)|2.0 LM35 1.5 ƒC) 1.0 0.5 LM35A TYPICAL 0.0 ±0.5 LM35A ±1.0 TEMPERATURE ERROR (±1.5 LM35 ±2.0 25 75 125 175 ±75 ±25 TEMPERATURE (ƒC) Figure 8. Accuracy vs Temperature (Ensured)|
|2.5 LM35D 2.0 LM35C 1.5 ƒC) 1.0 LM35CA 0.5 TYPICAL 0.0 ±0.5 LM35CA ±1.0 LM35C ±1.5 TEMPERATURE ERROR (±2.0 ±2.5 25 75 125 175 ±75 ±25 TEMPERATURE (ƒC) Figure 9. Accuracy vs Temperature (Ensured)|1600 1400 1200 1000 Hz) 800 600 Noise (nV/ 400 200 0 10 100 1k 10k 100k FREQUENCY (Hz) Figure 10. Noise Voltage|
|6 4 (V) IN V 2 0 0.6 0.4 (V) 0.2 OUT V 0 0 10|20 30 40 50 60 TIME (SEC) Figure 11. Start-Up Response|

*Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated Product Folder Links: *LM35*
## LM35

<u>www.ti.com SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017</u>

# 7 Detailed Description

## 7.1 Overview

The LM35-series devices are precision integrated-circuit temperature sensors, with an output voltage linearly proportional to the Centigrade temperature. The LM35 device has an advantage over linear temperature sensors calibrated in Kelvin, as the user is not required to subtract a large constant voltage from the output to obtain convenient Centigrade scaling. The LM35 device does not require any external calibration or trimming to provide typical accuracies of ± ¼ °C at room temperature and ± ¾ °C over a full −55°C to 150°C temperature range. Lower cost is assured by trimming and calibration at the wafer level. The low output impedance, linear output, and precise inherent calibration of the LM35 device makes interfacing to readout or control circuitry especially easy. The device is used with single power supplies, or with plus and minus supplies. As the LM35 device draws only 60 μA from the supply, it has very low self-heating of less than 0.1°C in still air. The LM35 device is rated to operate over a −55°C to 150°C temperature range, while the LM35C device is rated for a −40°C to 110°C range (−10° with improved accuracy). The temperature-sensing element is comprised of a delta-V BE architecture. The temperature-sensing element is then buffered by an amplifier and provided to the VOUT pin. The amplifier has a simple class A output stage with typical 0.5-Ω output impedance as shown in the *Functional Block* *Diagram*. Therefore the LM35 can only source current and it's sinking capability is limited to 1 μA.

## 7.2 Functional Block Diagram

A1

1.38 VPTAT
+VS

nR1 Q1 Q2 + A2 10E E VOUT = 10 mV/°C V₀

.125 R2
nR1

8.8 mV/°C i
R2

## 7.3 Feature Description

## 7.3.1 LM35 Transfer Function

The accuracy specifications of the LM35 are given with respect to a simple linear transfer function: VOUT = 10 mv/°C × T

where

- VOUT is the LM35 output voltage
- T is the temperature in °C (1)
## 7.4 Device Functional Modes

The only functional mode of the LM35 is that it has an analog output directly proportional to temperature.

Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback* Product Folder Links: *LM35*
## LM35

SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 **www.ti.com**

# 8 Application and Implementation

## NOTE

Information in the following applications sections is not part of the TI component specification, and TI does not warrant its accuracy or completeness. TI’s customers are responsible for determining suitability of components for their purposes. Customers should validate and test their design implementation to confirm system functionality.

## 8.1 Application Information

The features of the LM35 make it suitable for many general temperature sensing applications. Multiple package options expand on it's flexibility.

## 8.1.1 Capacitive Drive Capability

Like most micropower circuits, the LM35 device has a limited ability to drive heavy capacitive loads. Alone, the LM35 device is able to drive 50 pF without special precautions. If heavier loads are anticipated, isolating or decoupling the load with a resistor is easy (see Figure 12). The tolerance of capacitance can be improved with a series R-C damper from output to ground (see Figure 13).

When the LM35 device is applied with a 200-Ω load resistor as shown in Figure 16, Figure 17, or Figure 19, the device is relatively immune to wiring capacitance because the capacitance forms a bypass from ground to input and not on the output. However, as with any linear circuit connected to wires in a hostile environment, performance is affected adversely by intense electromagnetic sources (such as relays, radio transmitters, motors with arcing brushes, and SCR transients), because the wiring acts as a receiving antenna and the internal junctions act as rectifiers. For best results in such cases, a bypass capacitor from VIN to ground and a series R-C damper, such as 75 Ω in series with 0.2 or 1 μF from output to ground, are often useful. Examples are shown in

Figure 13, Figure 24, and Figure 25.

+ HEAVY CAPACITIVE LOAD, WIRING, ETC.

2 k LM35 TO A HIGH-IMPEDANCE LOAD OUT v

**Figure 12. LM35 with Decoupling from Capacitive Load**

||+|HEAVY CAPACITIVE LOAD, WIRING, ETC.|
|---|---|---|
||LM35 OUT||
|0.01 PF BYPASS|||
|OPTONAL|v|75|
|||1 PF|

TO A HIGH-IMPEDANCE LOAD

**Figure 13. LM35 with R-C Damper**

*Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated Product Folder Links: *LM35*
## LM35

<u>www.ti.com SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017</u>

|Basic Centigrade Temperature Sensor +VS (4 V to 20 V) LM35 Figure 14. Table 1. Design Parameters|OUTPUT 0 mV + 10.0 mV/°C Basic Centigrade Temperature Sensor (2 °C to 150 °C)|
|---|---|
|PARAMETER|VALUE|
|Accuracy at 25°C|±0.5°C|
|Accuracy from –55 °C to 150°C|±1°C|
|Temperature Slope|10 mV/°C|
|Because the LM35 device is a simple temperature sensor that provides an analog output, design requirements related to layout are more important than electrical requirements. For a detailed description, refer to the 2.0 1.5 ƒC) 1.0 0.5 TYPICAL 0.0 ±0.5 ±1.0 TEMPERATURE ERROR (±1.5 ±2.0 25 ±75 ±25 Figure 15.|LM35 LM35A LM35A LM35 75 125 175 TEMPERATURE (ƒC) Accuracy vs Temperature (Ensured)|

# 8.2 Typical Application 8.2.1

## 8.2.1.1 Design Requirements

## 8.2.1.2 Detailed Design Procedure

*Layout*.

## 8.2.1.3 Application Curve

Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback* Product Folder Links: *LM35*
### LM35

<u>SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 www.ti.com</u>

## 8.3 System Examples

### 5 V 5 V

+ + OUT HEAT LM35 VOUT = 10 mV/°C (TAMBIENT = 1 °C) FINS TWISTED PAIR

6.8 k 200 FROM + 2 °C TO + 40 °C v 200 5% 1% 1% v VOUT = 10 mV/°C (TAMBIENT = 1 °C)
FROM + 2 °C TO + 40 °C +

6.8 k
### OUT 5%

200 HEAT LM35 FINS TWISTED PAIR OR 10K RHEOSTAT 1% v 200 FOR GAIN ADJUST 1%

**Figure 16. Two-Wire Remote Temperature Sensor Figure 17. Two-Wire Remote Temperature Sensor**

### (Grounded Sensor) (Output Referred to Ground)

# +VS+

5 V

0.01 PF
LM35 OUT

BYPASS TWISTED PAIR OPTIONAL

# LM35 +

2 k 1% 200 1% VOUT = 10 mV/°C (TAMBIENT = 10 °C)

# VOUTFROM t 5 °C TO + 40 °C

2 k 200

# v1% 1% 1N914

# 18 k 10%

**Figure 18. Temperature Sensor, Single Supply Figure 19. Two-Wire Remote Temperature Sensor**

### (−55° to +150°C) (Output Referred to Ground)

*Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated

Product Folder Links: *LM35*
**LM35** <u>www.ti.com SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017</u>

**System Examples (continued)** +VS + 5 V TO + 30 V (6 V to 20 V)

4.7 k
2N2907 LM35 + IN

45.5 kO
OUT OUT LM35 LM317 1% v 402 ADJ 1%

62.5 10 kO
0.5% 1%
OFFSET ADJUST 50 VOUT = +1 mV/°F

26.4 kO 1%
LM385-1.2 18 kO 1 MO 1%

**Figure 20. 4-To-20 mA Current Source Figure 21. Fahrenheit Thermometer**

**(0°C to 100°C)** 5 V 9 V

1 k LM35 LM35 100 A, 60 mV FULL- SCALE

25.5 k
LM385-

2.5
**Figure 22. Centigrade Thermometer Figure 23. Fahrenheit Thermometer, Expanded**

**(Analog Meter) Scale Thermometer** **(50°F to 80°F, for Example Shown)**

Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback* Product Folder Links: *LM35*
<u>www.ti.com</u> **LM35** <u>SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017</u>

# System Examples (continued)

5 V + 3.9 k OUT IN LM35 REF ADC08031 SERIAL GND

1.28 V
DATA OUTPUT

75 100k + FB LM385 CLOCK + 1 PF 10 k ENABLE GND

**Figure 24. Temperature to Digital Converter**

## (Serial Output)

## (128°C Full Scale)

°F

20 k 7 V + 20 PF 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86

20 LEDs 18 10 18 10 LM3914 LM3914 1 2 3 4 5 6 7 8 9 1 2 3 4 5 6 7 8 9 7 V 7 V NC

1.2 k*
+ VA OUT HEAT LM35 FINS VC 499* 499* V B 200*

1.5 k* 1 k*
+ 1 PF

1.5 k* RCRB 1 k 1 k RA 1 k
5 V + 16 k OUT 8 PARALLEL LM35 IN DATA ADC0804 OUTPUT GND 75 INTR 1 k +

0.64 V VREF
+ CS 1 PF 2 k RD GND WR

**Figure 25. Temperature to Digital Converter**

## (Parallel TRI-STATE Outputs for Standard Data Bus to μP Interface)

## (128°C Full Scale)

6 V

6.8 k 1 k
f OUT 4N28 + 100 k 8 LM35 7 5 6 LM131 GND 3 1 2 4

0.01 PF 1 PF 12 k 0.01 PF 100 k FULL
SCALE ADJ 47 5 k LOW TEMPCO

## *=1% or 2% film resistor

Trim RB for VB = 3.075 V

Trim RC for VC = 1.955 V

Trim RA for VA = 0.075 V + 100 mV/°C ×Tambient

Example, VA = 2.275 V at 22°C

**Figure 26. Bar-Graph Temperature Display**

## (Dot Mode)

*Submit Documentation Feedback*

**Figure 27. LM35 With Voltage-To-Frequency**

## Converter and Isolated Output

## (2°C to 150°C; 20 to 1500 Hz)

Copyright © 1999–2017, Texas Instruments Incorporated *LM35* Product Folder Links:
## LM35

**www.ti.com** SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017

# 9 Power Supply Recommendations

The LM35 device has a very wide 4-V to 30-V power supply voltage range, which makes it ideal for many applications. In noisy environments, TI recommends adding a 0.1 μF from V+ to GND to bypass the power supply voltage. Larger capacitances maybe required and are dependent on the power-supply noise.

# 10 Layout

## 10.1 Layout Guidelines

The LM35 is easily applied in the same way as other integrated-circuit temperature sensors. Glue or cement the device to a surface and the temperature should be within about 0.01°C of the surface temperature.

The 0.01°C proximity presumes that the ambient air temperature is almost the same as the surface temperature. If the air temperature were much higher or lower than the surface temperature, the actual temperature of the LM35 die would be at an intermediate temperature between the surface temperature and the air temperature; this is especially true for the TO-92 plastic package. The copper leads in the TO-92 package are the principal thermal path to carry heat into the device, so its temperature might be closer to the air temperature than to the surface temperature.

Ensure that the wiring leaving the LM35 device is held at the same temperature as the surface of interest to minimize the temperature problem. The easiest fix is to cover up these wires with a bead of epoxy. The epoxy bead will ensure that the leads and wires are all at the same temperature as the surface, and that the temperature of the LM35 die is not affected by the air temperature.

The TO-46 metal package can also be soldered to a metal surface or pipe without damage. Of course, in that case the V− terminal of the circuit will be grounded to that metal. Alternatively, mount the LM35 inside a sealed- end metal tube, and then dip into a bath or screw into a threaded hole in a tank. As with any IC, the LM35 device and accompanying wiring and circuits must be kept insulated and dry, to avoid leakage and corrosion. This is especially true if the circuit may operate at cold temperatures where condensation can occur. Printed-circuit coatings and varnishes such as a conformal coating and epoxy paints or dips are often used to insure that moisture cannot corrode the LM35 device or its connections.

These devices are sometimes soldered to a small light-weight heat fin to decrease the thermal time constant and speed up the response in slowly-moving air. On the other hand, a small thermal mass may be added to the sensor, to give the steadiest reading despite small deviations in the air temperature.

||Table 2. Temperature Rise of||LM35 Due To|Self-heating (Thermal||Resistance, R θ JA|)|
|---|---|---|---|---|---|---|---|
|||(1)||(2)||(2) SOIC-8||
||TO, no heat sink|TO, small heat fin|TO-92, no heat sink|TO-92, small heat fin|SOIC-8, no heat sink|small heat, fin|TO-220, no heat sink|

|Still air|400°C/W|100°C/W|180°C/W|140°C/W|220°C/W|110°C/W|90°C/W|
|---|---|---|---|---|---|---|---|
|Moving air|100°C/W|40°C/W|90°C/W|70°C/W|105°C/W|90°C/W|26°C/W|
|Still oil|100°C/W|40°C/W|90°C/W|70°C/W|—|—|—|
|Stirred oil (Clamped to|50°C/W|30°C/W|45°C/W|40°C/W|—|—|—|
|metal, Infinite heat sink)|||—|—|(55°C/W)||—|

(1) Wakefield type 201, or 1-in disc of 0.02-in sheet brass, soldered to case, or similar.
(2) TO-92 and SOIC-8 packages glued and leads soldered to 1-in square of 1/16-in printed circuit board with 2-oz foil or similar.

(24°C/W)

Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback* Product Folder Links: *LM35*
## LM35

<u>SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017 www.ti.com</u>

# 10.2 Layout Example

VIA to ground plane

## VIA to power plane

|VOUT|+VS|
|---|---|
|N.C.|N.C.|
|N.C.|N.C.|
|GND|N.C.|

0.01 µF
**Figure 28. Layout Example**

*Submit Documentation Feedback* Copyright © 1999–2017, Texas Instruments Incorporated Product Folder Links: *LM35*
## LM35

<u>www.ti.com SNIS159H – AUGUST 1999 – REVISED DECEMBER 2017</u>

# 11 Device and Documentation Support

## 11.1 Receiving Notification of Documentation Updates

To receive notification of documentation updates, navigate to the device product folder on ti.com. In the upper right corner, click on A*lert me* to register and receive a weekly digest of any product information that has changed. For change details, review the revision history included in any revised document

## 11.2 Community Resources

The following links connect to TI community resources. Linked contents are provided "AS IS" by the respective contributors. They do not constitute TI specifications and do not necessarily reflect TI's views; see TI's Terms of Use. **TI E2E™ Online Community *TI's Engineer-to-Engineer (E2E) Community.*** Created to foster collaboration among engineers. At e2e.ti.com, you can ask questions, share knowledge, explore ideas and help solve problems with fellow engineers. **Design Support *TI's Design Support*** Quickly find helpful E2E forums along with design support tools and contact information for technical support.

## 11.3 Trademarks

E2E is a trademark of Texas Instruments. All other trademarks are the property of their respective owners.

## 11.4 Electrostatic Discharge Caution

These devices have limited built-in ESD protection. The leads should be shorted together or the device placed in conductive foam during storage or handling to prevent electrostatic damage to the MOS gates.

## 11.5 Glossary

SLYZ022 — *TI Glossary*. This glossary lists and explains terms, acronyms, and definitions.

# 12 Mechanical, Packaging, and Orderable Information

The following pages include mechanical, packaging, and orderable information. This information is the most current data available for the designated devices. This data is subject to change without notice and revision of this document. For browser-based versions of this data sheet, refer to the left-hand navigation.

Copyright © 1999–2017, Texas Instruments Incorporated *Submit Documentation Feedback* Product Folder Links: *LM35*
# PACKAGE OPTION ADDENDUM

www.ti.com 18-Sep-2026

## PACKAGING INFORMATION

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking||
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow|||(6)|
|||||||(4)|||||
|LM35AH|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35CAH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|
|LM35CZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking||
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow|||(6)|
|||||||(4)|||||
|LM35AH|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35CAH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|
|LM35CZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking||
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow|||(6)|
|||||||(4)|||||
|LM35AH|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35CAH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|
|LM35CZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking||
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow|||(6)|
|||||||(4)|||||
|LM35AH|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35CAH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|
|LM35CZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking||
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow|||(6)|
|||||||(4)|||||
|LM35AH|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35AH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35AH, LM35AH)||
|LM35CAH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CAH, LM35CAH||
|||||||||||)|
|LM35CAZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CAZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CAZ|
|LM35CH|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH.B|Active|Production|TO (NDV) | 3|500 | OTHER|No|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CH/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-40 to 110|( LM35CH, LM35CH)||
|LM35CZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150||LM35|
|||||||||||CZ|
|LM35CZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|
|LM35CZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|-40 to 110||LM35|
|||||||||||CZ|

(5)
Addendum-Page 1
## PACKAGE OPTION ADDENDUM

www.ti.com 18-Sep-2026

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow||(6)|
|||||||(4)||||
|LM35DH|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DMX|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX.B|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB.B|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DT|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT.B|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB.B|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35DZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35H|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow||(6)|
|||||||(4)||||
|LM35DH|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DMX|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX.B|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB.B|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DT|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT.B|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB.B|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35DZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35H|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow||(6)|
|||||||(4)||||
|LM35DH|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DMX|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX.B|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB.B|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DT|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT.B|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB.B|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35DZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35H|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow||(6)|
|||||||(4)||||
|LM35DH|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DMX|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX.B|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB.B|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DT|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT.B|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB.B|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35DZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35H|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/|Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material|Peak reflow||(6)|
|||||||(4)||||
|LM35DH|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DH/NOPB.B|Active|Production|TO (NDV) | 3|1000 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|0 to 70|( LM35DH, LM35DH)|
|LM35DMX|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX.B|NRND|Production|SOIC (D) | 8|2500 | LARGE T&R|No|SNPB|Level-1-235C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DMX/NOPB.B|Active|Production|SOIC (D) | 8|2500 | LARGE T&R|Yes|SN|Level-1-260C-UNLIM|0 to 100|LM35D|
||||||||||M|
|LM35DT|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT.B|NRND|Production|TO-220 (NEB) | 3|45 | TUBE|No|SNPB|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DT/NOPB.B|Active|Production|TO-220 (NEB) | 3|45 | TUBE|Yes|SN|Level-1-NA-UNLIM|0 to 100|LM35DT|
|LM35DZ/LFT1|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT1.B|Active|Production|TO-92 (LP) | 3|2000 | LARGE T&R|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/LFT4.B|Active|Production|TO-92 (LP) | 3|2000 | AMMO|Yes|SN|N/A for Pkg Type|-55 to 150|LM35|
||||||||||DZ|
|LM35DZ/NOPB|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35DZ/NOPB.B|Active|Production|TO-92 (LP) | 3|1800 | BULK|Yes|SN|N/A for Pkg Type|0 to 100|LM35|
||||||||||DZ|
|LM35H|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|No|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|
|LM35H/NOPB.B|Active|Production|TO (NDV) | 3|500 | SMALL T&R|Yes|Call TI|Level-1-NA-UNLIM|-55 to 150|( LM35H, LM35H)|

(5)
**(1)** **Status:** For more details on status, see our product life cycle.
Addendum-Page 2
## PACKAGE OPTION ADDENDUM

www.ti.com 18-Sep-2026

**(2)** **Material type:** When designated, preproduction parts are prototypes/experimental devices, and are not yet approved or released for full production. Testing and final process, including without limitation quality assurance, reliability performance testing, and/or process qualification, may not yet be complete, and this item is subject to further changes or possible discontinuation. If available for ordering, purchases will be subject to an additional waiver at checkout, and are intended for early internal evaluation purposes only. These items are sold without warranties of any kind.
**(3)** **RoHS values:** Yes, No, RoHS Exempt. See the TI RoHS Statement for additional information and value definition.
**(4)** **Lead finish/Ball material:** Parts may have multiple material finish options. Finish options are separated by a vertical ruled line. Lead finish/Ball material values may wrap to two lines if the finish value exceeds the maximum column width.
**(5)** **MSL rating/Peak reflow:** The moisture sensitivity level ratings and peak solder (reflow) temperatures. In the event that a part has multiple moisture sensitivity ratings, only the lowest level per JEDEC standards is shown. Refer to the shipping label for the actual reflow temperature that will be used to mount the part to the printed circuit board.
**(6)** **Part marking:** There may be an additional marking, which relates to the logo, the lot trace code information, or the environmental category of the part. Multiple part markings will be inside parentheses. Only one part marking contained in parentheses and separated by a "~" will appear on a part. If a line is indented then it is a continuation of the previous line and the two combined represent the entire part marking for that device. **Important Information and Disclaimer:** The information provided on this page represents TI's knowledge and belief as of the date that it is provided. TI bases its knowledge and belief on information provided by third parties, and makes no representation or warranty as to the accuracy of such information. Efforts are underway to better integrate information from third parties. TI has taken and continues to take reasonable steps to provide representative and accurate information but may not have conducted destructive testing or chemical analysis on incoming materials and chemicals. TI and TI suppliers consider certain information to be proprietary, and thus CAS numbers and other limited information may not be available for release. In no event shall TI's liability arising out of such information exceed the total purchase price of the TI part(s) at issue in this document sold by TI to Customer on an annual basis.
Addendum-Page 3
# PACKAGE MATERIALS INFORMATION

www.ti.com 10-Nov-2026

## TAPE AND REEL INFORMATION

**REEL DIMENSIONS TAPE DIMENSIONS** K0 P1

W B0 Reel Diameter Cavity A0 A0 Dimension designed to accommodate the component width B0 Dimension designed to accommodate the component length K0 Dimension designed to accommodate the component thickness W Overall width of the carrier tape P1 Pitch between successive cavity centers

Reel Width (W1) **QUADRANT ASSIGNMENTS FOR PIN 1 ORIENTATION IN TAPE** Sprocket Holes

||Q1 Q2|Q1|Q2|||
|---|---|---|---|---|---|
||Q3 Q4|Q3|Q4|User Direction of Feed||

Pocket Quadrants

*All dimensions are nominal **Device Package Package Pins SPQ Reel Reel A0 B0 K0 P1 W Pin1** **Type Drawing Diameter Width (mm) (mm) (mm) (mm) (mm) Quadrant** **(mm) W1 (mm)** LM35DMX/NOPB SOIC D 8 2500 330.0 12.4 6.4 5.2 2.1 8.0 12.0 Q1

Pack Materials-Page 1
## PACKAGE MATERIALS INFORMATION

www.ti.com 10-Nov-2026 **TAPE AND REEL BOX DIMENSIONS**

***Width (mm)*** H

W L

*All dimensions are nominal **Device Package Type Package Drawing Pins SPQ Length (mm) Width (mm) Height (mm)**

|Device|Package Type|Pins|SPQ|Length (mm)|Width (mm)|Height (mm)|
|---|---|---|---|---|---|---|
|LM35DMX/NOPB|SOIC|8|2500|367.0|367.0|35.0|

D

Pack Materials-Page 2
# PACKAGE MATERIALS INFORMATION

www.ti.com 10-Nov-2026 **TUBE** **T-Tube height L-Tube length**

## W-Tube width

## B-Alignment groove width

*All dimensions are nominal

|Device|Package Name|Package Type|Pins|SPQ|L (mm)|W (mm)|T (µm)|B (mm)|
|---|---|---|---|---|---|---|---|---|
|LM35DT|NEB|TO-220|3|45|502|33|6985|4.06|
|LM35DT|NEB|TO-220|3|45|502|33|6985|4.06|
|LM35DT.B|NEB|TO-220|3|45|502|33|6985|4.06|
|LM35DT.B|NEB|TO-220|3|45|502|33|6985|4.06|
|LM35DT/NOPB|NEB|TO-220|3|45|502|33|6985|4.06|
|LM35DT/NOPB.B|NEB|TO-220|3|45|502|33|6985|4.06|

**Device Package Name Package Type Pins SPQ L (mm) W (mm) T (µm) B (mm)**

Pack Materials-Page 3
## PACKAGE OUTLINE

# NDV0003H <u>TO-CAN - 2.67 mm max height</u>

SCALE 1.250 TRANSISTOR OUTLINE

4.95
4.55
0.76 MAX 2.67 MAX
UNCONTROLLED LEAD DIA

0.64 MAX (MIL/AERO)
1.397 MAX (COMMERCIAL)
3X

12.7 MIN
0.483
3X

0.407
5.32-5.56
2

1 3

45 ( 2.54)

1.16
0.92
1.22
0.72
4219876/B 09/2024

NOTES:

1. All linear dimensions are in millimeters. Any dimensions in parenthesis are for reference only. Dimensioning and tolerancing per ASME Y14.5M.
2. This drawing is subject to change without notice.
3. Reference JEDEC registration TO-46.
www.ti.com
## EXAMPLE BOARD LAYOUT

# NDV0003H <u>TO-CAN - 2.67 mm max height</u>

||||||TRANSISTOR OUTLINE|
|---|---|---|---|---|---|
||||(2.54)|||
|0.07 MAX ALL AROUND|||(|1.2) METAL|3 3X (0.7) VIA|
|SOLDER MASK OPENING|||||(1.27)|
|(R0.05) TYP|1||||2X (1.2)|
||0.07 MAX TYP||LAND PATTERN EXAMPLE NON-SOLDER MASK DEFINED SCALE:12X|2|METAL 2X SOLDER MASK OPENING 4219876/B 09/2024|

www.ti.com
## PACKAGE OUTLINE

# D0008A <u>SOIC - 1.75 mm max height</u>

SCALE 2.800 SMALL OUTLINE INTEGRATED CIRCUIT

<u>C</u>

SEATING PLANE

.228-.244 TYP [5.80-6.19]

||[5.80-6.19]||.004 [0.1]|C|
|---|---|---|---|---|
|A|PIN 1 ID AREA|6X .050 [1.27]|||
|1||8|||

.004 [0.1] C
2X

.189-.197 [4.81-5.00].150 NOTE 3 [3.81]
4X (0 -15 )

4 5 8X .012-.020

B.150-.157 [0.31-0.51]

||B|.150-.157|[0.31-0.51]||.069 MAX|
|---|---|---|---|---|---|
|||[3.81-3.98] NOTE 4|.010 [0.25]|C A B|[1.75]|

.069 MAX
.005-.010 TYP [0.13-0.25]
4X (0 -15 )

SEE DETAIL A

.010 <u>[0.25]</u>
.004-.010
0 - 8 [0.11-0.25]

.016-.050 [0.41-1.27]DETAIL A
(.041) TYPICAL [1.04]

4214825/C 02/2019

NOTES:

1. Linear dimensions are in inches [millimeters]. Dimensions in parenthesis are for reference only. Controlling dimensions are in inches. Dimensioning and tolerancing per ASME Y14.5M.
2. This drawing is subject to change without notice.
3. This dimension does not include mold flash, protrusions, or gate burrs. Mold flash, protrusions, or gate burrs shall not exceed .006 [0.15] per side.
4. This dimension does not include interlead flash.
5. Reference JEDEC registration MS-012, variation AA.
www.ti.com
## EXAMPLE BOARD LAYOUT

# D0008A <u>SOIC - 1.75 mm max height</u>

|||||||SMALL OUTLINE INTEGRATED CIRCUIT|
|---|---|---|---|---|---|---|
||8X (.061|) [1.55] 1|||SYMM|SEE DETAILS|
|||||||8|
||8X (.024) [0.6]|4||||SYMM (R.002) TYP [0.05] 5|
|6X (.050|) [1.27]||||||
|METAL||||SOLDER MASK OPENING|(.213) [5.4] LAND PATTERN EXAMPLE EXPOSED METAL SHOWN SCALE:8X SOLDER MASK OPENING|METAL UNDER SOLDER MASK|
|EXPOSED|||||EXPOSED||
|METAL|[0.07] NON SOLDER MASK DEFINED|.0028 MAX ALL AROUND|||METAL SOLDER MASK DETAILS|.0028 MIN [0.07] ALL AROUND SOLDER MASK DEFINED 4214825/C 02/2019|

NOTES: (continued) 6. Publication IPC-7351 may have alternate designs. 7. Solder mask tolerances between and around signal pads can vary based on board fabrication site.

www.ti.com
## EXAMPLE STENCIL DESIGN

# D0008A <u>SOIC - 1.75 mm max height</u>

|||||SMALL OUTLINE INTEGRATED CIRCUIT|
|---|---|---|---|---|
|8X (.061 [1.55]|) 1||SYMM||
|||||8|
|8X (.024)|||||
|[0.6]|4|||SYMM (R.002) TYP [0.05] 5|
|6X (.050) [1.27]|||(.213) [5.4] SOLDER PASTE EXAMPLE BASED ON .005 INCH [0.125 MM] THICK STENCIL SCALE:8X|4214825/C 02/2019|

NOTES: (continued) design recommendations. 9. Board assembly site may have different recommendations for stencil design. 8. Laser cutting apertures with trapezoidal walls and rounded corners may offer better paste release. IPC-7525 may have alternate

www.ti.com
## PACKAGE OUTLINE

# LP0003A <u>TO-92 - 5.34 mm max height</u>

SCALE 1.200 SCALE 1.200 TO-92

5.21
4.44
EJECTOR PIN OPTIONAL

5.34
4.32
(1.5) TYP

(2.54) SEATING 2X NOTE 3 PLANE 4 MAX (0.51) TYP 6X

0.076 MAX
SEATING PLANE 3X

12.7 MIN
0.43
3X 0.35

2.9 3X 0.55
2X 2.4 0.38 2X 1.27 0.13

FORMED LEAD OPTION OTHER DIMENSIONS IDENTICAL STRAIGHT LEAD OPTION TO STRAIGHT LEAD OPTION

|3X 2.67 2.03|||4.19|
|---|---|---|---|
||||3.17|
||3 2|1||

3.43 MIN
4215214/C 04/2025

NOTES:

1. All linear dimensions are in millimeters. Any dimensions in parenthesis are for reference only. Dimensioning and tolerancing per ASME Y14.5M.
2. This drawing is subject to change without notice.
3. Lead dimensions are not controlled within this area.
4. Reference JEDEC TO-226, variation AA.
5. Shipping method:
a. Straight lead option available in bulk pack only.
b. Formed lead option available in tape and reel or ammo pack.
c. Specific products can be offered in limited combinations of shipping medium and lead options.
d. Consult product folder for more information on available options.
www.ti.com
## EXAMPLE BOARD LAYOUT

# LP0003A <u>TO-92 - 5.34 mm max height</u>

||||||||||||TO-92|
|---|---|---|---|---|---|---|---|---|---|---|---|
||0.05 MAX ALL AROUND TYP (1.5)|||(1.07)||||FULL R TYP METAL TYP||3X (|0.85) HOLE 2X METAL 2X (1.5) 2X SOLDER MASK|
||(R0.05) TYP||||1|||2|3||OPENING|
||SOLDER MASK|||||(1.27)|||||2X (1.07)|
|0.05 MAX ALL AROUND TYP|OPENING (1.4)||||||(2.54) LAND PATTERN EXAMPLE STRAIGHT LEAD OPTION NON-SOLDER MASK DEFINED SCALE:15X||2X (1.4) METAL||3X (0.9) HOLE|
|METAL||||||||||||
|(R0.05) TYP|1||||||2||||2X 3 SOLDER MASK OPENING|
|SOLDER MASK||||(2.6)||||||||
|OPENING||||||(5.2)||LAND PATTERN EXAMPLE FORMED LEAD OPTION NON-SOLDER MASK DEFINED SCALE:15X|||4215214/C 04/2025|

www.ti.com
## TAPE SPECIFICATIONS

# LP0003A <u>TO-92 - 5.34 mm max height</u>

TO-92

13.7
11.7
32 23

|23|||
|---|---|---|
||(2.5) TYP|0.5 MIN|
|16.5|||
|15.5|||
||11.0|9.75|
||8.5|8.50|

19.0
17.5
3.7-4.3 TYP

|2.9|6.75|
|---|---|
|2.4 TYP|5.95|
||13.0|
||12.4|

### FOR FORMED LEAD OPTION PACKAGE

4215214/C 04/2025

www.ti.com
## PACKAGE OUTLINE

# NEB0003F

### <u>TO-220 - 19.65 mm max height</u>

TRANSISTOR OUTLINE

0.250
10.16 +0.38
0.178 -0.13
9.86-0.13 +0.38
4.70
4.45
85 -86 3.05

2.54
1.40
1.14
6.6
6.1
1.22
8.55
1.32
8.15
(6.3)

12.5
12.1
3.78-3.89
7

8.89
8.38
7

26.29
PIN# 1 ID 25.53

||1|3|||
|---|---|---|---|---|
|3X 1.40 1.22 3X 0.94 0.69||2X 2.29 2.79|0.38+0.18-0.03|2.67 +0.25-0.38|
||5.33||||
||4.83||||

NOTES:

reference only. Dimensioning and tolerancing per ASME Y14.5M.

2. This drawing is subject to change without notice.
3. Reference JEDEC registration TO-220.
0 -6

29.34
28.07
4.06
3.30
11.56
8.52
4215014/A 12/2017

1. All controlling linear dimensions are in inches. Dimensions in brackets are in millimeters. Any dimension in brackets or parenthesis are for
www.ti.com
## EXAMPLE BOARD LAYOUT

# NEB0003F <u>TO-220 - 19.65 mm max height</u>

|||||TRANSISTOR OUTLINE|
|---|---|---|---|---|
|0.07 MAX ALL AROUND|||2X (1.7) METAL 3X (1.2)|2X SOLDER MASK OPENING|
||(1.7)||||
|R (0.05)||1|2 3 (2.54)|0.07 MAX ALL AROUND|
|SOLDER MASK OPENING|||(5.08) LAND PATTERN EXAMPLE NON-SOLDER MASK DEFINED SCALE:15X|4215014/A 12/2017|

www.ti.com
## IMPORTANT NOTICE AND DISCLAIMER

TI PROVIDES TECHNICAL AND RELIABILITY DATA (INCLUDING DATASHEETS), DESIGN RESOURCES (INCLUDING REFERENCE DESIGNS), APPLICATION OR OTHER DESIGN ADVICE, WEB TOOLS, SAFETY INFORMATION, AND OTHER RESOURCES “AS IS” AND WITH ALL FAULTS, AND DISCLAIMS ALL WARRANTIES, EXPRESS AND IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT OF THIRD PARTY INTELLECTUAL PROPERTY RIGHTS. These resources are intended for skilled developers designing with TI products. You are solely responsible for (1) selecting the appropriate TI products for your application, (2) designing, validating and testing your application, and (3) ensuring your application meets applicable standards, and any other safety, security, regulatory or other requirements. These resources are subject to change without notice. TI grants you permission to use these resources only for development of an application that uses the TI products described in the resource. Other reproduction and display of these resources is prohibited. No license is granted to any other TI intellectual property right or to any third party intellectual property right. TI disclaims responsibility for, and you fully indemnify TI and its representatives against any claims, damages, costs, losses, and liabilities arising out of your use of these resources. TI’s products are provided subject to TI’s Terms of Sale, TI’s General Quality Guidelines, or other applicable terms available either on ti.com or provided in conjunction with such TI products. TI’s provision of these resources does not expand or otherwise alter TI’s applicable warranties or warranty disclaimers for TI products. Unless TI explicitly designates a product as custom or customer-specified, TI products are standard, catalog, general purpose devices. TI objects to and rejects any additional or different terms you may propose. IMPORTANT NOTICE

Copyright © 2026, Texas Instruments Incorporated Last updated 10/2025