**SN74HC86, SN54HC86** <u>www.ti.com</u> SCLS100F – DECEMBER 1982 – REVISED APRIL 2021**SN74HC86, SN54HC86**

|||SCLS100F – DECEMBER 1982 – REVISED APRIL 2021|
|---|---|---|
|3 Description Y = A ⊕ B in positive logic.|This device contains four independent 2-input XOR gates. Each gate performs the Boolean function Device Information|(1)|
|PART NUMBER|PACKAGE|BODY SIZE (NOM)|
|SN74HC86D|SOIC (14)|8.70 mm × 3.90 mm|
|SN74HC86N|PDIP (14)|19.30 mm × 6.40 mm|
|SN74HC86NS|SO (14)|10.20 mm × 5.30 mm|
|SN74HC86PW|TSSOP (14)|5.00 mm × 4.40 mm|
|SN54HC86J|CDIP (14)|21.30 mm × 7.60 mm|
|SN54HC86W|CFP (14)|9.20 mm × 6.29 mm|
|SN54HC86FK|LCCC (20)|8.90 mm × 8.90 mm|

(1) the end of the data sheet. 14 VCC 13 4B 12 4A 11 4Y 10 3B 9 3A 8 3Y For all available packages, see the orderable addendum at

# SNx4HC86 Quadruple 2-Input XOR Gates

## 1 Features

- Buffered inputs
- Wide operating voltage range: 2 V to 6 V
- Wide operating temperature range: –40°C to +85°C
- Supports fanout up to 10 LSTTL loads
- Significant power reduction compared to LSTTL logic ICs
## 2 Applications

- Detect phase differences in input signals
- Create a selectable inverter / buffer

|1A|1|
|---|---|
|1B|2|
|1Y|3|
|2A|4|
|2B|5|
|2Y|6|
|GND|7|

### Functional pinout

Copyright © 2021 Texas Instruments Incorporated An IMPORTANT NOTICE at the end of this data sheet addresses availability, warranty, changes, use in safety-critical applications, *Submit Document Feedback* intellectual property matters and other important disclaimers. PRODUCTION DATA. Product Folder Links: *SN74HC86 SN54HC86*
## SN74HC86, SN54HC86

SCLS100F – DECEMBER 1982 – REVISED APRIL 2021 <u>www.ti.com</u>

||Table of Contents 1 Features ............................................................................1 8.2 Functional Block Diagram........................................... 9 2 Applications ..................................................................... 1 8.3 Feature Description.....................................................9 3 Description .......................................................................1 8.4 Device Functional Modes..........................................10 4 Revision History .............................................................. 2 9 Application and Implementation .................................. 11 5 Pin Configuration and Functions ................................... 3 9.1 Application Information..............................................11 Pin Functions.................................................................... 3 9.2 Typical Application.................................................... 11 6 Specifications .................................................................. 4 10 Power Supply Recommendations ..............................13 6.1 Absolute Maximum Ratings........................................ 4 11 Layout ........................................................................... 13 6.2 Recommended Operating Conditions.........................4 11.1 Layout Guidelines................................................... 13 6.3 Thermal Information....................................................4 11.2 Layout Example...................................................... 13 6.4 Electrical Characteristics - 74..................................... 5 12 Device and Documentation Support ..........................14 6.5 Electrical Characteristics - 54..................................... 5 12.1 Documentation Support.......................................... 14 6.6 Switching Characteristics - 74.....................................6 12.2 Related Links.......................................................... 14 6.7 Switching Characteristics - 54.....................................6 12.3 Support Resources................................................. 14 6.8 Operating Characteristics........................................... 6 12.4 Trademarks............................................................. 14 6.9 Typical Characteristics................................................ 6 12.5 Electrostatic Discharge Caution..............................14 7 Parameter Measurement Information ............................ 8 12.6 Glossary..................................................................14 8 Detailed Description ........................................................9 13 Mechanical, Packaging, and Orderable 8.1 Overview..................................................................... 9 Information .................................................................... 14|
|---|---|
||4 Revision History NOTE: Page numbers for previous revisions may differ from page numbers in the current version. Changes from Revision E (August 2003) to Revision F (April 2021) Page|
|• • •|Updated the numbering format for tables, figures, and cross-references throughout the document..................1 Updated to new data sheet standards................................................................................................................ 1 Increased D (86 to 133.6), NS (76 to 122.6), and PW (113 to 151.7); decreased N (80 to 62.8) °C/W............. 4|

*Submit Document Feedback* Copyright © 2021 Texas Instruments Incorporated Product Folder Links: *SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** **www.ti.com** SCLS100F – DECEMBER 1982 – REVISED APRIL 2021

# 5 Pin Configuration and Functions

1B 1A NC VCC 4B 1A 1 14 VCC

|1A|1|14|VCC||||
|---|---|---|---|---|---|---|
|1B|2|13|4B|3 2|1 20 19||
|1Y|3|12|4A|1Y 4|18|4A|
|2A|4|11|4Y|NC 5|17|NC|
|2B|5|10|3B|2A 6|16|4Y|
|2Y|6|9|3A|NC 7|15|NC|
|GND|7|8|3Y|2B 8|14|3B|
|||||9 10 2Y GND NC|11 12 13 3Y 3A||

**Figure 5-1. D, N, NS, PW, J, or W Package**

## 14-Pin SOIC, PDIP, SO, TSSOP, CDIP, or CFP

**Figure 5-2. FK Package**

## Top View

## 20-Pin LCCC

## Top View

## Pin Functions

**PIN** **D, N, NS, I/O DESCRIPTION**

|NAME|D, N, NS,|FK|I/O||
|---|---|---|---|---|
||PW, J, or W||||
|1A|1|2|Input|Channel 1, Input A|
|1B|2|3|Input|Channel 1, Input B|
|1Y|3|4|Output|Channel 1, Output Y|
|2A|4|6|Input|Channel 2, Input A|
|2B|5|8|Input|Channel 2, Input B|
|2Y|6|9|Output|Channel 2, Output Y|
|GND|7|10|—|Ground|
|3Y|8|12|Output|Channel 3, Output Y|
|3A|9|13|Input|Channel 3, Input A|
|3B|10|14|Input|Channel 3, Input B|
|4Y|11|16|Output|Channel 4, Output Y|
|4A|12|18|Input|Channel 4, Input A|
|4B|13|19|Input|Channel 4, Input B|
|VCC|14|20|—|Positive Supply|
|NC||1, 5, 7, 11, 15, 17|—|Not internally connected|

Copyright © 2021 Texas Instruments Incorporated *Submit Document Feedback*

Product Folder Links: *SN74HC86 SN54HC86*
### SN74HC86, SN54HC86

SCLS100F – DECEMBER 1982 – REVISED APRIL 2021 <u>www.ti.com</u>

# 6 Specifications

## 6.1 Absolute Maximum Ratings

over operating free-air temperature range (unless otherwise noted)

(1)

||||MIN|MAX|UNIT|
|---|---|---|---|---|---|
|VCC|Supply voltage||–0.5|7|V|
|IIK|Input clamp current|VI < 0 V or VI > VCC||±20|mA|
|IOK|Output clamp current|VO < 0 V or VO > VCC||±20|mA|
|IO|Continuous output current Continuous current through VCC or GND|VO = 0 to VCC||±25 ±50|mA mA|
|TJ|Junction temperature|||150|°C|
|Tstg ratings only, which do not imply functional operation of the device at these or any other conditions beyond those indicated under Recommended Operating Condition. Exposure to absolute-maximum-rated conditions for extended periods may affect device reliability.|Storage temperature||–65|150|°C|

(1) Stresses beyond those listed under Absolute Maximum Rating may cause permanent damage to the device. These are stress
(2) The input and output voltage ratings may be exceeded if the input and output current ratings are observed.
(3) Guaranteed by design.

(2)
(2)
(3)
## 6.2 Recommended Operating Conditions

over operating free-air temperature range (unless otherwise noted)

||||MIN NOM|MAX|UNIT|
|---|---|---|---|---|---|
|VCC|Supply voltage|VCC = 2 V|2 1.5|6|V|
|VIH|High-level input voltage|VCC = 4.5 V VCC = 6 V VCC = 2 V|3.15 4.2|0.5|V|
|VIL|Low-level input voltage|VCC = 4.5 V VCC = 6 V||1.35 1.8|V|
|VI|Input voltage||0|VCC|V|
|VO|Output voltage|VCC = 2 V|0|VCC 1000|V|
|Δt/Δv|Input transition rise and fall rate|VCC = 4.5 V VCC = 6 V SN54HC86|–55|500 400 125|ns|
|TA|Operating free-air temperature|SN74HC86|–40|85|°C|

## 6.3 Thermal Information

||D (SOIC)|N (PDIP)|NS (SOP)|PW (TSSOP)||
|---|---|---|---|---|---|
||14 PINS|14 PINS|14 PINS|14 PINS||

(1) THERMAL METRIC SN74HC86 UNIT

|RθJA|Junction-to-ambient thermal resistance|133.6|62.8|122.6|151.7|°C/W|
|---|---|---|---|---|---|---|
|RθJC(top)|Junction-to-case (top) thermal resistance|89.0|50.5|81.8|79.4|°C/W|
|RθJB|Junction-to-board thermal resistance|89.5|42.5|83.8|94.7|°C/W|
|ΨJT 4|Junction-to-top characterization parameter Submit Document Feedback|45.5 Product Folder Links: SN74HC86 SN54HC86|30.1|45.4 Copyright © 2021 Texas Instruments Incorporated|25.2|°C/W|
## SN74HC86, SN54HC86

**www.ti.com** SCLS100F – DECEMBER 1982 – REVISED APRIL 2021

||D (SOIC)|N (PDIP)|NS (SOP)|PW (TSSOP)||
|---|---|---|---|---|---|
||14 PINS|14 PINS|14 PINS|14 PINS||

(1) THERMAL METRIC SN74HC86 UNIT

|ΨJB|Junction-to-board characterization parameter|89.1|42.3|83.4|94.1|°C/W|
|---|---|---|---|---|---|---|
|RθJC(bot) report.|Junction-to-case (bottom) thermal resistance|N/A|N/A|N/A|N/A|°C/W|

(1) For more information about traditional and new thermal metrics, see the Semiconductor and IC Package Thermal Metrics application

# 6.4 Electrical Characteristics - 74

over operating free-air temperature range; typical values measured at TA = 25°C (unless otherwise noted).

|PARAMETER|TEST CONDITIONS|VCC|||Operating free-air temperature (TA)||||UNIT|
|---|---|---|---|---|---|---|---|---|---|
||||MIN|25°C TYP|MAX|MIN|-40°C to 85°C TYP|MAX||

|||||2 V|1.9 1.998||1.9|||
|---|---|---|---|---|---|---|---|---|---|
||||IOH = -20 µA|4.5 V|4.4 4.499||4.4|||
|VOH|High-level output voltage|or V VI = VIHIL|IOH = -4 mA IOH = -5.2 mA|6 V 4.5 V 6 V|5.9 5.999 3.98 4.3 5.48 5.8||5.9 3.84 5.34||V|
||||IOL = 20 µA|2 V|0.002|0.1||0.1||
|||||4.5 V|0.001|0.1||0.1||
|VOL|Low-level output voltage|V or VI= VIHIL|IOL = 20 µA|6 V|0.001|0.1||0.1|V|
||||IOL = 4 mA|4.5 V|0.17|0.26||0.33||
||||IOL = 5.2 mA|6 V|0.15|0.26||0.33||
|II|Input leakage current|VI = VCC or 0||6 V|±0.1|±100||±1000|nA|
|ICC|Supply current|V or 0I= VCC|IO = 0|6 V||2||20|µA|
|Ci|Input capacitance|||2 V to 6 V|3|10||10|pF|

# 6.5 Electrical Characteristics - 54

over operating free-air temperature range; typical values measured at TA = 25°C (unless otherwise noted).

||||||||Operating free-air temperature (TA)||||||
|---|---|---|---|---|---|---|---|---|---|---|---|---|
|PARAMETER|TEST CONDITIONS|VCC|MIN|25°C TYP|MAX|MIN|–40°C to 85°C TYP|MAX|MIN|–55°C to 125°C TYP|MAX|UNIT|

2 V 1.9 1.998 1.9 1.9 IOH = –20

4.5 V 4.4 4.499 4.4 4.4
µA 6 V 5.9 5.999 5.9 5.9 High-level VI = VIH or VOH V output voltage VILIOH = –4 4.5 V

3.98 4.3 3.84 3.7
mA

IOH = –5.2 6 V 5.48 5.8 5.34 5.2 mA

2 V 0.002 0.1 0.1 0.1 IOL = 20

4.5 V 0.001 0.1 0.1 0.1
µA Low-level output V 6 V 0.001 0.1 0.1 0.1 VOL V voltage VI = VIH orILIOL = 4 mA 4.5 V

0.17 0.26 0.33 0.4
IOL = 5.2 6 V 0.15 0.26 0.33 0.4 mA

Copyright © 2021 Texas Instruments Incorporated *Submit Document Feedback*

Product Folder Links: *SN74HC86 SN54HC86*
## SN74HC86, SN54HC86

<u>SCLS100F – DECEMBER 1982 – REVISED APRIL 2021</u> **www.ti.com** over operating free-air temperature range; typical values measured at TA = 25°C (unless otherwise noted).

||||||||Operating free-air temperature (TA)||||||
|---|---|---|---|---|---|---|---|---|---|---|---|---|
|PARAMETER|TEST CONDITIONS|VCC|MIN|25°C TYP|MAX|MIN|–40°C to 85°C TYP|MAX|MIN|–55°C to 125°C TYP|MAX|UNIT|

|II|Input leakage current|VI = VCC or 0|6 V|±0.1|±1|±1 µA|
|---|---|---|---|---|---|---|
|ICC|Supply current|V or 0I= VCC|6 V|2|20|40 µA|
|Ci|Input capacitance||2 V to 6 V|3 10|10|10 pF|

IO = 0

# 6.6 Switching Characteristics - 74

over operating free-air temperature range (unless otherwise noted)

|||||||Operating free-air temperature (TA)|||||
|---|---|---|---|---|---|---|---|---|---|---|
|PARAMETER|FROM|TO|VCC|MIN|25°C TYP|MAX|MIN|–40°C to 85°C TYP|MAX|UNIT|

||||2 V|40|100|125|
|---|---|---|---|---|---|---|
|tpd|Propagation delay|Y|4.5 V|12|20|25 ns|
||||6 V|10|17|21|
||||2 V|28|75|95|
|tt|Transition-time|Y|4.5 V|8|15|19 ns|
||||6 V|6|13|16|

A or B

# 6.7 Switching Characteristics - 54

over operating free-air temperature range; typical values measured at TA = 25°C (unless otherwise noted).

|||||||||Operating free-air temperature (TA)||||||
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|PARAMETER|FROM|TO|VCC|MIN|25°C TYP|MAX|MIN|–40°C to 85°C TYP|MAX|MIN|–55°C to 125°C TYP|MAX|UNIT|

||||2 V|40 100|125|150|
|---|---|---|---|---|---|---|
|tpd|Propagation delay|Y|4.5 V|12 20|25|30 ns|
||||6 V|10 17|21|25|
||||2 V|38 75|95|110|
|tt|Transition-time|Y|4.5 V|8 15|19|22 ns|
||||6 V|6 13|16|19|

A or B

# 6.8 Operating Characteristics

over operating free-air temperature range; typical values measured at TA = 25°C (unless otherwise noted). **MIN**

|PARAMETER|TEST CONDITIONS|VCC|TYP|MAX UNIT|
|---|---|---|---|---|
|CpdPower dissipation capacitance per gate|No load|2 V to 6 V|35|pF|

# 6.9 Typical Characteristics

TA = 25°C

*Submit Document Feedback* Copyright © 2021 Texas Instruments Incorporated Product Folder Links: *SN74HC86 SN54HC86*
<u>www.ti.com</u>

Output High Voltage (V)2 OH V 2-V 1

4.5-V 6-V
0 0 1 2 3 4 5 6 IOH Output High Current (mA)

**Figure 6-1. Typical output voltage in the high state**

## (VOH)

**SN74HC86, SN54HC86** <u>SCLS100F – DECEMBER 1982 – REVISED APRIL 2021</u>

0.3
2-V

0.25
4.5-V 6-V
0.2
0.15
0.1
Output Low Voltage (V) V OL

0.05 0 0 1 2 3 4 5 6
IOL Output Low Current (mA)

**Figure 6-2. Typical output voltage in the low state**

## (VOL)

Copyright © 2021 Texas Instruments Incorporated

Product Folder Links:

*Submit Document Feedback*

*SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** <u>SCLS100F – DECEMBER 1982 – REVISED APRIL 2021 www.ti.com</u>

# 7 Parameter Measurement Information

- Phase relationships between waveforms were chosen arbitrarily. All input pulses are supplied by generators having the following characteristics: PRR ≤ 1 MHz, ZO = 50 Ω, tt < 6 ns.
- The outputs are measured one at a time, with one input transition per measurement.
Test 90% 90% VCC Point Input 10% 10% 0 V t r

(1)
t f

(1)
From Output Under Test

(1)90%
90% V OH CL Output 10% 10% VOL t r

(1)
t f

(1)
A. CL= 50 pF and includes probe and jig capacitance.
**Figure 7-1. Load Circuit**

A. tt is the greater of tr and tf.
**Figure 7-2. Voltage Waveforms Transition Times**

VCC Input 50% 50% 0 V t PLH(1) tPHL(1) VOH Output 50% 50% VOL t PHL(1) tPLH(1) VOH Output 50% 50% VOL

A. The maximum between tPLH and tPHL is used for tpd.
**Figure 7-3. Voltage Waveforms Propagation Delays**

*Submit Document Feedback* Copyright © 2021 Texas Instruments Incorporated

Product Folder Links: *SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** <u>www.ti.com SCLS100F – DECEMBER 1982 – REVISED APRIL 2021</u>

# 8 Detailed Description

## 8.1 Overview

This device contains four independent 2-input XOR gates. Each gate performs the Boolean function Y = A ⊕ B in positive logic.

## 8.2 Functional Block Diagram

xA

xY

xB

## 8.3 Feature Description 8.3.1 Balanced CMOS Push-Pull Outputs

A balanced output allows the device to sink and source similar currents. The drive capability of this device may create fast edges into light loads so routing and load conditions should be considered to prevent ringing. Additionally, the outputs of this device are capable of driving larger currents than the device can sustain without being damaged. It is important for the output power of the device to be limited to avoid damage due to over-current. The electrical and thermal limits defined in the *Absolute Maximum Ratings* must be followed at all times.

The SN74HC86 can drive a load with a total capacitance less than or equal to the maximum load listed in the *Switching Characteristics - 74* connected to a high-impedance CMOS input while still meeting all of the datasheet specifications. Larger capacitive loads can be applied, however it is not recommended to exceed the provided load value. If larger capacitive loads are required, it is recommended to add a series resistor between the output and the capacitor to limit output current to the values given in the *Absolute Maximum Ratings*.

## 8.3.2 Standard CMOS Inputs

Standard CMOS inputs are high impedance and are typically modeled as a resistor from the input to ground in parallel with the input capacitance given in the *Electrical Characteristics - 74*. The worst case resistance is calculated with the maximum input voltage, given in the *Absolute Maximum Ratings*, and the maximum input leakage current, given in the *Electrical Characteristics - 74*, using ohm's law (R = V ÷ I).

Signals applied to the inputs need to have fast edge rates, as defined by the input transition time in the *Recommended Operating Conditions* to avoid excessive current consumption and oscillations. If a slow or noisy input signal is required, a device with a Schmitt-trigger input should be used to condition the input signal prior to the standard CMOS input.

Copyright © 2021 Texas Instruments Incorporated *Submit Document Feedback*

Product Folder Links: *SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** SCLS100F – DECEMBER 1982 – REVISED APRIL 2021 <u>www.ti.com</u>

## 8.3.3 Clamp Diode Structure

The inputs and outputs to this device have both positive and negative clamping diodes as depicted in Figure 8-1. **CAUTION** Voltages beyond the values specified in the *Absolute Maximum Ratings* table can cause damage to the device. The recommended input and output voltage ratings may be exceeded if the input and output clamp-current ratings are observed.

Device VCC

+IIK +IOK Input Logic Output -IIK-IOK

GND

**Figure 8-1. Electrical Placement of Clamping Diodes for Each Input and Output**

# 8.4 Device Functional Modes

<u>Table 8-1. Function Table</u>

|INPUTS||OUTPUT|
|---|---|---|
|A|B|Y|
|L|L|L|
|L|H|H|
|H|L|H|
|H|H|L|

*Submit Document Feedback* Copyright © 2021 Texas Instruments Incorporated Product Folder Links: *SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** <u>www.ti.com</u> SCLS100F – DECEMBER 1982 – REVISED APRIL 2021

# 9 Application and Implementation

## Note

Information in the following applications sections is not part of the TI component specification, and TI does not warrant its accuracy or completeness. TI’s customers are responsible for determining suitability of components for their purposes, as well as validating and testing their design implementation to confirm system functionality.

## 9.1 Application Information

In this application, a 2-input XOR gate is used as a phase difference detector as shown in *Figure 9-1*. The remaining three gates can be used for other applications in the system, or the inputs can be grounded and the channels left unused.

The device is used to identify phase difference between a reference clock and another input clock. Whenever the clock states are different, the XOR output will pulse HIGH until the clocks return to the same state. The output is fed into a low-pass filter to obtain a DC representation of the phase difference.

## 9.2 Typical Application

Input Clock R Output Reference Clock C

**Figure 9-1. Typical application schematic**

## 9.2.1 Design Requirements 9.2.1.1 Power Considerations

Ensure the desired supply voltage is within the range specified in the *Recommended Operating Conditions*. The supply voltage sets the device's electrical characteristics as described in the *Electrical Characteristics - 74*.

The supply must be capable of sourcing current equal to the total current to be sourced by all outputs of the SN74HC86 plus the maximum supply current, ICC, listed in the *Electrical Characteristics - 74*. The logic device can only source or sink as much current as it is provided at the supply and ground pins, respectively. Be sure not to exceed the maximum total current through GND or VCC listed in the *Absolute Maximum Ratings*.

Total power consumption can be calculated using the information provided in CMOS Power Consumption and Cpd Calculation.

Thermal increase can be calculated using the information provided in Thermal Characteristics of Standard Linear and Logic (SLL) Packages and Devices.

## CAUTION

The maximum junction temperature, TJ(max) listed in the *Absolute Maximum Ratings*, is an *additional limitation* to prevent damage to the device. Do not violate any values listed in the *Absolute* *Maximum Ratings*. These limits are provided to prevent damage to the device.

## 9.2.1.2 Input Considerations

Unused inputs must be terminated to either VCC or ground. These can be directly terminated if the input is completely unused, or they can be connected with a pull-up or pull-down resistor if the input is to be used sometimes, but not always. A pull-up resistor is used for a default state of HIGH, and a pull-down resistor is used for a default state of LOW. The resistor size is limited by drive current of the controller, leakage current into the SN74HC86, as specified in the *Electrical Characteristics - 74*, and the desired input transition rate. A 10-kΩ resistor value is often used due to these factors.

Copyright © 2021 Texas Instruments Incorporated *Submit Document Feedback*

Product Folder Links: *SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** <u>SCLS100F – DECEMBER 1982 – REVISED APRIL 2021 www.ti.com</u>

The SN74HC86 has standard CMOS inputs, so input signal edge rates cannot be slow. Slow input edge rates can cause oscillations and damaging shoot-through current. The recommended rates are defined in the *Recommended Operating Conditions*.

Refer to *Section 8.3* for additional information regarding the inputs for this device.

## 9.2.1.3 Output Considerations

The positive supply voltage is used to produce the output HIGH voltage. Drawing current from the output will decrease the output voltage as specified by the VOH specification in the *Electrical Characteristics - 74*. Similarly, the ground voltage is used to produce the output LOW voltage. Sinking current into the output will increase the output voltage as specified by the VOL specification in the *Electrical Characteristics - 74*.

Unused outputs can be left floating. Do not connect outputs directly to VCC or ground.

Refer to *Section 8.3* for additional information regarding the outputs for this device.

## 9.2.2 Detailed Design Procedure

1. Add a decoupling capacitor from VCC to GND. The capacitor needs to be placed physically close to the device and electrically close to both the VCC and GND pins. An example layout is shown in *Section 11*.
2. Ensure the capacitive load at the output is ≤ 70 pF. This is not a hard limit, however it will ensure optimal performance. This can be accomplished by providing short, appropriately sized traces from the SN74HC86 to the receiving device.
3. Ensure the resistive load at the output is larger than (VCC / IO(max)) Ω. This will ensure that the maximum output current from the *Absolute Maximum Ratings* is not violated. Most CMOS inputs have a resistive load measured in megaohms; much larger than the minimum calculated above.
4. Thermal issues are rarely a concern for logic gates, however the power consumption and thermal increase can be calculated using the steps provided in the application report, CMOS Power Consumption and Cpd Calculation
## 9.2.3 Application Curves

Reference Clock Input Clock Out

**Figure 9-2. Typical application timing diagram**

*Submit Document Feedback* Copyright © 2021 Texas Instruments Incorporated

Product Folder Links: *SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** <u>www.ti.com SCLS100F – DECEMBER 1982 – REVISED APRIL 2021</u>

# 10 Power Supply Recommendations

The power supply can be any voltage between the minimum and maximum supply voltage rating located in the *Recommended Operating Conditions*. Each VCC terminal should have a bypass capacitor to prevent power disturbance. A 0.1-μF capacitor is recommended for this device. It is acceptable to parallel multiple bypass caps to reject different frequencies of noise. The 0.1-μF and 1-μF capacitors are commonly used in parallel. The bypass capacitor should be installed as close to the power terminal as possible for best results, as shown in

*Figure 11-1*.

# 11 Layout

## 11.1 Layout Guidelines

When using multiple-input and multiple-channel logic devices inputs must not ever be left floating. In many cases, functions or parts of functions of digital logic devices are unused; for example, when only two inputs of a triple-input AND gate are used. Such unused input pins must not be left unconnected because the undefined voltages at the outside connections result in undefined operational states. All unused inputs of digital logic devices must be connected to a logic high or logic low voltage, as defined by the input voltage specifications, to prevent them from floating. The logic level that must be applied to any particular unused input depends on the function of the device. Generally, the inputs are tied to GND or VCC, whichever makes more sense for the logic function or is more convenient.

## 11.2 Layout Example

GND VCC

*Recommend GND flood fill for* *improved signal isolation, noise Bypass capacitor* *reduction, and thermal dissipation placed close to the* *device*

|||0.1|F|
|---|---|---|---|
|1A|1|14|VCC|
|1B|2|13|4B|
|1Y|3|12|4A|
|2A|4|11|4Y|
|2B|5|10|3B|
|2Y|6|9|3A|
|GND|7|8|3Y|

*Unused* *inputs tied to* *VCC* *Unused* *output left* *floating*

*Avoid 90°* *corners for* *signal lines*

**Figure 11-1. Example layout for the SN74HC86**

Copyright © 2021 Texas Instruments Incorporated *Submit Document Feedback*

Product Folder Links: *SN74HC86 SN54HC86*
**SN74HC86, SN54HC86** <u>SCLS100F – DECEMBER 1982 – REVISED APRIL 2021 www.ti.com</u>

# 12 Device and Documentation Support

## 12.1 Documentation Support 12.1.1 Related Documentation

For related documentation see the following:

- HCMOS Design Considerations
- CMOS Power Consumption and CPD Calculation
- Designing with Logic
## 12.2 Related Links

The table below lists quick access links. Categories include technical documents, support and community resources, tools and software, and quick access to sample or buy.

## 12.3 Support Resources

TI E2E™ support forums are an engineer's go-to source for fast, verified answers and design help — straight from the experts. Search existing answers or ask your own question to get the quick design help you need. Linked content is provided "AS IS" by the respective contributors. They do not constitute TI specifications and do not necessarily reflect TI's views; see TI's Terms of Use.

## 12.4 Trademarks

TI E2E™ is a trademark of Texas Instruments. All trademarks are the property of their respective owners.

## 12.5 Electrostatic Discharge Caution

This integrated circuit can be damaged by ESD. Texas Instruments recommends that all integrated circuits be handled with appropriate precautions. Failure to observe proper handling and installation procedures can cause damage. ESD damage can range from subtle performance degradation to complete device failure. Precision integrated circuits may be more susceptible to damage because very small parametric changes could cause the device not to meet its published specifications.

## 12.6 Glossary

TI Glossary This glossary lists and explains terms, acronyms, and definitions.

# 13 Mechanical, Packaging, and Orderable Information

The following pages include mechanical, packaging, and orderable information. This information is the most current data available for the designated devices. This data is subject to change without notice and revision of this document. For browser-based versions of this data sheet, refer to the left-hand navigation.

*Submit Document Feedback* Copyright © 2021 Texas Instruments Incorporated Product Folder Links: *SN74HC86 SN54HC86*
# PACKAGE OPTION ADDENDUM

www.ti.com 18-Sep-2026

## PACKAGING INFORMATION

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier||RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)||||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|84046012A|Active|Production|LCCC (FK) | 20|55 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
||||||||||||86FK|
|8404601CA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|8404601DA|Active|Production|CFP (W) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|JM38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|JM38510/65202BCA.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|M38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|SN54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN74HC86D|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86DR|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DR.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DRG4|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DRG4.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DT|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86N|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86N.A|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NE4|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NSR|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86NSR.A|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PW|Obsolete|Production|TSSOP (PW) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86PWR|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWR.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWRG4|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86PWRG4.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier||RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)||||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|84046012A|Active|Production|LCCC (FK) | 20|55 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
||||||||||||86FK|
|8404601CA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|8404601DA|Active|Production|CFP (W) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|JM38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|JM38510/65202BCA.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|M38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|SN54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN74HC86D|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86DR|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DR.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DRG4|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DRG4.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DT|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86N|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86N.A|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NE4|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NSR|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86NSR.A|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PW|Obsolete|Production|TSSOP (PW) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86PWR|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWR.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWRG4|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86PWRG4.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier||RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)||||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|84046012A|Active|Production|LCCC (FK) | 20|55 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
||||||||||||86FK|
|8404601CA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|8404601DA|Active|Production|CFP (W) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|JM38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|JM38510/65202BCA.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|M38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|SN54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN74HC86D|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86DR|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DR.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DRG4|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DRG4.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DT|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86N|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86N.A|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NE4|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NSR|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86NSR.A|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PW|Obsolete|Production|TSSOP (PW) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86PWR|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWR.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWRG4|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86PWRG4.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier||RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)||||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|84046012A|Active|Production|LCCC (FK) | 20|55 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
||||||||||||86FK|
|8404601CA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|8404601DA|Active|Production|CFP (W) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|JM38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|JM38510/65202BCA.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|M38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|SN54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN74HC86D|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86DR|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DR.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DRG4|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DRG4.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DT|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86N|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86N.A|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NE4|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NSR|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86NSR.A|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PW|Obsolete|Production|TSSOP (PW) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86PWR|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWR.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWRG4|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86PWRG4.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier||RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)||||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|84046012A|Active|Production|LCCC (FK) | 20|55 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
||||||||||||86FK|
|8404601CA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|8404601DA|Active|Production|CFP (W) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|JM38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|JM38510/65202BCA.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|M38510/65202BCA|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|JM38510/ 65202BCA|
|SN54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE||No|SNPB|N/A for Pkg Type||-55 to 125|SN54HC86J|
|SN74HC86D|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86DR|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DR.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86DRG4|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DRG4.A|Active|Production|SOIC (D) | 14|2500 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86DT|Obsolete|Production|SOIC (D) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86N|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86N.A|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NE4|Active|Production|PDIP (N) | 14|25 | TUBE||Yes|NIPDAU|N/A for Pkg Type||-40 to 85|SN74HC86N|
|SN74HC86NSR|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86NSR.A|Active|Production|SOP (NS) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PW|Obsolete|Production|TSSOP (PW) | 14||-|-|Call TI||Call TI|-40 to 85|HC86|
|SN74HC86PWR|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU | SN|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWR.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 85|HC86|
|SN74HC86PWRG4|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|
|SN74HC86PWRG4.A|Active|Production|TSSOP (PW) | 14|2000 | LARGE T&R||Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HC86|

Addendum-Page 1
## PACKAGE OPTION ADDENDUM

www.ti.com 18-Sep-2026

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|SN74HCS86DYYR|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SN74HCS86DYYR.A|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SNJ54HC86FK|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86FK.A|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86W|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|SNJ54HC86W.A|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|

(1)

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|SN74HCS86DYYR|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SN74HCS86DYYR.A|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SNJ54HC86FK|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86FK.A|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86W|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|SNJ54HC86W.A|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|

(1)

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|SN74HCS86DYYR|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SN74HCS86DYYR.A|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SNJ54HC86FK|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86FK.A|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86W|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|SNJ54HC86W.A|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|

(1)

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|SN74HCS86DYYR|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SN74HCS86DYYR.A|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SNJ54HC86FK|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86FK.A|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86W|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|SNJ54HC86W.A|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|

(1)

|Orderable part number|Status|Material type|Package | Pins|Package qty | Carrier|RoHS|Lead finish/|MSL rating/||Op temp (°C)|Part marking|
|---|---|---|---|---|---|---|---|---|---|---|
||(1)|(2)|||(3)|Ball material (4)|Peak reflow|(5)||(6)|
|SN74HCS86DYYR|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SN74HCS86DYYR.A|Active|Production|SOT-23-THIN (DYY) | 14|3000 | LARGE T&R|Yes|NIPDAU|Level-1-260C-UNLIM||-40 to 125|HCS86|
|SNJ54HC86FK|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86FK.A|Active|Production|LCCC (FK) | 20|55 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|84046012A SNJ54HC|
|||||||||||86FK|
|SNJ54HC86J|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86J.A|Active|Production|CDIP (J) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601CA SNJ54HC86J|
|SNJ54HC86W|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|
|SNJ54HC86W.A|Active|Production|CFP (W) | 14|25 | TUBE|No|SNPB|N/A for Pkg Type||-55 to 125|8404601DA SNJ54HC86W|

(1)

**Status:** For more details on status, see our product life cycle.

**(2)** **Material type:** When designated, preproduction parts are prototypes/experimental devices, and are not yet approved or released for full production. Testing and final process, including without limitation quality assurance, reliability performance testing, and/or process qualification, may not yet be complete, and this item is subject to further changes or possible discontinuation. If available for ordering, purchases will be subject to an additional waiver at checkout, and are intended for early internal evaluation purposes only. These items are sold without warranties of any kind.
**(3)** **RoHS values:** Yes, No, RoHS Exempt. See the TI RoHS Statement for additional information and value definition.
**(4)** **Lead finish/Ball material:** Parts may have multiple material finish options. Finish options are separated by a vertical ruled line. Lead finish/Ball material values may wrap to two lines if the finish value exceeds the maximum column width.
**(5)** **MSL rating/Peak reflow:** The moisture sensitivity level ratings and peak solder (reflow) temperatures. In the event that a part has multiple moisture sensitivity ratings, only the lowest level per JEDEC standards is shown. Refer to the shipping label for the actual reflow temperature that will be used to mount the part to the printed circuit board.
**(6)** **Part marking:** There may be an additional marking, which relates to the logo, the lot trace code information, or the environmental category of the part.
Addendum-Page 2
# PACKAGE OPTION ADDENDUM

www.ti.com 18-Sep-2026

Multiple part markings will be inside parentheses. Only one part marking contained in parentheses and separated by a "~" will appear on a part. If a line is indented then it is a continuation of the previous line and the two combined represent the entire part marking for that device.

**Important Information and Disclaimer:** The information provided on this page represents TI's knowledge and belief as of the date that it is provided. TI bases its knowledge and belief on information provided by third parties, and makes no representation or warranty as to the accuracy of such information. Efforts are underway to better integrate information from third parties. TI has taken and continues to take reasonable steps to provide representative and accurate information but may not have conducted destructive testing or chemical analysis on incoming materials and chemicals. TI and TI suppliers consider certain information to be proprietary, and thus CAS numbers and other limited information may not be available for release.

In no event shall TI's liability arising out of such information exceed the total purchase price of the TI part(s) at issue in this document sold by TI to Customer on an annual basis.

**OTHER QUALIFIED VERSIONS OF SN54HC86, SN74HC86 :** Catalog : SN74HC86 • Automotive : SN74HC86-Q1, SN74HC86-Q1 • Military : SN54HC86 •

NOTE: Qualified Version Definitions: Catalog-TI's standard catalog product • Automotive-Q100 devices qualified for high-reliability automotive applications targeting zero defects • Military-QML certified for Military and Defense Applications •

Addendum-Page 3
# PACKAGE MATERIALS INFORMATION

www.ti.com 4-Oct-2026

## TAPE AND REEL INFORMATION

**REEL DIMENSIONS TAPE DIMENSIONS** K0 P1

W B0 Reel Diameter Cavity A0 A0 Dimension designed to accommodate the component width B0 Dimension designed to accommodate the component length K0 Dimension designed to accommodate the component thickness W Overall width of the carrier tape P1 Pitch between successive cavity centers

Reel Width (W1) **QUADRANT ASSIGNMENTS FOR PIN 1 ORIENTATION IN TAPE** Sprocket Holes

||Q1 Q2|Q1|Q2|||
|---|---|---|---|---|---|
||Q3 Q4|Q3|Q4|User Direction of Feed||

Pocket Quadrants

*All dimensions are nominal **Device Package Package Pins SPQ Reel Reel A0 B0 K0 P1 W Pin1** **Type Drawing Diameter Width (mm) (mm) (mm) (mm) (mm) Quadrant** **(mm) W1 (mm)**

|SN74HC86DR|SOIC|D|14 2500|330.0|16.4|6.5 9.0|2.1 8.0|16.0|Q1|
|---|---|---|---|---|---|---|---|---|---|
|SN74HC86DRG4|SOIC|D|14 2500|330.0|16.4|6.5 9.0|2.1 8.0|16.0|Q1|
|SN74HC86NSR|SOP|NS|14 2000|330.0|16.4|8.45 10.55|2.5 12.0|16.2|Q1|
|SN74HC86PWR|TSSOP|PW|14 2000|330.0|12.4|6.9 5.6|1.6 8.0|12.0|Q1|
|SN74HC86PWR|TSSOP|PW|14 2000|330.0|12.4|6.9 5.3|1.6 8.0|12.0|Q1|
|SN74HC86PWR|TSSOP|PW|14 2000|330.0|12.4|6.9 5.6|1.6 8.0|12.0|Q1|
|SN74HC86PWRG4|TSSOP|PW|14 2000|330.0|12.4|6.9 5.6|1.6 8.0|12.0|Q1|
|SN74HCS86DYYR|SOT-23-|DYY|14 3000|330.0|12.4|4.8 3.6|1.6 8.0|12.0|Q3|
||THIN|||||||||

SN74HC86DR SOIC D 14 2500 330.0 16.4 6.5 9.0 2.1 8.0 16.0 Q1

Pack Materials-Page 1
## PACKAGE MATERIALS INFORMATION

www.ti.com 4-Oct-2026 **TAPE AND REEL BOX DIMENSIONS**

***Width (mm)*** H

W L

*All dimensions are nominal **Device Package Type Package Drawing Pins SPQ Length (mm) Width (mm) Height (mm)**

|Device|Package Type|Package Drawing|Pins|SPQ|Length (mm)|Width (mm)|Height (mm)|
|---|---|---|---|---|---|---|---|
|SN74HC86DR|SOIC|D|14|2500|340.5|336.1|32.0|
|SN74HC86DRG4|SOIC|D|14|2500|353.0|353.0|32.0|
|SN74HC86NSR|SOP|NS|14|2000|353.0|353.0|32.0|
|SN74HC86PWR|TSSOP|PW|14|2000|353.0|353.0|32.0|
|SN74HC86PWR|TSSOP|PW|14|2000|367.0|367.0|35.0|
|SN74HC86PWR|TSSOP|PW|14|2000|356.0|356.0|35.0|
|SN74HC86PWRG4|TSSOP|PW|14|2000|353.0|353.0|32.0|
|SN74HCS86DYYR|SOT-23-THIN|DYY|14|3000|336.6|336.6|31.8|

Pack Materials-Page 2
# PACKAGE MATERIALS INFORMATION

www.ti.com 4-Oct-2026 **TUBE** **T-Tube height L-Tube length**

## W-Tube width

## B-Alignment groove width

*All dimensions are nominal

|Device|Package Name|Package Type|Pins|SPQ|L (mm)|W (mm)|T (µm)|B (mm)|
|---|---|---|---|---|---|---|---|---|
|84046012A|FK|LCCC|20|55|506.98|12.06|2030|NA|
|8404601DA|W|CFP|14|25|506.98|26.16|6220|NA|
|SN74HC86N|N|PDIP|14|25|506|13.97|11230|4.32|
|SN74HC86N|N|PDIP|14|25|506|13.97|11230|4.32|
|SN74HC86N.A|N|PDIP|14|25|506|13.97|11230|4.32|
|SN74HC86N.A|N|PDIP|14|25|506|13.97|11230|4.32|
|SN74HC86NE4|N|PDIP|14|25|506|13.97|11230|4.32|
|SN74HC86NE4|N|PDIP|14|25|506|13.97|11230|4.32|
|SNJ54HC86FK|FK|LCCC|20|55|506.98|12.06|2030|NA|
|SNJ54HC86FK.A|FK|LCCC|20|55|506.98|12.06|2030|NA|
|SNJ54HC86W|W|CFP|14|25|506.98|26.16|6220|NA|
|SNJ54HC86W.A|W|CFP|14|25|506.98|26.16|6220|NA|

**Device Package Name Package Type Pins SPQ L (mm) W (mm) T (µm) B (mm)**

Pack Materials-Page 3
DYY0014A SOT-23-THIN - 1.1 mm max height
DIO)
PLASTIC SMALL OUTLINE
3.36
3.16 SEATING PLANE
PIN 1 INDEX
AREA Ajo1|c}
o 12x83) IH
il == i -_ TI
iii = I
o _ HI
4.3 I 2X Li
NOTE 3 3 TT
iL iL TI
LL LL TI
_ == =, i HI
8 | 4X 0° - 15 1)
0.3 1.1 MAX i
E | 21 14X 011
19 010 ]c]A [8]
4X 4° - 15°
4
{ 0.2
I
W/m \
\ T
_
- e |)
CP I
= i i SF TU
0°- 8° i 0.63 0.1
0.33 0.0
DETAIL A
TYP
4224643/D 07/2024
NOTES:
1. AIl linear dimensions are in millimeters. Any dimensions in parenthesis are for reference only. Dimensioning and tolerancing
per ASME Y14.5M.
2. This drawing is subject to change without notice.
3. This dimension does not include mold flash, protrusions, or gate burrs. Mold flash, protrusions, or gate burrs shall not exceed
0.15 per side.
4. This dimension does not include interlead flash. Interlead flash shall not exceed 0.50 per side.

5. Reference JEDEC Registration MO-345, Variation AB
DIE EEE)
i INSTRUMENTS
www.ti.com
EXAMPLE BOARD LAYOUT
DYYO0014A SOT-23-THIN - 1.1 mm max height
PLASTIC SMALL OUTLINE
SYMM
14X (1.05) TT E
i |
DI Co
i PE
Li) | Li
SYMM
== =_=:
I | I
|
12X (0.5) | |
|
PC
(R0.05) TYP | |
___—_——_—_ (8) ——_—_—_—_—_—_—_—_—|
LAND PATTERN EXAMPLE
EXPOSED METAL SHOWN
SCALE: 20X
SOLDER MASK METAL UNDER
OPENING SOLDER MASK AN SOLDER MASK
METAL OPENING
ma |
(n)
NON- SOLDER MASK SOLDER MASK
DEFINED DEFINED
(PREFERRED)
SOLDER MASK DETAILS
4224643/D 07/2024
NOTES: (continued)
6. Publication IPC-7351 may have alternate designs.
7. Solder mask tolerances between and around signal pads can vary based on board fabrication site.
|
Ù INSTRUMENTS
www.ti.com
EXAMPLE STENCIL DESIGN
DYYO0014A SOT-23-THIN - 1.1 mm max height
PLASTIC SMALL OUTLINE
SYMM
14X (1.05) TT (0
i |
O | Co
Li Li
| SYMM
uo i ae
I I
CI | CC
12X (0.5 |
e A
|
PC
(R0.05) TYP | |
(3)
SOLDER PASTE EXAMPLE
BASED ON 0.125 mm THICK STENCIL
SCALE: 20X
4224643/D 07/2024
NOTES: (continued)
8. Laser cutting apertures with trapezoidal walls and rounded corners may offer better paste release. IPC-7525 may have alternate
design recommendations.
9. Board assembly site may have different recommendations for stencil design.
|
Ù INSTRUMENTS
www.ti.com
## PACKAGE OUTLINE

# D0014A <u>SOIC - 1.75 mm max height</u>

SCALE 1.800 SMALL OUTLINE INTEGRATED CIRCUIT

C

6.2
SEATING PLANE

5.8 TYP

|A|PIN 1 ID||0.1 C|
|---|---|---|---|
||AREA|12X 1.27||
|1||14||

8.75 2X
8.55 7.62
NOTE 3

7 8 14X 0.51

||4.0|14X 0.51 0.31||
|---|---|---|---|
|B|3.8 NOTE 4|0.25|C A B|

0.31
1.75 MAX
0.25
0.13 TYP
SEE DETAIL A

<u>0.25</u>
GAGE PLANE

0.25
1.27
0 - 8 0.10

0.40 DETAIL A TYPICAL 4220718/A 09/2016
NOTES:

1. All linear dimensions are in millimeters. Dimensions in parenthesis are for reference only. Dimensioning and tolerancing per ASME Y14.5M.
2. This drawing is subject to change without notice.
3. This dimension does not include mold flash, protrusions, or gate burrs. Mold flash, protrusions, or gate burrs shall not exceed 0.15 mm, per side.
4. This dimension does not include interlead flash. Interlead flash shall not exceed 0.43 mm, per side.
5. Reference JEDEC registration MS-012, variation AB.
www.ti.com
## EXAMPLE BOARD LAYOUT

# D0014A <u>SOIC - 1.75 mm max height</u>

|||SMALL OUTLINE INTEGRATED CIRCUIT|
|---|---|---|
|14X (1.55) 1||SYMM|
|||14|
|14X (0.6)|||
|12X (1.27)||SYMM|
|7||8|
|(R0.05) TYP|||
|SOLDER MASK OPENING|METAL|(5.4) LAND PATTERN EXAMPLE SCALE:8X SOLDER MASK METAL UNDER OPENING SOLDER MASK|
|0.07 MAX ALL AROUND NON SOLDER MASK DEFINED||0.07 MIN ALL AROUND SOLDER MASK DEFINED SOLDER MASK DETAILS 4220718/A 09/2016|

NOTES: (continued) 6. Publication IPC-7351 may have alternate designs. 7. Solder mask tolerances between and around signal pads can vary based on board fabrication site.

www.ti.com
## EXAMPLE STENCIL DESIGN

# D0014A <u>SOIC - 1.75 mm max height</u>

|||SMALL OUTLINE INTEGRATED CIRCUIT|
|---|---|---|
|14X (1.55) 1||SYMM|
|||14|
|14X (0.6)|||
|12X (1.27)||SYMM|
|7||8 (5.4) SOLDER PASTE EXAMPLE BASED ON 0.125 mm THICK STENCIL SCALE:8X 4220718/A 09/2016|

NOTES: (continued) design recommendations. 9. Board assembly site may have different recommendations for stencil design. 8. Laser cutting apertures with trapezoidal walls and rounded corners may offer better paste release. IPC-7525 may have alternate

www.ti.com
MECHANICAL DATA
NS (R-PDSO-G**) PLASTIC SMALL-OUTLINE PACKAGE
14-PINS SHOWN
i
i i os [0,250
14 8
UGO O O
UP PO
0,15 NOM
560 8,20
5,00 7,40
Gage Plane v
UU GU O oO a
UU UU 0,25
1 7
0°-10° 1,05
A 0,55
0,15
seno Pine PF SL A
2,00 MAX Alo.10
e n | e po |a
A MAX 10,50 10,50 12,90 15,30
A MIN oo | oso 12,30 14,70
4040062/C 03/03
NOTES: A. AIl linear dimensions are in millimeters.
B. This drawing is subject to change without notice.
C. Body dimensions do not include mold flash or protrusion, not to exceed 0,15.
 TExas
INSTRUMENTS
www.ti.com
MECHANICAL DATA
W (R—-GDFP—F14) CERAMIC DUAL FLATPACK
Base and Seating Plane
0.260 (6,60)
0.045 (1,14) 0.235 (5,97)
0.026 (0,66)
LI
=== i
_ 0.008 020 Î
0.080 (2,03) 0.004 (0,10)
0.045 (1,14)
0.280 (7,11) MAX
0.019 (0,48)
1 14 0.015 (0,38)
I
o 0.050 (1,27)
0.390 (9,91) __] |
0.335 (8,51) ” a
————————i | —_ 0.005 (0,13) MIN
n 4 Places
7 8
0.360 (9,14 0.360 (9,14
0.250 (6,35 0.250 (6,35
4040180-2/F 04/14
NOTES: A. AIl linear dimensions are in inches (millimeters).
B. This drawing is subject to change without notice.
C. This package can be hermetically sealed with a ceramic lid using glass frit.
D. Index point is provided on cap for terminal identification only.
E. Falls within MIL STD 1835 GDFP1-F14
Sia Texas
INSTRUMENTS
www.ti.com
GENERIC PACKAGE VIEW

FK 20 LCCC - 2.03 mm max height
8.89 x 8.89, 1.27 mm pitch LEADLESS CERAMIC CHIP CARRIER

This image is a representation of the package family, actual package may vary.
Refer to the product data sheet for package details.
i À A_N * 4
4229370VA\
ip TExAs
INSTRUMENTS
www.ti.com
GENERIC PACKAGE VIEW
J 14 CDIP - 5.08 mm max height
CERAMIC DUAL IN LINE PACKAGE
1 a\ ra
| | Ì 4a
iI
U
Images above are just a representation of the package family, actual package may vary.
Refer to the product data sheet for package details.
4040083-5/G
dij TEXAS
INSTRUMENTS
## PACKAGE OUTLINE

# J0014A <u>CDIP - 5.08 mm max height</u>

SCALE 0.900 CERAMIC DUAL IN LINE PACKAGE

||PIN 1 ID|A 4X .005 MIN|[0.13]|-.060.015 TYP||
|---|---|---|---|---|---|
||(OPTIONAL)|||-1.520.38[]||
||1|||||
|12X .100||||||
|[2.54]||14X|-.065.045 -1.651.15[]|14X .010 [0.25]|-.026.014-0.660.36[] C A B|

-.785.754

19.15[-19.94]
7 8

|B|-.283.245|.2 MAX TYP|.13 MIN TYP|
|---|---|---|---|
||-7.196.22[] -.314.308 -7.977.83[]|[5.08] C|[3.3] SEATING PLANE|
|AT GAGE PLANE||||

.015 GAGE PLANE [0.38]
0 -15 14X .008-.014 TYP [0.2-0.36]

4214771/A 05/2017

NOTES:

1. All controlling linear dimensions are in inches. Dimensions in brackets are in millimeters. Any dimension in brackets or parenthesis are for reference only. Dimensioning and tolerancing per ASME Y14.5M.
2. This drawing is subject to change without notice.
3. This package is hermitically sealed with a ceramic lid using glass frit.
4. Index point is provided on cap for terminal identification only and on press ceramic glass frit seal only.
5. Falls within MIL-STD-1835 and GDIP1-T14.
www.ti.com
## EXAMPLE BOARD LAYOUT

# J0014A <u>CDIP - 5.08 mm max height</u>

||||||||CERAMIC DUAL IN LINE PACKAGE|
|---|---|---|---|---|---|---|---|
||SEE DETAIL A||||(.300) TYP [7.62]|SEE DETAIL B||
||1|||||14||
|MAX.002 [0.05] ALL AROUND|12X (.100) [2.54] 14X (.039) [1] 7 (.063) [1.6]||||SYMM LAND PATTERN EXAMPLE NON-SOLDER MASK DEFINED SCALE: 5X SOLDER MASK OPENING METAL|SYMM 8 METAL|(.063) [1.6]|
|(R.002) TYP [0.05]|DETAIL A SCALE: 15X|||||SOLDER MASK OPENING DETAIL B 13X, SCALE: 15X|.002 MAX [0.05] ALL AROUND 4214771/A 05/2017|

www.ti.com
MECHANICAL DATA
N (R-PDIP—T**) PLASTIC DUAL-IN-LINE PACKAGE
16 PINS SHOWN
i DEE
16 9
A MAX 0.775 0.775 0.920 1.060
7 (19,69) | (19,69) | (23,37) | (26,92)
0.260 (6,60) A MIN 0.745 0.745 0.850 0.940
|
i MS-001
1 i e 8
0.070 (1,78)
0.045 (1,14) A
0.045 (1,14) 0.325 (8,26)
UNA f___ \_ fe
VISIVI e IS +e Pe
Seating Plane
| 0.125 (3,18) MIN | | 0.010 (0,25) NOM
0.100 (2,54) n 0.430 (10,92) MAX e
0.021 (0,53)
0.015 (0,38) ‘7 >
0.010 (0,25) @ / \
| /
N 14/18 Pin Only
—-_ 20 Pin vendor option ZAN
4040049 /E 12/2002
NOTES: A. AIl linear dimensions are in inches (millimeters).
B. This drawing is subject to change without notice.
A Falls within JEDEC MS-001, except 18 and 20 pin minimum body length (Dim A).
A The 20 pin end lead shoulder width is a vendor option, either half or full width.
da
TEXAS
INSTRUMENTS
www.ti.com
## PACKAGE OUTLINE

# PW0014A <u>TSSOP - 1.2 mm max height</u>

SCALE 2.500 SMALL OUTLINE PACKAGE

SEATING PLANE <u>C</u>

6.6
6.2 TYP
<u>A</u>

<u>0.1 C</u>
PIN 1 INDEX AREA

12X 0.65 14 1

2X

5.1 3.9
4.9
NOTE 3

4X (0 -12 )

7 8 14X 0.30

0.17
4.5 1.2 MAX
<u>B 0.1 C A B</u>

4.3
NOTE 4

(0.15) TYP SEE DETAIL A

0.25
GAGE PLANE

0.15
0.05
0.75
0.50
0 -8A 20 DETAIL A TYPICAL

4220202/B 12/2023

NOTES:

1. All linear dimensions are in millimeters. Any dimensions in parenthesis are for reference only. Dimensioning and tolerancing per ASME Y14.5M.
2. This drawing is subject to change without notice.
3. This dimension does not include mold flash, protrusions, or gate burrs. Mold flash, protrusions, or gate burrs shall not exceed 0.15 mm per side.
4. This dimension does not include interlead flash. Interlead flash shall not exceed 0.25 mm per side.
5. Reference JEDEC registration MO-153.
www.ti.com
## EXAMPLE BOARD LAYOUT

# PW0014A <u>TSSOP - 1.2 mm max height</u>

|||||SMALL OUTLINE PACKAGE|
|---|---|---|---|---|
||1 14X (0.45)|14X (1.5)||SYMM (R0.05) TYP 14|
||12X (0.65)|||SYMM|
||7|||8|
|SOLDER MASK OPENING|METAL|||(5.8) LAND PATTERN EXAMPLE EXPOSED METAL SHOWN SCALE: 10X METAL UNDER SOLDER MASK SOLDER MASK OPENING|
|EXPOSED METAL|0.05 MAX ALL AROUND NON-SOLDER MASK DEFINED (PREFERRED)|||EXPOSED METAL 0.05 MIN ALL AROUND SOLDER MASK DEFINED 15.000 SOLDER MASK DETAILS 4220202/B 12/2023|

NOTES: (continued) 6. Publication IPC-7351 may have alternate designs. 7. Solder mask tolerances between and around signal pads can vary based on board fabrication site.

www.ti.com
## EXAMPLE STENCIL DESIGN

# PW0014A <u>TSSOP - 1.2 mm max height</u>

|||SMALL OUTLINE PACKAGE|
|---|---|---|
|1|14X (1.5)|SYMM (R0.05) TYP|
|14X (0.45)||14|
|||SYMM|
|12X (0.65)|||
|7||8 (5.8) SOLDER PASTE EXAMPLE BASED ON 0.125 mm THICK STENCIL SCALE: 10X 4220202/B 12/2023|

NOTES: (continued) design recommendations. 9. Board assembly site may have different recommendations for stencil design. 8. Laser cutting apertures with trapezoidal walls and rounded corners may offer better paste release. IPC-7525 may have alternate

www.ti.com
## IMPORTANT NOTICE AND DISCLAIMER

TI PROVIDES TECHNICAL AND RELIABILITY DATA (INCLUDING DATASHEETS), DESIGN RESOURCES (INCLUDING REFERENCE DESIGNS), APPLICATION OR OTHER DESIGN ADVICE, WEB TOOLS, SAFETY INFORMATION, AND OTHER RESOURCES “AS IS” AND WITH ALL FAULTS, AND DISCLAIMS ALL WARRANTIES, EXPRESS AND IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT OF THIRD PARTY INTELLECTUAL PROPERTY RIGHTS. These resources are intended for skilled developers designing with TI products. You are solely responsible for (1) selecting the appropriate TI products for your application, (2) designing, validating and testing your application, and (3) ensuring your application meets applicable standards, and any other safety, security, regulatory or other requirements. These resources are subject to change without notice. TI grants you permission to use these resources only for development of an application that uses the TI products described in the resource. Other reproduction and display of these resources is prohibited. No license is granted to any other TI intellectual property right or to any third party intellectual property right. TI disclaims responsibility for, and you fully indemnify TI and its representatives against any claims, damages, costs, losses, and liabilities arising out of your use of these resources. TI’s products are provided subject to TI’s Terms of Sale, TI’s General Quality Guidelines, or other applicable terms available either on ti.com or provided in conjunction with such TI products. TI’s provision of these resources does not expand or otherwise alter TI’s applicable warranties or warranty disclaimers for TI products. Unless TI explicitly designates a product as custom or customer-specified, TI products are standard, catalog, general purpose devices. TI objects to and rejects any additional or different terms you may propose. IMPORTANT NOTICE

Copyright © 2026, Texas Instruments Incorporated Last updated 10/2025