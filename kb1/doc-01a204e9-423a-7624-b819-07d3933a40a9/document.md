# STM32F103xC, STM32F103xD, STM32F103xE

® High-density performance line Arm-based 32-bit MCU with 256 to 512KB Flash, USB, CAN, 11 timers, 3 ADCs, 13 communication interfaces

### Datasheet − production data

## Features

- Core: Arm® 32-bit Cortex®-M3 CPU

||WLCSP64|
|---|---|
|LQFP64 10 × 10 mm,||
|LQFP100 14 × 14 mm,|LFBGA100 10 × 10 mm|
|LQFP144 20 × 20 mm|LFBGA144 10 × 10 mm|
 – 72 MHz maximum frequency, 1.25 DMIPS/MHz (Dhrystone 2.1) performance at 0 wait state memory access – Single-cycle multiplication and hardware division • Up to 11 timers
– Up to four 16-bit timers, each with up to 4

- Memories
IC/OC/PWM or pulse counter and quadrature – 256 to 512 Kbytes of Flash memory (incremental) encoder input – up to 64 Kbytes of SRAM – 2 × 16-bit motor control PWM timers with dead- – Flexible static memory controller with 4 Chip time generation and emergency stop Select. Supports Compact Flash, SRAM, – 2 × watchdog timers (Independent and Window) PSRAM, NOR and NAND memories – SysTick timer: a 24-bit downcounter – LCD parallel interface, 8080/6800 modes – 2 × 16-bit basic timers to drive the DAC

- Clock, reset and supply management
- Up to 13 communication interfaces
– 2.0 to 3.6 V application supply and I/Os2 – Up to 2 × I C interfaces (SMBus/PMBus) – POR, PDR, and programmable voltage detector – Up to 5 USARTs (ISO 7816 interface, LIN, IrDA (PVD) capability, modem control) – 4-to-16 MHz crystal oscillator2 – Up to 3 SPIs (18 Mbit/s), 2 with I S interface – Internal 8 MHz factory-trimmed RC multiplexed – Internal 40 kHz RC with calibration – CAN interface (2.0B Active) – 32 kHz oscillator for RTC with calibration – USB 2.0 full speed interface

- Low power – SDIO interface – Sleep, Stop and Standby modes
- CRC calculation unit, 96-bit unique ID
–VBAT supply for RTC and backup registers ®

- ECOPACK packages
- 3 × 12-bit, 1 µs A/D converters (up to 21 channels)
**Table 1.Device summary**
 – Conversion range: 0 to 3.6 V
### Reference Part number

– Triple-sample and hold capability – Temperature sensor STM32F103RC STM32F103VC STM32F103xC

- 2 × 12-bit D/A converters STM32F103ZC
- DMA: 12-channel DMA controller STM32F103RD STM32F103VD
STM32F103xD – Supported peripherals: timers, ADCs, DAC, STM32F103ZD 2 2 SDIO, I Ss, SPIs, I Cs and USARTs STM32F103RE STM32F103ZE STM32F103xE

- Debug mode STM32F103VE – Serial wire debug (SWD) & JTAG interfaces
® –Cortex-M3 Embedded Trace Macrocell™

- Up to 112 fast I/O ports – 51/80/112 I/Os, all mappable on 16 external interrupt vectors and almost all 5 V-tolerant
### July 2018 DS5792 Rev 13 1/143

*www.st.com*
Contents STM32F103xC, STM32F103xD, STM32F103xE
Contents

1 Introduction ...... aaa aa 9

2 Description... aaa aaa aa 2... 10

2.1 Device overview ..... aaa. 11

2.2 Full compatibility throughout the family .............. 1.1... 14

2.3 Overview... aa... 15

2.3.1 Arm® Cortex®-M3 core with embedded Flash and SRAM ..........15

2.3.2 Embedded Flash memory ..... aaa aaa aaa... 15

2.3.3 CRC (cyclic redundancy check) calculation unit ..................15

2.3.4 Embedded SRAM ...... aa aaa aa aaa aaa aa aaa... 15

2.3.5 FSMC (flexible static memory controller) ............ 1.1... 1... 15

2.3.6 LCD parallel interface aaa... 16

2.3.7 Nested vectored interrupt controller (NVIC) ......................16

2.3.8 External interrupt/event controller (EXTI) .......................16

2.3.9 Clocks and startup ...... aaa... 16

2.3.10 Boot modes ....... ai 47

2.3.11 Power supply schemes ..... aaa aaa aa aa aaa aaa 7

2.3.12 Power supply supervisor .... aaa aaa aaa aaa 7

2.3.13 Voltage regulator ....... aaa 7

2.3.14  Low-power modes ...... aaa aaa... 18

2.39.15 DMA..... a a aaa... 18

2.3.16  RTC (real-time clock) and backup registers ......................18

2.3.17  Timers and watchdogs ......... ai... 19

2.39.18. IPC bus... aaa... 21

2.3.19 Universal synchronous/asynchronous receiver transmitters (USARTsS) 21

2.3.20 Serial peripheral interface (SP)... aaa... 21

2.3.21 Inter-integrated sound (128) ....... iu. i iaia iaia. 21

2.38.22  SDIO aa. 22

2.3.23 Controller area network (CAN) ........ aaa aaa aaa... 22

2.3.24 Universal serial bus (USB) ....... a aaa aa... 22

2.3.25  GPIOs (general-purpose inputs/outputs) .............. 1... 1.1... . 22

2.39.26 ADC (analog to digital converter) ........ 11... 22

2.3.27  DAC (digital-to-analog converter) ........ 11.1. 23

2.3.28 Temperature sensor...... ada. 24

2/143 DS5792 Rev 13 £y7
STM32F103xC, STM32F103xD, STM32F103xE Contents
2.3.29 Serial wire JTAG debug port (SWJ-DP) .............. 1.1.1... 24

2.39.30 Embedded Trace MacrocellTM aa... 24

3 Pinouts and pin descriptions .......... aaa aaa aaa 1 1. 2D
4 Memory mapping ...... ssaa a aaa a. . 40
5 Electrical characteristics ........ aaa aaa aaa... 41
5.1 Parameter conditions ..... aaa aaa... 41

5.1.1 Minimum and maximum values .......... aaa... 41

5.1.2 Typical values... aaa aaa. 41

5.1.3 Typical curves ... aaa. 41

5.1.4 Loading capacitor ...... aaa aaa. 41

5.1.5 Pin input voltage ..... aaa aaa. 4A

5.1.6 Power supply scheme ..... a aaa aaa aaa aaa... 42

5.1.7 Current consumption measurement ................ 1.111... . 42

5.2 Absolute maximum ratings .......... dda... 43

5.3 Operating conditions ..... a. 44

5.3.1 General operating conditions ........ a. 44

5.3.2 Operating conditions at power-up / power-down ..................45

5.3.3 Embedded reset and power control block characteristics ...........45

5.3.4 Embedded reference voltage .......... iaia... 46

5.3.5 Supply current characteristics .......... i... . 46

5.3.6 External clock source characteristics ................. 1... 1... 58

5.3.7 Internal clock source characteristics ................ 1.1... 1. 62

5.3.8 PLL characteristics ...... da... 64

5.3.9 Memory characteristics ...... ai. 64

5.3.10  FSMC characteristics ..... a... . 66

5.3.11 EMPC characteristics ..... a... 86

5.3.12 Absolute maximum ratings (electrical sensitivity) .................87

5.3.13  1/O current injection characteristics ........... 1.1... 1... 88

5.3.14  1/O port characteristics... ... 1... 89

5.3.15  NRST pin characteristics ..... i... 94

5.3.16 TIM timer characteristics ........ 1... 95

5.3.17 Communications interfaces ..... 2... . 96

5.3.18 CAN (controller area network) interface ........................ 106

5.3.19  12-bit ADC characteristics ....... i... . 106

£y7 DS5792 Rev 13 3/143
Contents STM32F103xC, STM32F103xD, STM32F103xE
5.3.20  DAC electrical specifications ...... aa... 111

5.3.21 Temperature sensor characteristics ........... 1... 113

6 Package information ...... aaa aaa aaa aa aaa a aaa aaa. 114
6.1 LFBGA144 package information ........ a... 114

6.2 LFBGA100 package information... ..... a. 1147

6.3 WLCSP64 package information ........... 1.1... . 120

6.4 LQFP144 package information .......... 1.11... . 122

6.5 LQFP100 package information ........... 1.1... . 126

6.6 LQFP64 package information ......... 1.1... . 129

6.7 Thermal characteristics ........ da... 132

6.7.1 Reference document ......... aaa aaa aaa aaa... 132

6.7.2 Selecting the product temperature range ....................... 133

7 Ordering information ..... aa a a aa aa. 135
8 Revision history .... aaa aaa aa aaa aa aaa... 136
ans DssT2Re1 7
STM32F103xC, STM32F103xD, STM32F103xE List of tables
List of tables
Table 1. Device summary... .. aaa aaa aaa 1
Table 2. STM32F103xC, STM32F103xD and STM32F103xE features

and peripheral counts....... di aaa. 11
Table 3. STM32F103xx family .... dd aaa. 14
Table 4. High-density timer feature comparison. ........ aa... 19
Table 5. High-density STM32F103xC/D/E pin definitions. ......... i... 31
Table 6. FSMC pin definition... .. aa aa... 38
Table 7. Voltage characteristics ....... a... 43
Table 8. Current characteristics ...... a. 43
Table 9. Thermal characteristics. ..... a. 44
Table 10. General operating conditions ...... a. 44
Table 11. Operating conditions at power-up / power-down ......... aaa... 45
Table 12. Embedded reset and power control block characteristics. ......................... 45
Table 13. Embedded internal reference voltage. ...... a aaa aaa aaa aaa... 46
Table 14. | Maximum current consumption in Run mode, code with data processing

running from Flash... . aaa aaa. 47
Table 15. | Maximum current consumption in Run mode, code with data processing

running from RAM... aaa aaa aaa aa. 47
Table 16. | Maximum current consumption in Sleep mode, code running from Flash or RAM.......49
Table 17. Typical and maximum current consumptions in Stop and Standby modes ............50
Table 18. Typical current consumption in Run mode, code with data processing

running from Flash... . aaa aaa aaa. 53
Table 19. Typical current consumption in Sleep mode, code running from Flash or
Table 20. Peripheral current consumption ..... dada aa. . 55
Table 21. | High-speed external user clock characteristics. ............. 111111111... 1... 58
Table 22.  Low-speed external user clock characteristics ......... a 111111... 1... 58
Table 23. | HSE 4-16 MHz oscillator characteristics. ...... aa... 1. . 60
Table 24.  LSE oscillator characteristics (fi sg = 32.768 kHz) .......... iii iii 1111... 61
Table 25.  HSI oscillator characteristics. ..... aa... 62
Table 26.  LSI oscillator characteristics ..... aaa... 63
Table 27. | Low-power mode wakeup timings ......... aaa aaa... 63
Table 28. PLL characteristics ...... dda aaa... 64
Table 29. Flash memory characteristics... .... adi... 64
Table 30. Flash memory endurance and data retention. ........... aaa... 1. 65
Table 31. | Asynchronous non-multiplexed SRAM/PSRAM/NOR read timings ..................67
Table 32. | Asynchronous non-multiplexed SRAM/PSRAM/NOR write timings ..................68
Table 33. | Asynchronous multiplexed PSRAM/NOR read timings. ........................... 69
Table 34. | Asynchronous multiplexed PSRAM/NOR write timings ................. 1... 1... . 70
Table 35. Synchronous multiplexed NOR/PSRAM read timings ............ 1.11.11... 72
Table 36. Synchronous multiplexed PSRAM write timings........... aaa aaa. 74
Table 37. Synchronous non-multiplexed NOR/PSRAM read timings...................... 1... 75
Table 38. Synchronous non-multiplexed PSRAM write timings ............... 1.1.1... 1... 76
Table 39. Switching characteristics for PC Card/CF read and write cycles ....................81
Table 40. Switching characteristics for NAND Flash read and write cycles....................85
Table 41. | EMBS characteristics ...... aaa... 86
Table 42. EMI characteristics ...... dda aaa. 87
Table 43. ESD absolute maximum ratings .......... aaa. 87
£y7 D$5792 Rev 13 5/143
List of tables STM32F103xC, STM32F103xD, STM32F103xE
Table 44. Electrical sensitivities ........ aaa... 88
Table 45. 1/O current injection susceptibility ....... aa... 88
Table 46. _ 1/O static characteristics ..... a... 89
Table 47. Output voltage characteristics ....... a... 91
Table 48.  |/O AC characteristics... .. a... 93
Table 49. | NRST pin characteristics ...... aa. 94
Table 50.  TIMx characteristics ...... da. 95
Table 51. 1°C characteristics... ai... 96
Table 52.  SCL frequency (frcLk1= 36 MHz.,Vpp_i2c=3.3V) ... aaa aaa aaa aaa. 97
Table 53.  SPI characteristics ...... aaa... 98
Table 54.  1?S characteristics. .... ia. . 101
Table 55. SD /MMC characteristics... .... a aaa... 103
Table 56. USB startup time. ..... da aaa... 104
Table 57. USB DC electrical characteristics... .... aaa... 105
Table 58. USB: full-speed electrical characteristics ...... aaa... 105
Table 59. | ADC characteristics ...... da a aaa aaa... 106
Table 60. Ran max for fapc = 14 MHz... aaa aaa aaa... 107
Table 61. ADC accuracy - limited test conditions... ... aaa aa... 107
Table 62. | ADC accuracy ..... ada a aaa aaa... 108
Table 63. | DAC characteristics ..... aaa... 111
Table 64. TS characteristics... .. aa. 113
Table 685. | LFBGA144 — 144-ball low profile fine pitch ball grid array, 10 x 10 mm,

0.8 mm pitch, package mechanical data ....... a. aaa aaa aaa... 114
Table 66. | LFBGA144 recommended PCB design rules (0.8 mm pitch BGA). .................115
Table 67. | LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package

mechanical data ...... aa aaa. 147
Table 68. | LFBGA100 recommended PCB design rules (0.8 mm pitch BGA). .................118
Table 69. | WLCSP, 64-ball 4.466 x 4.395 mm, 0.500 mm pitch, wafer-level chip-scale

package mechanical data. ...... aaa aaa aaa aaa... . 120
Table 70. | WLCSP64 recommended PCB design rules (0.5 mm pitch) ......................121
Table 71. | LQFP144 - 144-pin, 20 x 20 mm low-profile quad flat package

mechanical data ...... aaa... 123
Table 72. | LQPF100 — 14 x 14 mm 100-pin low-profile quad flat package

mechanical data ...... aaa aaa... 126
Table 73. | LQFP64 — 10 x 10 mm 64 pin low-profile quad flat package mechanical data.........129
Table 74. Package thermal characteristics. ...... dda aaa aaa aaa... 132
Table 75.  Ordering information scheme........ aaa... 135
6/143 D$5792 Rev 13 £y7
STM32F103xC, STM32F103xD, STM32F103xE List of figures
List of figures
Figure 1. STM32F103xC, STM32F103xD and STM32F103xE performance line block diagram ...12
Figure 2.  Clocktree.... aaa a aaa. 13
Figure 3. | STM32F103xC/D/E BGA144 ballout ......... aaa aaa aaa... 25
Figure 4. | STM32F103xC/D/E performance line BGA100 ballout............................ 26
Figure 5. | STM32F103xC/D/E performance line LQFP144 pinout............ 1.111.111... 27
Figure 6. | STM32F103xC/D/E performance line LQFP100 pinout........................... 28
Figure 7. | STM32F103xC/D/E performance line LQFP64 pinout.................. 1.1... 1.1... 29
Figure 8.  STM32F103xC/D/E performance line

WLCSP64 ballout, ball side ..... a... 30
Figure 9. Memory map..... aaa aaa aaa a aa aaa... 40
Figure 10. Pin loading conditions. ....... ada aaa aaa. 41
Figure 11. Pin input voltage. ..... aaa aaa aaa aaa. 41
Figure 12. Power supply scheme... aaa aaa aaa a aaa aaa aaa aaa... 42
Figure 13. Current consumption measurement scheme ......... a iaia aaa iaia... 42
Figure 14. Typical current consumption in Run mode versus frequency (at 3.6 V) -

code with data processing running from RAM, peripherals enabled .................48
Figure 15. Typical current consumption in Run mode versus frequency (at 3.6 V)-

code with data processing running from RAM, peripherals disabled ................48
Figure 16. Typical current consumption on Vear with RTC on vs. temperature

at different Vear values. ...... dd... 51
Figure 17. Typical current consumption in Stop mode with regulator in run mode

versus temperature at different Vpp values ........ iii... 51
Figure 18. Typical current consumption in Stop mode with regulator in low-power

mode versus temperature at different Vpp values ............. 111.1... 1.52
Figure 19. Typical current consumption in Standby mode versus temperature at

different Vpp values ...... da... 52
Figure 20. High-speed external clock source AC timing diagram ............. 1.1... . 59
Figure 21. Low-speed external clock source AC timing diagram................. 1... 59
Figure 22. Typical application with an 8 MHz crystal. ....... iaia aaa... 1. 60
Figure 23. Typical application with a 32.768 kHz crystal... . i. aaa... 1. 62
Figure 24. Asynchronous non-multiplexed SRAM/PSRAM/NOR read waveforms ...............66
Figure 25. Asynchronous non-multiplexed SRAM/PSRAM/NOR write waveforms ...............67
Figure 26. Asynchronous multiplexed PSRAM/NOR read waveforms. ........................68
Figure 27. Asynchronous multiplexed PSRAM/NOR write waveforms ........................ 70
Figure 28. Synchronous multiplexed NOR/PSRAM read timings ............. 1.1... 71
Figure 29. Synchronous multiplexed PSRAM write timings......... dada... 73
Figure 30. Synchronous non-multiplexed NOR/PSRAM read timings.................... 1... . 75
Figure 31. Synchronous non-multiplexed PSRAM write timings ............... 1.1.1... 1... 76
Figure 32. PC Card/CompactFlash controller waveforms for common memory read access.......77
Figure 33. PC Card/CompactFlash controller waveforms for common memory write access.......78
Figure 34. PC Card/CompactFlash controller waveforms for attribute memory read

access... aa. 79
Figure 35. PC Card/CompactFlash controller waveforms for attribute memory write

access... aaa... 80
Figure 36. PC Card/CompactFlash controller waveforms for I/O space read access .............80
Figure 37. PC Card/CompactFlash controller waveforms for I/O space write access.............81
Figure 38. NAND controller waveforms for read access ....... aaa aaa aaa aaa... 83
Figure 39. NAND controller waveforms for write access ........ iii aaa aaa... 84
£y7 DS5792 Rev 13 7/143
List of figures STM32F103xC, STM32F103xD, STM32F103xE
Figure 40. | NAND controller waveforms for common memory read access.....................84
Figure 41. | NAND controller waveforms for common memory write access. ....................85
Figure 42. Standard l/O input characteristics - CMOS port... .... a... 1. . 90
Figure 43. Standard l/O input characteristics - TTL port ......... ia... 1... 90
Figure 44. 5 V tolerant 1//O input characteristics - CMOS port ........ 1.1.1... 1. . 90
Figure 45. 5 V tolerant 1//O input characteristics - TTL port ......... aaa... 91
Figure 46. 1/O AC characteristics definition ...... dda... 94
Figure 47. Recommended NRST pin protection ...... aaa... 95
Figure 48. 1°?C bus AC waveforms and measurement circuit. ....... aa dada iaia. 97
Figure 49. SPI timing diagram - slave mode and CPHA=0......... aaa au aaa iaia... . 99
Figure 50.  SPI timing diagram - slave mode and CPHA = 10)... iau aaa aaa ai iaia 111111. 99
Figure 51. SPI timing diagram - master mode!) ...... iaia iaia iaia... 11. 100
Figure 52. 128 slave timing diagram (Philips protocol) (1) sea aaa... 102
Figure 53. 12S master timing diagram (Philips protocol) (1). se aaa... 102
Figure 54. SDIO high-speed mode ....... ia aa aaa aaa... 103
Figure 55. SD default mode...... aaa aaa... 103
Figure 56. USB timings: definition of data signal rise and fall time .......................... 105
Figure 57. ADC accuracy characteristics. ..... aaa aaa aa... . 108
Figure 58. Typical connection diagram using the ADC ........ a. aaa aa aa aaa... . 109
Figure 59. Power supply and reference decoupling (Vrer+ not connected to Vppa). ............ 109
Figure 60. Power supply and reference decoupling (Vrer, connected to Vppa). ...............110
Figure 61. 12-bit buffered /non-buffered DAC ...... aaa aa aaa aaa aaa... 112
Figure 62. LFBGA144 — 144-ball low profile fine pitch ball grid array, 10 x 10 mm,

0.8 mm pitch, package outline ....... aaa... 114
Figure 63. LFBGA144 — 144-ball low profile fine pitch ball grid array, 10 x 10 mm,

0.8 mm pitch, package recommended footprint.......... aaa... 115
Figure 64. LFBGA144 marking example (package top view) ............ a... 2... 116
Figure 65. LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package

outline.... a aaa. 117
Figure 66. | LFBGA100 — 100-ball low profile fine pitch ball grid array, 10 x 10 mm,

0.8 mm pitch, package recommended footprintoutline. .......................... 118
Figure 67. LFBGA100 marking example (package top view) .......... aaa... 119
Figure 68. | WLCSP, 64-ball 4.466 x 4.395 mm, 0.500 mm pitch, wafer-level chip-scale

package outline. .... da aaa aaa... 120
Figure 69. | WLCSP64 - 64-ball, 4.4757 x 4.4049 mm, 0.5 mm pitch wafer level chip scale

package recommended footprint ........ aaa aaa... 121
Figure 70. LQFP144 - 144-pin, 20 x 20 mm low-profile quad flat package outline ..............122
Figure 71. LQFP144 - 144-pin,20 x 20 mm low-profile quad flat package

recommended footprint. ..... dia aa... 124
Figure 72. LQFP144 marking example (package top view) ......... aaa... . 125
Figure 73. LQFP100 — 14 x 14 mm 100 pin low-profile quad flat package outline ..............126
Figure 74. LQFP100 recommended footprint ........ aaa aaa aa aaa aaa... 127
Figure 75. LQFP100 marking example (package top view) ............... 1.1.1... 1... 128
Figure 76. LQFP64 — 10 x 10 mm 64 pin low-profile quad flat package outline ................129
Figure 77. LQFP64 - 64-pin, 10 x 10 mm low-profile quad flat recommended footprint ..........130
Figure 78. LQFP64 marking example (package top view) ....... aaa aaa aaa aa... 131
Figure 79. LQFP100 Pp max vs. Ta .... iaia aa aa aaa aa aaa aa aa aaa aaa. 134
8/143 D$5792 Rev 13 £y/7
||STM32F103xC, STM32F103xD, STM32F103xE 1 Introduction||Introduction|
|---|---|---|---|
||family, please refer to please refer to the STMicroelectronics website [http://infocenter.arm.com](http://infocenter.arm.com) a.|This datasheet provides the ordering information and mechanical device characteristics of the STM32F103xC, STM32F103xD and STM32F103xE high-density performance line microcontrollers. For more details on the whole STMicroelectronics STM32F103xC/D/E Section 2.2: Full compatibility throughout the family The high-density STM32F103xC/D/E datasheet should be read in conjunction with the STM32F10xxx reference manual. For information on programming, erasing and protection of the internal Flash memory STM32F10xxx Flash programming manual. The reference and Flash programming manuals are both available from the www.st.com. For information on the Arm®(a) Cortex®-M3 core please refer to the Cortex®-M3 Technical Reference Manual, available from the www.arm.com. Arm is a registered trademark of Arm Limited (or its subsidiaries) in the US and/or elsewhere. DS5792 Rev 13|. website at the following address: 9/143 135|
## <u>Description STM32F103xC, STM32F103xD, STM32F103xE</u>

# 2 Description

The STM32F103xC, STM32F103xD and STM32F103xE performance line family incorporates the high-performance Arm® Cortex®-M3 32-bit RISC core operating at a 72 MHz frequency, high-speed embedded memories (Flash memory up to 512 Kbytes and SRAM up to 64 Kbytes), and an extensive range of enhanced I/Os and peripherals connected to two APB buses. All devices offer three 12-bit ADCs, four general-purpose 16- bit timers plus two PWM timers, as well as standard and advanced communication interfaces: up to two I2Cs, three SPIs, two I2Ss, one SDIO, five USARTs, an USB and a CAN.

The STM32F103xC/D/E high-density performance line family operates in the –40 to +105 °C temperature range, from a 2.0 to 3.6 V power supply. A comprehensive set of power-saving mode allows the design of low-power applications.

These features make the STM32F103xC/D/E high-density performance line microcontroller family suitable for a wide range of applications such as motor drives, application control, medical and handheld equipment, PC and gaming peripherals, GPS platforms, industrial applications, PLCs, inverters, printers, scanners, alarm systems video intercom, and HVAC.

<u>10/143 DS5792 Rev 13</u>
## STM32F103xC, STM32F103xD, STM32F103xE Description

|2.1 Device overview Figure 1|peripherals proposed in this family.|shows the general block diagram of the device family.|The STM32F103xC/D/E high-density performance line family offers devices in six different package types: from 64 pins to 144 pins. Depending on the device chosen, different sets of peripherals are included, the description below gives an overview of the complete range of Table 2. STM32F103xC, STM32F103xD and STM32F103xE features and peripheral counts|||||
|---|---|---|---|---|---|---|---|
||Peripherals||STM32F103Rx||STM32F103Vx||STM32F103Zx|
||Flash memory in Kbytes|256|384 512|256|384 512|256|384 512|
|SRAM in Kbytes||48|64|48|64|48|64|
|FSMC|General-purpose||No||(1) Yes 4||Yes|
|Timers|Advanced-control Basic 2 (2) SPI(I S)||||2 2 3(2)|||
||2 I USART||||C2 5|||
|Comm|USB CAN SDIO||||1 1 1|||
|GPIOs|||51||80||112|
|12-bit ADC|Number of channels||3 16||3 16||3 21|
|12-bit DAC|Number of channels||||2 2|||
|CPU frequency|||||72 MHz|||
|Operating voltage|||||2.0 to 3.6 V|||
||Operating temperatures|||Ambient temperatures: –40 to +85 °C /–40 to +105 °C (see Junction temperature: –40 to + 125 °C (see||Table 10|Table 10))|
|Package|||LQFP64, WLCSP64||LQFP100, BGA100||LQFP144, BGA144|
|1. 2. 2|not available in this package. The SPI2 and SPI3 interfaces give the flexibility to work I S audio mode.||For the LQFP100 and BGA100 packages, only FSMC Bank1 and Bank2 are available. Bank1 can only support a multiplexed NOR/PSRAM memory using the NE1 Chip Select. Bank2 can only support a 16- or 8-bit NAND Flash memory using the NCE2 Chip Select. The interrupt line cannot be used since Port G is DS5792 Rev 13||in an exclusive way in either the SPI mode or the||11/143|
## Description

## STM32F103xC, STM32F103xD, STM32F103xE

**Figure 1. STM32F103xC, STM32F103xD and STM32F103xE performance line block diagram**

42!#%#,+ 42!#%$;=

|||40)5|||||||||||||||||||||||||||||||||||||||||||6$$|
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|||37*4!’ #ORTEX-#05|&MAX-(Z ’0)/PORT! ’0)/PORT" ’0)/PORT#||%84)4 7+50|.6)# ’0$-! CHANNELS ’0$-! CHANNELS|4RACETRIG||&3-# 3$)/|||3YSTEM|$BUS|0BUS||)BUS|"US-ATRIX|!(" !0"|4RACE CONTROLLER|||OBL &LASH !("&MAX-(Z|INTERFACE !(" !0"|32!-|&LASH+BYTES +" 2ESET #LOCK CONTROL|BIT||||0#,+ 0#,+ (#,+ &#,+||6$$! 2#-(Z 2#K(Z|0,,|||-(Z|0/2 2ESET|6$$ )NT||||"ACKUPINTERFACE|24# !75|6OLTREG 6TO6 3UPPLY SUPERVISION 0/20$2 3TANDBY INTERFACE 53!24|0OWER 6 $$! 06$ 6 84!,/3# -(Z )7$’ 84!,K(Z "ACKUP 4)- 4)- 4)- 4)-|
||||’0)/PORT$ ’0)/PORT% ’0)/PORT& ’0)/PORT’|53!24|4)- 4)-|30)|||||||||||!0"&MAX-(Z|||||||||32!-"|77$’|||||||||!0"&|MAX||||XXB XXB|BX#!.DEVICE|30))3 30))3|53!24|5!24 5!24 IT IT )# )#|
||||4EMPSENSOR BIT!$# BIT!$# BIT!$# 6|||$$!|||)& )& )&||||||||||||||||||4)- 4)-|||||||||||||||)& )& )&|53"&3 DEVICE 6$$!|BIT$!# BIT$!#||

AS!3

.*4234 *4$)
*4#+37#,+ *4-337$)/ *4$/ AS!&

!;= $;= #,+

.7% ./%
.%;= .",;=

.7!)4
.,OR.!$6 AS!& $;= #-$ #+AS!&

!& 0!;=

0";= 0#;= 0$;= 0%;= 0&;= 0’;= CHANNELS COMPLCHANNELS "+).%42AS!& CHANNELS COMPLCHANNELS "+).%42AS!& -/3)-)3/ 3#+.33AS!& 2848#43 243#+AS!&

.234 6 6$$! 33!
$$ /3#?). /3#?/54

6"!4 6TO6 6"!4 /3#?). /3#?/54 REG!,!2-3%#/.$/54 4!-0%224#

CHANNELS%42AS!& CHANNELS%42AS!&

CHANNELS%42AS!& CHANNELSAS!& 2848 #+AS!& #43243 2848#43243 #+AS!& 2848AS!& 2848AS!& -/3)3$-)3/ 3#+#+-#+.3373AS!& -/3)3$-)3/ 3#+#+-#+.3373AS!& 3#,3$!3-"!AS!& 3#,3$!3-"!AS!&

53"?$0#!.?48 53"?$-#!.?28

$!#?/54AS!& $!#?/54AS!& !$#?).S COMMONTOTHE!$#S !$#?).SCOMMON TO!$#!$# !$#?).SON!$# 6 2%&n 6 2%&

2. AF = alternate function on I/O port pin.9
12/143

AIG

DS5792 Rev 13

1. TA = –40 °C to +85 °C (suffix 6, see *Table 75*) or –40 °C to +105 °C (suffix 7, see *Table 75*), junction temperature up to 105 °C or 125 °C, respectively.
## STM32F103xC, STM32F103xD, STM32F103xE Description

**Figure 2. Clock tree**

)/,7)&/. WR)ODVKSURJUDPPLQJLQWHUIDFH
86% 0+] 86%&/. 3UHVFDOHU WR86%LQWHUIDFH

,6&/. WR,6 3HULSKHUDOFORFN HQDEOH,6&/. WR,6 3HULSKHUDOFORFN 6’,2&/. HQDEOH WR6’,2 0+] 3HULSKHUDOFORFN +6,5& +6, HQDEOH

)60&&/. WR)60&
3HULSKHUDOFORFN HQDEOH +&/. 0+]PD[ WR$+%EXVFRUH &ORFN PHPRU\DQG’0$ (QDEOHELWV WR&RUWH[6\VWHPWLPHU 3//65& 6: 3//08/)&/.&RUWH[ +6, IUHHUXQQLQJFORFN [ 6<6&/. $+% $3% 0+]PD[ 3&/. [[[ 3//&/. 0+] 3UHVFDOHU 3UHVFDOHU WR$3% 3// PD[ 3HULSKHUDO&ORFN SHULSKHUDOV +6( (QDEOHELWV 7,0 ,I$3%SUHVFDOHU [ WR7,0DQG &66 HOVH [ 7,0;&/. 3HULSKHUDO&ORFN (QDEOHELWV 3//;735( $3% 0+]PD[ 3&/. 3UHVFDOHU 26&B287 0+] 3HULSKHUDO&ORFN SHULSKHUDOVWR$3% +6(26& (QDEOHELWV 26&B,1 7,0WLPHUV WR7,0DQG7,0 ,I$3%SUHVFDOHU [ HOVH[ 7,0[&/. 3HULSKHUDO&ORFN (QDEOHELW $’& WR$’&RU 26&B,1 WR57& 3UHVFDOHU /6(26& /6( $’&&/. N+] 57&&/. 26&B287 +&/. 57&6(/>@ 7R6’,2$+%LQWHUIDFH 3HULSKHUDOFORFN WR,QGHSHQGHQW:DWFKGRJ,:’* /6,5& <u>/6,</u> HQDEOH N+],:’*&/.

0DLQ 3//&/. **/HJHQG** &ORFN2XWSXW +6( +LJK6SHHG([WHUQDOFORFNVLJQDO 0&2 +6, +6, +LJK6SHHG,QWHUQDOFORFNVLJQDO +6( /6, /RZ6SHHG,QWHUQDOFORFNVLJQDO 6<6&/. /6( /RZ6SHHG([WHUQDOFORFNVLJQDO 0&2 DLE

1. When the HSI is used as a PLL clock input, the maximum system clock frequency that can be achieved is 64 MHz.
2. For the USB function to be available, both HSE and PLL must be enabled, with the USBCLK at 48 MHz.
3. To have an ADC conversion time of 1 µs, APB2 must be at 14 MHz, 28 MHz or 56 MHz.
DS5792 Rev 13 13/143
## Description STM32F103xC, STM32F103xD, STM32F103xE

|||2.2 Full compatibility referred to as high-density devices.|remaining fully compatible with the other members of the family. STM32F101xx access line and STM32F102xx USB access line devices.|throughout the family The STM32F103xC/D/E is a complete family whose members are fully pin-to-pin, software and feature compatible. In the reference manual, the STM32F103x4 and STM32F103x6 are identified as low-density devices, the STM32F103x8 and STM32F103xB are referred to as medium-density devices and the STM32F103xC, STM32F103xD and STM32F103xE are Low-density and high-density devices are an extension of the STM32F103x8/B medium- density devices, they are specified in the STM32F103x4/6 and STM32F103xC/D/E datasheets, respectively. Low-density devices feature lower Flash memory and RAM capacities, less timers and peripherals. High-density devices have higher Flash memory and RAM capacities, and additional peripherals like SDIO, FSMC, I2S and DAC while The STM32F103x4, STM32F103x6, STM32F103xC, STM32F103xD and STM32F103xE are a drop-in replacement for the STM32F103x8/B devices, allowing the user to try different memory densities and providing a greater degree of freedom during the development cycle. Moreover, the STM32F103xx performance line family is fully compatible with all existing Table 3. STM32F103xx family||||
|---|---|---|---|---|---|---|---|
||Low-density devices||Medium-density devices|||High-density devices||
|Pinout|16 KB Flash|32 KB (1) Flash|64 KB Flash|128 KB Flash|256 KB Flash|384 KB Flash|512 KB Flash|
|144|6 KB RAM|10 KB RAM|20 KB RAM|20 KB RAM|48 RAM 5 × USARTs|64 KB RAM|64 KB RAM|
|100|||3 × USARTs||3 × SPIs, 2 × I|4 × 16-bit timers, 2 × basic timers 2 Ss, 2 × I2Cs||
|64|2 × USARTs 2 × 16-bit timers 2 1 × SPI, 1 × I C, USB, CAN,||3 × 16-bit timers 2 × SPIs, 2 × I CAN, 1 × PWM timer|2 Cs, USB,|USB, CAN, 2 × PWM timers|3 × ADCs, 2 × DACs, 1 × SDIO FSMC (100- and 144-pin packages|(2))|
|48 36|1 × PWM timer 2 × ADCs||2 × ADCs|||||
|1. 2. 14/143||Ports F and G are not available in devices delivered in 100-pin packages.|datasheet for electrical characteristics is that of the STM32F103x8/B medium-density devices.|For orderable part numbers that do not show the A internal code after the temperature range code (6 or 7), the reference DS5792 Rev 13||||
### <u>STM32F103xC, STM32F103xD, STM32F103xE Description</u>

# 2.3 Overview

## 2.3.1 Arm® Cortex®-M3 core with embedded Flash and SRAM

The Arm Cortex®-M3 processor is the latest generation of Arm processors for embedded systems. It has been developed to provide a low-cost platform that meets the needs of MCU implementation, with a reduced pin count and low-power consumption, while delivering outstanding computational performance and an advanced system response to interrupts. The Arm Cortex®-M3 32-bit RISC processor features exceptional code-efficiency, delivering the high-performance expected from an Arm core in the memory size usually associated with 8- and 16-bit devices. With its embedded Arm core, STM32F103xC, STM32F103xD and STM32F103xE performance line family is compatible with all Arm tools and software.

*Figure 1* shows the general block diagram of the device family.

## 2.3.2 Embedded Flash memory

Up to 512 Kbytes of embedded Flash is available for storing programs and data.

## 2.3.3 CRC (cyclic redundancy check) calculation unit

The CRC (cyclic redundancy check) calculation unit is used to get a CRC code from a 32-bit data word and a fixed generator polynomial. Among other applications, CRC-based techniques are used to verify data transmission or storage integrity. In the scope of the EN/IEC 60335-1 standard, they offer a means of verifying the Flash memory integrity. The CRC calculation unit helps compute a signature of the software during runtime, to be compared with a reference signature generated at link- time and stored at a given memory location.

## 2.3.4 Embedded SRAM

Up to 64 Kbytes of embedded SRAM accessed (read/write) at CPU clock speed with 0 wait states.

## 2.3.5 FSMC (flexible static memory controller)

The FSMC is embedded in the STM32F103xC, STM32F103xD and STM32F103xE performance line family. It has four Chip Select outputs supporting the following modes: PC Card/Compact Flash, SRAM, PSRAM, NOR and NAND. Functionality overview:

- The three FSMC interrupt lines are ORed in order to be connected to the NVIC
- Write FIFO
- Code execution from external memory except for NAND Flash and PC Card
- The targeted frequency, fCLK, is HCLK/2, so external access is at 36 MHz when HCLK is at 72 MHz and external access is at 24 MHz when HCLK is at 48 MHz
<u>DS5792 Rev 13 15/143</u>
## <u>Description STM32F103xC, STM32F103xD, STM32F103xE</u>

# 2.3.6 LCD parallel interface

The FSMC can be configured to interface seamlessly with most graphic LCD controllers. It supports the Intel 8080 and Motorola 6800 modes, and is flexible enough to adapt to specific LCD interfaces. This LCD parallel interface capability makes it easy to build cost- effective graphic applications using LCD modules with embedded controllers or high- performance solutions using external controllers with dedicated acceleration.

# 2.3.7 Nested vectored interrupt controller (NVIC)

The STM32F103xC, STM32F103xD and STM32F103xE performance line embeds a nested vectored interrupt controller able to handle up to 60 maskable interrupt channels (not including the 16 interrupt lines of Cortex®-M3) and 16 priority levels.

- Closely coupled NVIC gives low latency interrupt processing
- Interrupt entry vector table address passed directly to the core
- Closely coupled NVIC core interface
- Allows early processing of interrupts
- Processing of *late arriving* higher priority interrupts
- Support for tail-chaining
- Processor state automatically saved
- Interrupt entry restored on interrupt exit with no instruction overhead This hardware block provides flexible interrupt management features with minimal interrupt latency.
# 2.3.8 External interrupt/event controller (EXTI)

The external interrupt/event controller consists of 19 edge detector lines used to generate interrupt/event requests. Each line can be independently configured to select the trigger event (rising edge, falling edge, both) and can be masked independently. A pending register maintains the status of the interrupt requests. The EXTI can detect an external line with a pulse width shorter than the Internal APB2 clock period. Up to 112 GPIOs can be connected to the 16 external interrupt lines.

# 2.3.9 Clocks and startup

System clock selection is performed on startup, however the internal RC 8 MHz oscillator is selected as default CPU clock on reset. An external 4-16 MHz clock can be selected, in which case it is monitored for failure. If failure is detected, the system automatically switches back to the internal RC oscillator. A software interrupt is generated if enabled. Similarly, full interrupt management of the PLL clock entry is available when necessary (for example with failure of an indirectly used external oscillator).

Several prescalers allow the configuration of the AHB frequency, the high speed APB (APB2) and the low speed APB (APB1) domains. The maximum frequency of the AHB and the high speed APB domains is 72 MHz. The maximum allowed frequency of the low speed APB domain is 36 MHz. See *Figure 2* for details on the clock tree.

<u>16/143 DS5792 Rev 13</u>
## <u>STM32F103xC, STM32F103xD, STM32F103xE Description</u>

# 2.3.10 Boot modes

At startup, boot pins are used to select one of three boot options:

- Boot from user Flash: you have an option to boot from any of two memory banks. By default, boot from Flash memory bank 1 is selected. You can choose to boot from Flash memory bank 2 by setting a bit in the option bytes.
- Boot from system memory
- Boot from embedded SRAM The boot loader is located in system memory. It is used to reprogram the Flash memory by using USART1.
# 2.3.11 Power supply schemes

- VDD = 2.0 to 3.6 V: external power supply for I/Os and the internal regulator. Provided externally through VDD pins.
- VSSA, VDDA = 2.0 to 3.6 V: external analog power supplies for ADC, DAC, Reset blocks, RCs and PLL (minimum voltage to be applied to VDDA is 2.4 V when the ADC or DAC is used). VDDA and VSSA must be connected to VDD and VSS, respectively.
- VBAT = 1.8 to 3.6 V: power supply for RTC, external clock 32 kHz oscillator and backup registers (through power switch) when VDD is not present. For more details on how to connect power pins, refer to *Figure 12: Power supply scheme*.
# 2.3.12 Power supply supervisor

The device has an integrated power-on reset (POR)/power-down reset (PDR) circuitry. It is always active, and ensures proper operation starting from/down to 2 V. The device remains in reset mode when VDD is below a specified threshold, VPOR/PDR, without the need for an external reset circuit. The device features an embedded programmable voltage detector (PVD) that monitors the VDD/VDDA power supply and compares it to the VPVD threshold. An interrupt can be generated when VDD/VDDA drops below the VPVD threshold and/or when VDD/VDDA is higher than the VPVD threshold. The interrupt service routine can then generate a warning message and/or put the MCU into a safe state. The PVD is enabled by software. Refer to

*Table 12: Embedded reset and power control block characteristics* for the values of

VPOR/PDR and VPVD.

# 2.3.13 Voltage regulator

The regulator has three operation modes: main (MR), low-power (LPR) and power down.

- MR is used in the nominal regulation mode (Run)
- LPR is used in the Stop modes.
- Power down is used in Standby mode: the regulator output is in high impedance: the kernel circuitry is powered down, inducing zero consumption (but the contents of the registers and SRAM are lost) This regulator is always enabled after reset. It is disabled in Standby mode.
<u>DS5792 Rev 13 17/143</u>
## <u>Description STM32F103xC, STM32F103xD, STM32F103xE</u>

# 2.3.14 Low-power modes

The STM32F103xC, STM32F103xD and STM32F103xE performance line supports three low-power modes to achieve the best compromise between low-power consumption, short startup time and available wakeup sources:

- **Sleep** mode In Sleep mode, only the CPU is stopped. All peripherals continue to operate and can wake up the CPU when an interrupt/event occurs.
- **Stop** mode Stop mode achieves the lowest power consumption while retaining the content of SRAM and registers. All clocks in the 1.8 V domain are stopped, the PLL, the HSI RC and the HSE crystal oscillators are disabled. The voltage regulator can also be put either in normal or in low-power mode. The device can be woken up from Stop mode by any of the EXTI line. The EXTI line source can be one of the 16 external lines, the PVD output, the RTC alarm or the USB wakeup.
- **Standby** mode The Standby mode is used to achieve the lowest power consumption. The internal voltage regulator is switched off so that the entire 1.8 V domain is powered off. The PLL, the HSI RC and the HSE crystal oscillators are also switched off. After entering Standby mode, SRAM and register contents are lost except for registers in the Backup domain and Standby circuitry. The device exits Standby mode when an external reset (NRST pin), an IWDG reset, a rising edge on the WKUP pin, or an RTC alarm occurs.
*Note: The RTC, the IWDG, and the corresponding clock sources are not stopped by entering Stop*
 *or Standby mode.*
# 2.3.15 DMA

The flexible 12-channel general-purpose DMAs (7 channels for DMA1 and 5 channels for DMA2) are able to manage memory-to-memory, peripheral-to-memory and memory-to- peripheral transfers. The two DMA controllers support circular buffer management, removing the need for user code intervention when the controller reaches the end of the buffer.

Each channel is connected to dedicated hardware DMA requests, with support for software trigger on each channel. Configuration is made by software and transfer sizes between source and destination are independent.

The DMA can be used with the main peripherals: SPI, I2C, USART, general-purpose, basic and advanced-control timers TIMx, DAC, I2S, SDIO and ADC.

# 2.3.16 RTC (real-time clock) and backup registers

The RTC and the backup registers are supplied through a switch that takes power either on VDD supply when present or through the VBAT pin. The backup registers are forty-two 16-bit registers used to store 84 bytes of user application data when VDD power is not present. They are not reset by a system or power reset, and they are not reset when the device wakes up from the Standby mode.

The real-time clock provides a set of continuously running counters which can be used with suitable software to provide a clock calendar function, and provides an alarm interrupt and a

<u>18/143 DS5792 Rev 13</u>
## STM32F103xC, STM32F103xD, STM32F103xE Description

|a SysTick timer. Table 4|Timers and watchdogs||configured to generate a time base of 1 second from a clock at 32.768 kHz.|periodic interrupt. It is clocked by a 32.768 kHz external crystal, resonator or oscillator, the internal low-power RC oscillator or the high-speed external clock divided by 128. The internal low-speed RC has a typical frequency of 40 kHz. The RTC can be calibrated using an external 512 Hz output to compensate for any natural quartz deviation. The RTC features a 32-bit programmable counter for long term measurement using the Compare register to generate an alarm. A 20-bit prescaler is used for the time base clock and is by default The high-density STM32F103xC/D/E performance line devices include up to two advanced- control timers, up to four general-purpose timers, two basic timers, two watchdog timers and compares the features of the advanced-control, general-purpose and basic timers. Table 4. High-density timer feature comparison|||
|---|---|---|---|---|---|---|
|Timer|Counter resolution|Counter type|Prescaler factor|DMA request generation|Capture/compare channels|Complementary outputs|
|TIM1, TIM8|16-bit|Up, down, up/down|Any integer between 1 and 65536|Yes|4|Yes|
|TIM2, TIM3, TIM4, TIM5|16-bit|Up, down, up/down|Any integer between 1 and 65536|Yes|4|No|
|TIM6, TIM7|16-bit|Up|Any integer between 1 and 65536 DS5792 Rev 13|Yes|0|No 19/143|

#### 2.3.17
## <u>Description STM32F103xC, STM32F103xD, STM32F103xE</u>

# Advanced-control timers (TIM1 and TIM8)

The two advanced-control timers (TIM1 and TIM8) can each be seen as a three-phase PWM multiplexed on 6 channels. They have complementary PWM outputs with programmable inserted dead-times. They can also be seen as a complete general-purpose timer. The 4 independent channels can be used for:

- Input capture
- Output compare
- PWM generation (edge or center-aligned modes)
- One-pulse mode output If configured as a standard 16-bit timer, it has the same features as the TIMx timer. If configured as the 16-bit PWM generator, it has full modulation capability (0-100%). In debug mode, the advanced-control timer counter can be frozen and the PWM outputs disabled to turn off any power switch driven by these outputs. Many features are shared with those of the general-purpose TIM timers which have the same architecture. The advanced-control timer can therefore work together with the TIM timers via the Timer Link feature for synchronization or event chaining.
# General-purpose timers (TIMx)

There are up to 4 synchronizable general-purpose timers (TIM2, TIM3, TIM4 and TIM5) embedded in the STM32F103xC, STM32F103xD and STM32F103xE performance line devices. These timers are based on a 16-bit auto-reload up/down counter, a 16-bit prescaler and feature 4 independent channels each for input capture/output compare, PWM or one- pulse mode output. This gives up to 16 input captures / output compares / PWMs on the largest packages. The general-purpose timers can work together with the advanced-control timer via the Timer Link feature for synchronization or event chaining. Their counter can be frozen in debug mode. Any of the general-purpose timers can be used to generate PWM outputs. They all have independent DMA request generation.

These timers are capable of handling quadrature (incremental) encoder signals and the digital outputs from 1 to 3 hall-effect sensors.

# Basic timers TIM6 and TIM7

These timers are mainly used for DAC trigger generation. They can also be used as a generic 16-bit time base.

# Independent watchdog

The independent watchdog is based on a 12-bit downcounter and 8-bit prescaler. It is clocked from an independent 40 kHz internal RC and as it operates independently from the main clock, it can operate in Stop and Standby modes. It can be used either as a watchdog to reset the device when a problem occurs, or as a free running timer for application timeout management. It is hardware or software configurable through the option bytes. The counter can be frozen in debug mode.

# Window watchdog

The window watchdog is based on a 7-bit downcounter that can be set as free running. It can be used as a watchdog to reset the device when a problem occurs. It is clocked from

<u>20/143 DS5792 Rev 13</u>
## <u>STM32F103xC, STM32F103xD, STM32F103xE Description</u>

the main clock. It has an early warning interrupt capability and the counter can be frozen in debug mode.

## SysTick timer

This timer is dedicated to real-time operating systems, but could also be used as a standard down counter. It features:

- A 24-bit down counter
- Autoreload capability
- Maskable system interrupt generation when the counter reaches 0.
- Programmable clock source
# 2.3.18 I²C bus

Up to two I²C bus interfaces can operate in multimaster and slave modes. They can support standard and fast modes. They support 7/10-bit addressing mode and 7-bit dual addressing mode (as slave). A hardware CRC generation/verification is embedded. They can be served by DMA and they support SMBus 2.0/PMBus.

# 2.3.19 Universal synchronous/asynchronous receiver transmitters (USARTs)

The STM32F103xC, STM32F103xD and STM32F103xE performance line embeds three universal synchronous/asynchronous receiver transmitters (USART1, USART2 and USART3) and two universal asynchronous receiver transmitters (UART4 and UART5). These five interfaces provide asynchronous communication, IrDA SIR ENDEC support, multiprocessor communication mode, single-wire half-duplex communication mode and have LIN Master/Slave capability. The USART1 interface is able to communicate at speeds of up to 4.5 Mbit/s. The other available interfaces communicate at up to 2.25 Mbit/s. USART1, USART2 and USART3 also provide hardware management of the CTS and RTS signals, Smart Card mode (ISO 7816 compliant) and SPI-like communication capability. All interfaces can be served by the DMA controller except for UART5.

# 2.3.20 Serial peripheral interface (SPI)

Up to three SPIs are able to communicate up to 18 Mbits/s in slave and master modes in full-duplex and simplex communication modes. The 3-bit prescaler gives 8 master mode frequencies and the frame is configurable to 8 bits or 16 bits. The hardware CRC generation/verification supports basic SD Card/MMC modes. All SPIs can be served by the DMA controller.

# 2.3.21 Inter-integrated sound (I2S)

Two standard I2S interfaces (multiplexed with SPI2 and SPI3) are available, that can be operated in master or slave mode. These interfaces can be configured to operate with 16/32 bit resolution, as input or output channels. Audio sampling frequencies from 8 kHz up to 48 kHz are supported. When either or both of the I2S interfaces is/are configured in master

<u>DS5792 Rev 13 21/143</u>
## <u>Description STM32F103xC, STM32F103xD, STM32F103xE</u>

mode, the master clock can be output to the external DAC/CODEC at 256 times the sampling frequency.

# 2.3.22 SDIO

An SD/SDIO/MMC host interface is available, that supports MultiMediaCard System Specification Version 4.2 in three different databus modes: 1-bit (default), 4-bit and 8-bit. The interface allows data transfer at up to 48 MHz in 8-bit mode, and is compliant with SD Memory Card Specifications Version 2.0. The SDIO Card Specification Version 2.0 is also supported with two different databus modes: 1-bit (default) and 4-bit.

The current version supports only one SD/SDIO/MMC4.2 card at any one time and a stack of MMC4.1 or previous.

In addition to SD/SDIO/MMC, this interface is also fully compliant with the CE-ATA digital protocol Rev1.1.

# 2.3.23 Controller area network (CAN)

The CAN is compliant with specifications 2.0A and B (active) with a bit rate up to 1 Mbit/s. It can receive and transmit standard frames with 11-bit identifiers as well as extended frames with 29-bit identifiers. It has three transmit mailboxes, two receive FIFOs with 3 stages and 14 scalable filter banks.

# 2.3.24 Universal serial bus (USB)

The STM32F103xC, STM32F103xD and STM32F103xE performance line embed a USB device peripheral compatible with the USB full-speed 12 Mbs. The USB interface implements a full-speed (12 Mbit/s) function interface. It has software-configurable endpoint setting and suspend/resume support. The dedicated 48 MHz clock is generated from the internal main PLL (the clock source must use a HSE crystal oscillator).

# 2.3.25 GPIOs (general-purpose inputs/outputs)

Each of the GPIO pins can be configured by software as output (push-pull or open-drain), as input (with or without pull-up or pull-down) or as peripheral alternate function. Most of the GPIO pins are shared with digital or analog alternate functions. All GPIOs are high current- capable.

The I/Os alternate function configuration can be locked if needed following a specific sequence in order to avoid spurious writing to the I/Os registers.

# 2.3.26 ADC (analog to digital converter)

Three 12-bit analog-to-digital converters are embedded into STM32F103xC, STM32F103xD and STM32F103xE performance line devices and each ADC shares up to 21 external channels, performing conversions in single-shot or scan modes. In scan mode, automatic conversion is performed on a selected group of analog inputs.

Additional logic functions embedded in the ADC interface allow:

- Simultaneous sample and hold
- Interleaved sample and hold
- Single shunt
<u>22/143 DS5792 Rev 13</u>
## <u>STM32F103xC, STM32F103xD, STM32F103xE Description</u>

The ADC can be served by the DMA controller. An analog watchdog feature allows very precise monitoring of the converted voltage of one, some or all selected channels. An interrupt is generated when the converted voltage is outside the programmed thresholds. The events generated by the general-purpose timers (TIMx) and the advanced-control timers (TIM1 and TIM8) can be internally connected to the ADC start trigger and injection trigger, respectively, to allow the application to synchronize A/D conversion and timers.

# 2.3.27 DAC (digital-to-analog converter)

The two 12-bit buffered DAC channels can be used to convert two digital signals into two analog voltage signal outputs. The chosen design structure is composed of integrated resistor strings and an amplifier in inverting configuration. This dual digital Interface supports the following features:

- two DAC converters: one for each output channel
- 8-bit or 12-bit monotonic output
- left or right data alignment in 12-bit mode
- synchronized update capability
- noise-wave generation
- triangular-wave generation
- dual DAC channel independent or simultaneous conversions
- DMA capability for each channel
- external triggers for conversion
- input voltage reference VREF+ Eight DAC trigger inputs are used in the STM32F103xC, STM32F103xD and STM32F103xE performance line family. The DAC channels are triggered through the timer update outputs that are also connected to different DMA channels.
<u>DS5792 Rev 13 23/143</u>
## <u>Description STM32F103xC, STM32F103xD, STM32F103xE</u>

# 2.3.28 Temperature sensor

The temperature sensor has to generate a voltage that varies linearly with temperature. The conversion range is between 2 V < VDDA < 3.6 V. The temperature sensor is internally connected to the ADC1_IN16 input channel which is used to convert the sensor output voltage into a digital value.

# 2.3.29 Serial wire JTAG debug port (SWJ-DP)

The Arm SWJ-DP Interface is embedded, and is a combined JTAG and serial wire debug port that enables either a serial wire debug or a JTAG probe to be connected to the target. The JTAG TMS and TCK pins are shared respectively with SWDIO and SWCLK and a specific sequence on the TMS pin is used to switch between JTAG-DP and SW-DP.

# 2.3.30 Embedded Trace Macrocell™

The Arm® Embedded Trace Macrocell provides a greater visibility of the instruction and data flow inside the CPU core by streaming compressed data at a very high rate from the STM32F10xxx through a small number of ETM pins to an external hardware trace port analyzer (TPA) device. The TPA is connected to a host computer using USB, Ethernet, or any other high-speed channel. Real-time instruction and data flow activity can be recorded and then formatted for display on the host computer running debugger software. TPA hardware is commercially available from common development tool vendors. It operates with third party debugger software tools.

<u>24/143 DS5792 Rev 13</u>
STM32F103xC, STM32F103xD, STM32F103xE Pinouts and pin descriptions
Figure 3. STM32F103xC/D/E BGA144 ballout
1 2 3 4 5 6 7 8 9 10 11 12
© ’ i ’ - - - - - - - - -

A ‘PC13-1 1 PE3 1} © PE2} SPE} © PEO} O © pd © PB3 | + PD6; +‘ PD7} «PAI5; ‘PA14;  :‘PA13;
TAMPERATO \PF® 7 A PERI A PET I A PEO: O WTASE rpg: PPS A PDA UTD ATO: NTMS:

B | ‘PC14} ‘PE4} ‘PES } ‘PEG! ‘PB9 } ‘PB5} ‘PG15! ‘PG121 ‘PD5 !  ‘PCi{!  ‘PC10!  ‘PA12}
O8CR2AIN N NE NIE N NE NIE NI NE NIE NI NEI
PC15, o * pa s I pa * pa * pa * pa pa a i ” pi *

© |osgs2 OUT ‘VBat! 1 PFO! 1{PFI} i{PBB} i(PBG! iPGI4! iPGI! {Ppa! {Pci2! {NC} {PAM
D | PSC_ IN ‘Vss st Vpp a ‘PF2!  BOOTO ‘PB7! ‘PGI3! ‘PG1O! i PD3! ÎPD1} ‘PAIO! ‘PAG!
E | OSC_OUT ‘ PF3 1} ©‘ PF4! ‘PF5 1 ‘Vss a Yss_it' Vss_19 ‘PG9! ‘PD2! ‘PDO! iPC9: i‘ PAS}
F INRST: A PF7} O 1PF6} Vop 4 Vop a Vpp_1t!  Vopi0  Vop a Vpp 2 Vpp gi A PC8} A PC7I
G | {PFIO! {PF9O! {PF8! ssa Von e Von z  Vpp_i!  iVss a ss 2° Vss gr ‘PG8! iPC6}
H| ‘Pco} {Pei}! {Pc2! {Pos}! ss Nss71  Nss_i! {PEI1} i{PDI1} {PG7} i{PG6} iPG5}
J iv F PÀo WiùP a PAS} ‘PC ‘Pea ‘Pai PE? {peiDì {PDIOÈ i PG4Ì iP sì ‘peo:
Vssa! PAOWKUP {PAS} {PC4} Boots 1PG1} {PE10; iPEI2} iPDIO} {PG4} i{PG3! i PG2;

K | VReFL ‘PALI 3 1 PA5 1 (PCS! (PFIS} (PGO} ‘PE9} ‘PEI3! ‘PD9 ! (PD13!  iPD14! ‘PD185}
L NREF4! 1 PAZ I © PAG 1 (PBO} (IPFI2}  {PFI51 ©‘ PES} (PE141 i‘ PD8} {PD12}  {PB14!  ‘PB15}!
M IVDDA! 1 PAG} {PAZ} {PBI} (PFI1} (PFI41  ( PE7 } (PEI15!  (PB10!  (PB11}  (PB12}  ‘PB13}

Al14798b
1. The above figure shows the package top view.
£y7 D$5792 Rev 13 25/143
## Pinouts and pin descriptions STM32F103xC, STM32F103xD, STM32F103xE

**Figure 4. STM32F103xC/D/E performance line BGA100 ballout**

PC14-PC13- A OSC32_IN TAMPER-PE2 PB9 PB7 PB4 PB3 PA15 PA14 PA13 RTC PC15- B OSC32_OUT VBAT PE3 PB8 PB6 PD5 PD2 PC11 PC10 PA12 C OSC_IN VSS_5 PE4 PE1 PB5 PD6 PD3 PC12 PA9 PA11 D OSC_OUT VDD_5 PE5 PE0 BOOT0 PD7 PD4 PD0 PA8 PA10 E NRST PC2 PE6 VSS_4 VSS_3 VSS_2 VSS_1 PD1 PC9 PC7 F PC0 PC1 PC3 VDD_4 VDD_3 VDD_2 VDD_1 NC PC8 PC6 G VSSA PA0-WKUP PA4 PC4 PB2 PE10 PE14 PB15 PD11 PD15 H VREF– PA1 PA5 PC5 PE7 PE11 PE15 PB14 PD10 PD14 J VREF+ PA2 PA6 PB0 PE8 PE12 PB10 PB13 PD9 PD13 K VDDA PA3 PA7 PB1 PE9 PE13 PB11 PB12 PD8 PD12 AI14601c

1. The above figure shows the package top view.
26/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE

## Pinouts and pin descriptions

**Figure 5. STM32F103xC/D/E performance line LQFP144 pinout**

$$?33? $$?33? $$?33? 6 6 0%0%0"0""//40"0"0"0"0"0’6 6 0’0’ 0’0’0’0’0$0$6 6 0$0$0$0$0$0$0#0#0#0!0!

0% 0% 0% 0% 0% 6"!4 0#4!-0%224# 0#/3#?). 0#/3#?/54 0& 0& 0& 0& 0& 0& 633? ,1&0 6$$? 0& 0& 0& 0& 0& /3#?). /3#?/54

.234 0# 0# 0# 0# 633! 62%& 62%& 6$$!
0!7+50 0! 0!

6$$? 633? .# 0! 0! 0! 0! 0! 0! 0# 0# 0# 0# 6$$? 633? 0’ 0’ 0’ 0’ 0’ 0’ 0’ 0$ 0$ 6$$? 633? 0$ 0$ 0$ 0$ 0$ 0$ 0" 0" 0" 0"

||0!33?0! 0!|0! 0! 0# 0# 0"|0" 0" 0& 0&|0& 0& 0& 0’|0’ 0% 0% 0%33?|0% 0% 0% 0%|0% 0% 0" 0"|33?|
|---|---|---|---|---|---|---|---|---|
||6 6 $$?||633?|6 $$?|6|6 $$?|6|6 $$?|
|||||||||AI|
|1. The above figure shows the package top view.|||||||||

DS5792 Rev 13 27/143
## Pinouts and pin descriptions STM32F103xC, STM32F103xD, STM32F103xE

**Figure 6. STM32F103xC/D/E performance line LQFP100 pinout**

6$$?633?0% 0% 0" 0" "//40" 0" 0" 0" 0" 0$ 0$ 0$ 0$ 0$ 0$ 0$ 0$ 0# 0# 0# 0! 0!

0% 6$$? 0% 633? 0%.# 0% 0! 0% 0! 6"!4 0! 0#4!-0%224# 0! 0#/3#?). 0! 0#/3#?/54 0! 633? 0# 6$$? 0# /3#?). 0# /3#?/54,1&0 0#

.234 0$ 0# 0$ 0# 0$ 0# 0$ 0# 0$ 633! 0$ 62%& 0$ 62%& 0$ 6$$! 0"
0!7+50 0" 0! 0" 0! 0"

0! 0! 0! 0! 0! 0# 0# 0" 0" 0" 0% 0% 0% 0% 0% 0% 0% 0% 0% 0" 0" 633?6$$? 633?6$$? AI

1. The above figure shows the package top view.
28/143 DS5792 Rev 13
STM32F103xC, STM32F103xD, STM32F103xE Pinouts and pin descriptions
Figure 7. STM32F103xC/D/E performance line LQFP64 pinout
[=]
pes Li
umano NV Nn TM ITEFSAI
ammo mmm BbuLuLOIU
SS aan nea ia
LI CICI CI CI CI CI CI CIC] CI CI CIO
64 63 62 61 60 59 58 57 56 55 54 53 52 51 50 49
VBAT Dj 1 48 DI] VDD_2
PC13-TAMPER-RTC 52 47 DI Vss_2
PC 14-OSC 32_IN Dj 3 46 DI PA 13
PC 15-OSC 32_OUT ja 45 [1 PA 12
PDO-OS CIN Ds 44 I PA 11
PD1-OS C OUT 6 43 I PA 10
NRST 7 422 DI PA 9
PCO mg: 41 DN PA 8
PC1 Do LQFP64 40 DI PC9
PC2 10 39 DI PC8
PC3 1 38 DI PC7
VssSA 12 37 HI PC6
VoDA 13 36 H PB 15
PA O-WKUP 14 35 DI] PB 14
PA1 15 34 DI] PB 13
PA2 16 33 DI] PB 12
17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32
OOoUOdovopropprosfrfvvuvvv
Mm se TONO NOA aa
E go EE EFELRLPFCEL PA ua go
> 3 a n>8
ai14392
1. The above figure shows the package top view.
£y/ DS5792 Rev 13 29/143
Pinouts and pin descriptions STM32F103xC, STM32F103xD, STM32F103xE
Figure 8. STM32F103xC/D/E performance line
WLCSP64 ballout, ball side
30/143 DS5792 Rev 13 £y/
## STM32F103xC, STM32F103xD, STM32F103xE Pinouts and pin descriptions

|||||||||Table 5. High-density STM32F103xC/D/E pin definitions||||
|---|---|---|---|---|---|---|---|---|---|---|---|
|||Pins||||||||Alternate functions|(4)|
|LFBGA144|LFBGA100|WLCSP64|LQFP64|LQFP100|LQFP144|Pin name|(1) Type|(2) I / O Level|Main (3) function (after reset)|Default|Remap|
|A3|A3|-|-|1|1|PE2|I/O|FT|PE2|TRACECK/ FSMC_A23|-|
|A2|B3|-|-|2|2|PE3|I/O|FT|PE3|TRACED0/FSMC_A19|-|
|B2|C3|-|-|3|3|PE4|I/O|FT|PE4|TRACED1/FSMC_A20|-|
|B3|D3|-|-|4|4|PE5|I/O|FT|PE5|TRACED2/FSMC_A21|-|
|B4|E3|-|-|5|5|PE6|I/O|FT|PE6|TRACED3/FSMC_A22|-|
|C2|B2|C6|1|6|6|VBAT||S-|V BAT||--|
|A1|A2|C8|2|7|7|PC13-TAMPER- (5) RTC|I/O|-|(6) PC13|TAMPER-RTC|-|
|B1|A1|B8|3|8|8|PC14- (5) OSC32_IN|I/O|-|(6) PC14|OSC32_IN|-|
|C1|B1|B7|4|9|9|PC15- (5) OSC32_OUT|I/O|-|(6) PC15|OSC32_OUT|-|
|C3|-|-|-|-|10|PF0|I/O|FT|PF0|FSMC_A0|-|
|C4|-|-|-|-|11|PF1|I/O|FT|PF1|FSMC_A1|-|
|D4|-|-|-|-|12|PF2|I/O|FT|PF2|FSMC_A2|-|
|E2|-|-|-|-|13|PF3|I/O|FT|PF3|FSMC_A3|-|
|E3|-|-|-|-|14|PF4|I/O|FT|PF4|FSMC_A4|-|
|E4|-|-|-|-|15|PF5|I/O|FT|PF5|FSMC_A5|-|
|D2|C2|-|-|10|16|V SS_5||S-|V SS_5||--|
|D3|D2|-|-|11|17|V DD_5||S-|V DD_5||--|
|F3|-|-|-|-|18|PF6|I/O|-|PF6|ADC3_IN4/FSMC_NIORD|-|
|F2|-|-|-|-|19|PF7|I/O|-|PF7|ADC3_IN5/FSMC_NREG|-|
|G3|-|-|-|-|20|PF8|I/O|-|PF8|ADC3_IN6/FSMC_NIOWR|-|
|G2|-|-|-|-|21|PF9|I/O|-|PF9|ADC3_IN7/FSMC_CD|-|
|G1|-|-|-|-|22|PF10|I/O|-|PF10|ADC3_IN8/FSMC_INTR|-|
|D1|C1|D8|5|12|23|OSC_IN|I|-|OSC_IN|-|-|
|E1|D1|D7|6|13|24|OSC_OUT|O|-|OSC_OUT|-|-|
|F1|E1|C7|7|14|25|NRST|I/O|-|NRST|-|-|
|H1|F1|E8|8|15|26|PC0|I/O|-|PC0|ADC123_IN10|-|
|H2|F2|F8|9|16|27|PC1|I/O|-|PC1|ADC123_IN11|-|
|H3|E2|D6|10|17|28|PC2|I/O|- DS5792 Rev 13|PC2|ADC123_IN12|- 31/143|
## Pinouts and pin descriptions STM32F103xC, STM32F103xD, STM32F103xE

|||||||||Table 5. High-density STM32F103xC/D/E pin definitions (continued)||||
|---|---|---|---|---|---|---|---|---|---|---|---|
|||Pins||||||||Alternate functions|(4)|
|LFBGA144|LFBGA100|WLCSP64|LQFP64|LQFP100|LQFP144|Pin name|(1) Type|(2) I / O Level|Main (3) function (after reset)|Default|Remap|
|H4|F3|-|11|18|29|(7) PC3|I/O|-|PC3|ADC123_IN13|-|
|J1|G1|E7|12|19|30|VSSA||S-|V SSA||--|
|K1|H1|-|-|20|31|VREF-||S-|V REF-||--|
|L1|J1|F7 (8)||-2132||V REF+||S-|V REF+||--|
|M1|K1|G8|13|22|33|VDDA||S-|V DDA||--|
|J2|G2|F6|14|23|34|PA0-WKUP|I/O|-|PA0|(9) WKUP/USART2_CTS ADC123_IN0 TIM2_CH1_ETR TIM5_CH1/TIM8_ETR|-|
|K2|H2|E6|15|24|35|PA1|I/O|-|PA1|(9) USART2_RTS ADC123_IN1/ (9) TIM5_CH2/TIM2_CH2|-|
|L2|J2|H8|16|25|36|PA2|I/O|-|PA2|(9) /TIM5_CH3 USART2_TX ADC123_IN2/ (9) TIM2_CH3|-|
|M2|K2|G7|17|26|37|PA3|I/O|-|PA3|(9) USART2_RX /TIM5_CH4 (9) ADC123_IN3/TIM2_CH4|-|
|G4|E4|F5|18|27|38|V SS_4||S-|V SS_4||--|
|F4|F4|G6|19|28|39|V DD_4||S-|V DD_4||--|
|J3|G3|H7|20|29|40|PA4|I/O|-|PA4|(9) SPI1_NSS / (9) USART2_CK DAC_OUT1/ADC12_IN4|-|
|K3|H3|E5|21|30|41|PA5|I/O|-|PA5|(9) SPI1_SCK DAC_OUT2 ADC12_IN5|-|
|L3|J3|G5|22|31|42|PA6|I/O|-|PA6|(9) SPI1_MISO TIM8_BKIN/ADC12_IN6 (9) TIM3_CH1|TIM1_BKIN|
|M3|K3|G4|23|32|43|PA7|I/O|-|PA7|(9) / SPI1_MOSI TIM8_CH1N/ADC12_IN7 (9) TIM3_CH2|TIM1_CH1N|
|J4|G4|H6|24|33|44|PC4|I/O|-|PC4|ADC12_IN14 -||
|K4|H4|H5|25|34|45|PC5|I/O|-|PC5|ADC12_IN15 -||
|L4|J4|H4|26|35|46|PB0|I/O|-|PB0|ADC12_IN8/TIM3_CH3 TIM8_CH2N|TIM1_CH2N|
|M4|K4|F4|27|36|47|PB1|I/O|-|PB1|(9) ADC12_IN9/TIM3_CH4 TIM8_CH3N|TIM1_CH3N|
|32/143||||||||DS5792 Rev 13||||
# STM32F103xC, STM32F103xD, STM32F103xE Pinouts and pin descriptions

**Table 5. High-density STM32F103xC/D/E pin definitions (continued)**

**(4)**
## Pins Alternate functions

**(2)**
**(1)Main**
**(3)**
## Pin name function

## Type (after reset) Default Remap

## LQFP64LQFP100 I / O Level

## WLCSP64 LQFP144

## LFBGA144LFBGA100

J5 G5 H3 28 37 48 PB2 I/O FT PB2/BOOT1-- M5----49 PF11 I/O FT PF11 FSMC_NIOS16- L5----50 PF12 I/O FT PF12 FSMC_A6- H5----51 VSS_6S-VSS_6-- G5----52 VDD_6S-VDD_6-- K5----53 PF13 I/O FT PF13 FSMC_A7- M6----54 PF14 I/O FT PF14 FSMC_A8- L6----55 PF15 I/O FT PF15 FSMC_A9- K6----56 PG0 I/O FT PG0 FSMC_A10- J6----57 PG1 I/O FT PG1 FSMC_A11-

|M7 H5|--38|58|PE7|I/O FT|PE7|FSMC_D4|TIM1_ETR|
|---|---|---|---|---|---|---|---|
|L7 J5|--39|59|PE8|I/O FT|PE8|FSMC_D5|TIM1_CH1N|
|K7 K5|--40|60|PE9|I/O FT|PE9|FSMC_D6|TIM1_CH1|
|H6-|--|-61|VSS_7|S-|VSS_7|--||
|G6-|--|-62|VDD_7|S-|VDD_7|--||
|J7 G6|--41|63|PE10|I/O FT|PE10|FSMC_D7|TIM1_CH2N|
|H8 H6|--42|64|PE11|I/O FT|PE11|FSMC_D8|TIM1_CH2|
|J8 J6|--43|65|PE12|I/O FT|PE12|FSMC_D9|TIM1_CH3N|
|K8 K6|--44|66|PE13|I/O FT|PE13|FSMC_D10|TIM1_CH3|
|L8 G7|--45|67|PE14|I/O FT|PE14|FSMC_D11|TIM1_CH4|
|M8 H7|--46|68|PE15|I/O FT|PE15|FSMC_D12|TIM1_BKIN|
|M9 J7|G3 29 47|69|PB10|I/O FT|PB10||TIM2_CH3|
|M10 K7|F3 30 48|70|PB11|I/O FT|PB11||TIM2_CH4|
|H7 E7|H2 31 49|71|VSS_1|S-|VSS_1|--||
|G7 F7|H1 32 50|72|VDD_1|S-|VDD_1|-- SPI2_NSS/I2S2_WS/||
|M11 K8|G2 33 51|73|PB12|I/O FT|PB12|USART3_CK I2C2_SMBA/ TIM1_BKIN SPI2_SCK/I2S2_CK|-|
|M12 J8|G1 34 52|74|PB13|I/O FT|PB13|USART3_CTS TIM1_CH1N|-|

(9)
I2C2_SCL/USART3_TX

(9)
I2C2_SDA/USART3_RX

(9) /
(9)
(9) /
## DS5792 Rev 13 33/143
# Pinouts and pin descriptions STM32F103xC, STM32F103xD, STM32F103xE

**Table 5. High-density STM32F103xC/D/E pin definitions (continued)**

**(4)**
## Pins Alternate functions

**(2)**
**(1)Main**
**(3)**
## Pin name function

## Type (after reset) Default Remap

## LQFP64LQFP100LQFP144 I / O Level

## LFBGA144LFBGA100WLCSP64

SPI2_MISO/TIM1_CH2N L11 H8 F2 35 53 75 PB14 I/O FT PB14(9)- USART3_RTS /

SPI2_MOSI/I2S2_SD L12 G8 F1 36 54 76 PB15 I/O FT PB15(9)- TIM1_CH3N /

|L9 K9|--55|77|PD8|I/O FT|PD8|FSMC_D13||USART3_TX|
|---|---|---|---|---|---|---|---|---|
|K9 J9|--56|78|PD9|I/O FT|PD9|FSMC_D14||USART3_RX|
|J9 H9|--57|79|PD10|I/O FT|PD10|FSMC_D15||USART3_CK|
|H9 G9|--58|80|PD11|I/O FT|PD11|FSMC_A16||USART3_CTS|
|L10 K10|--59|81|PD12|I/O FT|PD12|FSMC_A17||USART3_RTS TIM4_CH1 /|
|K10 J10|--60|82|PD13|I/O FT|PD13|FSMC_A18||TIM4_CH2|
|G8-|--|-83|VSS_8|S-|VSS_8|--|||
|F8-|--|-84|VDD_8|S-|VDD_8|--|||
|K11 H10|--61|85|PD14|I/O FT|PD14|FSMC_D0||TIM4_CH3|
|K12 G10|--62|86|PD15|I/O FT|PD15|FSMC_D1||TIM4_CH4|
|J12-|--|-87|PG2|I/O FT|PG2|FSMC_A12||-|
|J11-|--|-88|PG3|I/O FT|PG3|FSMC_A13||-|
|J10-|--|-89|PG4|I/O FT|PG4|FSMC_A14||-|
|H12-|--|-90|PG5|I/O FT|PG5|FSMC_A15||-|
|H11-|--|-91|PG6|I/O FT|PG6|FSMC_INT2||-|
|H10-|--|-92|PG7|I/O FT|PG7|FSMC_INT3||-|
|G11-|--|-93|PG8|I/O FT|PG8|-||-|
|G10-|--|-94|VSS_9|S-|VSS_9|--|||
|F10-|--|-95|VDD_9|S-|VDD_9|--|||
|G12 F10|E1 37 63|96|PC6|I/O FT|PC6|TIM8_CH1/SDIO_D6 I2S2_MCK/||TIM3_CH1|
|F12 E10|E2 38 64|97|PC7|I/O FT|PC7|TIM8_CH2/SDIO_D7 I2S3_MCK/||TIM3_CH2|
|F11 F9|E3 39 65|98|PC8|I/O FT|PC8|TIM8_CH3/SDIO_D0||TIM3_CH3|
|E11 E9|D1 40 66|99|PC9|I/O FT|PC9|TIM8_CH4/SDIO_D1||TIM3_CH4|
|E12 D9|E4 41 67|100|PA8|I/O FT|PA8|TIM1_CH1 USART1_CK/|(9)/MCO|-|

## 34/143 DS5792 Rev 13
# STM32F103xC, STM32F103xD, STM32F103xE Pinouts and pin descriptions

**Table 5. High-density STM32F103xC/D/E pin definitions (continued)**

**(4)**
## Pins Alternate functions

**(2)**
**(1)Main**
**(3)**
## Pin name function

## Type (after reset) Default Remap

## LQFP64LQFP100LQFP144 I / O Level

## LFBGA144LFBGA100WLCSP64

(9)
USART1_TX / D12 C9 D2 42 68 101 PA9 I/O FT PA9(9)- TIM1_CH2

(9)
USART1_RX / D11 D10 D3 43 69 102 PA10 I/O FT PA10(9)- TIM1_CH3

USART1_CTS/USBDM C12 C10 C1 44 70 103 PA11 I/O FT PA11(9) (9)- CAN_RX /TIM1_CH4

USART1_RTS/USBDP/ B12 B10 C2 45 71 104 PA12 I/O FT PA12(9) (9)- CAN_TX /TIM1_ETR

A12 A10 D4 46 72 105 PA13 I/O FT JTMS-SWDIO-PA13

|C11 F8|--|73 106|||Not connected|||-|
|---|---|---|---|---|---|---|---|---|
|G9 E6|B1 47|74 107|VSS_2|S-|VSS_2||--||
|F9 F6|A1 48|75 108|VDD_2|S-|VDD_2||--||
|A11 A9|B2 49|76 109|PA14|I/O FT|JTCK-SWCLK|SPI3_NSS/|-|PA14 TIM2_CH1_ET|
|A10 A8|C3 50|77 110|PA15|I/O FT|JTDI|I2S3_WS||R PA15 / SPI1_NSS|
|B11 B9|A2 51|78 111|PC10|I/O FT|PC10|UART4_TX/SDIO_D2||USART3_TX|
|B10 B8|B3 52|79 112|PC11|I/O FT|PC11|UART4_RX/SDIO_D3||USART3_RX|
|C10 C8|C4 53|80 113|PC12|I/O FT|PC12|UART5_TX/SDIO_CK||USART3_CK|
|E10 D8|D8 5|81 114|PD0|I/O FT|OSC_IN(10)|FSMC_D2|(11)|CAN_RX|
|D10 E8|D7 6|82 115|PD1|I/O FT|OSC_OUT|FSMC_D3|(11)|CAN_TX|
|E9 B7|A3 54|83 116|PD2|I/O FT|PD2|TIM3_ETR/UART5_RX SDIO_CMD||-|
|D9 C7|--|84 117|PD3|I/O FT|PD3|FSMC_CLK||USART2_CTS|
|C9 D7|--|85 118|PD4|I/O FT|PD4|FSMC_NOE||USART2_RTS|
|B9 B6|--|86 119|PD5|I/O FT|PD5|FSMC_NWE||USART2_TX|
|E7-|--|-120|VSS_10|S-|VSS_10||--||
|F7-|--|-121|VDD_10|S-|VDD_10||--||
|A8 C6|--|87 122|PD6|I/O FT|PD6|FSMC_NWAIT||USART2_RX|
|A9 D6|--|88 123|PD7|I/O FT|PD7|FSMC_NE1/FSMC_NCE2||USART2_CK|
|E8-|--|-124|PG9|I/O FT|PG9|FSMC_NE2/FSMC_NCE3||-|
|D8-|--|-125|PG10|I/O FT|PG10|FSMC_NCE4_1/ FSMC_NE3||-|

(10)

## DS5792 Rev 13 35/143
## Pinouts and pin descriptions STM32F103xC, STM32F103xD, STM32F103xE

|||||||||Table 5. High-density STM32F103xC/D/E pin definitions (continued)||||
|---|---|---|---|---|---|---|---|---|---|---|---|
|||Pins||||||||Alternate functions|(4)|
|LFBGA144|LFBGA100|WLCSP64|LQFP64|LQFP100|LQFP144|Pin name|(1) Type|(2) I / O Level|Main (3) function (after reset)|Default|Remap|
|C8|-|-|-|-|126|PG11|I/O|FT|PG11|FSMC_NCE4_2|-|
|B8|-|-|-|-|127|PG12|I/O|FT|PG12|FSMC_NE4|-|
|D7|-|-|-|-|128|PG13|I/O|FT|PG13|FSMC_A24|-|
|C7|-|-|-|-|129|PG14|I/O|FT|PG14|FSMC_A25|-|
|E6|-|-|-|-|130|V SS_11||S-|V SS_11||--|
|F6|-|-|-|-|131|V DD_11||S-|V DD_11||--|
|B7|-|-|-|-|132|PG15|I/O|FT|PG15|-|-|
|A7|A7|A4|55|89|133|PB3|I/O|FT|JTDO|SPI3_SCK / I2S3_CK/|PB3/TRACES WO TIM2_CH2 / SPI1_SCK|
|A6|A6|B4|56|90|134|PB4|I/O|FT|NJTRST|SPI3_MISO|PB4 / TIM3_CH1 SPI1_MISO|
|B6|C5|A5|57|91|135|PB5|I/O|-|PB5|I2C1_SMBA/ SPI3_MOSI I2S3_SD|TIM3_CH2 / SPI1_MOSI|
|C6|B5|B5|58|92|136|PB6|I/O|FT|PB6|(9) (9) I2C1_SCL / TIM4_CH1|USART1_TX|
|D6|A5|C5|59|93|137|PB7|I/O|FT|PB7|(9) I2C1_SDA / FSMC_NADV (9) / TIM4_CH2|USART1_RX|
|D5|D5|A6|60|94|138|BOOT0|I|-|BOOT0|-|-|
|C5|B4|D5|61|95|139|PB8|I/O|FT|PB8|(9) /SDIO_D4 TIM4_CH3|I2C1_SCL/ CAN_RX|
|B5|A4|B6|62|96|140|PB9|I/O|FT|PB9|(9) TIM4_CH4 /SDIO_D5|I2C1_SDA / CAN_TX|
|A5|D4|-|-|97|141|PE0|I/O|FT|PE0|TIM4_ETR / FSMC_NBL0|-|
|A4|C4|-|-|98|142|PE1|I/O|FT|PE1|FSMC_NBL1|-|
|E5|E5|A7|63|99|143|V SS_3||S-|V SS_3||--|
|F5|F5|A8|64|10 0|144|V DD_3||S-|V DD_3||--|
|1. 2. 3. 4. 36/143|FT = 5 V tolerant.||I = input, O = output, S = supply.||Function availability depends on the chosen device.|||If several peripherals share the same I/O pin, to avoid conflict between these alternate functions only one peripheral should be enabled at a time through the peripheral clock enable bit (in the corresponding RCC peripheral clock enable register). DS5792 Rev 13||||
# <u>STM32F103xC, STM32F103xD, STM32F103xE Pinouts and pin descriptions</u>

5. PC13, PC14 and PC15 are supplied through the power switch. Since the switch only sinks a limited amount of current (3 mA), the use of GPIOs PC13 to PC15 in output mode is limited: the speed should not exceed 2 MHz with a maximum load of 30 pF and these IOs must not be used as a current source (e.g. to drive an LED).
6. Main function after the first backup domain power-up. Later on, it depends on the contents of the Backup registers even after reset (because these registers are not reset by the main reset). For details on how to manage these IOs, refer to the Battery backup domain and BKP register description sections in the STM32F10xxx reference manual, available from the STMicroelectronics website: www.st.com.
7. In the WCLSP64 package, the PC3 I/O pin is not bonded and it must be configured by software to output mode (Push-pull) and writing 0 to the data register in order to avoid an extra consumption during low-power modes.
8. Unlike in the LQFP64 package, there is no PC3 in the WLCSP package. The VREF+ functionality is provided instead.
9. This alternate function can be remapped by software to some other port pins (if available on the used package). For more details, refer to the Alternate function I/O and debug configuration section in the STM32F10xxx reference manual, available from the STMicroelectronics website: www.st.com.
10. For the WCLSP64/LQFP64 package, the pins number 5 and 6 are configured as OSC_IN/OSC_OUT after reset, however the functionality of PD0 and PD1 can be remapped by software on these pins. For the LQFP100/BGA100 and LQFP144/BGA144 packages, PD0 and PD1 are available by default, so there is no need for remapping. For more details, refer to Alternate function I/O and debug configuration section in the STM32F10xxx reference manual.
11. For devices delivered in LQFP64 packages, the FSMC function is not available.
## <u>DS5792 Rev 13 37/143</u>
# Pinouts and pin descriptions STM32F103xC, STM32F103xD, STM32F103xE

**Table 6. FSMC pin definition**

## FSMC

## LQFP100

## Pins

## NOR/PSRAM/

**(1)**
## BGA100

||CF|CF/IDE|NOR/PSRAM/||NAND 16 bit|BGA100|
|---|---|---|---|---|---|---|
||||SRAM||||
|PE2|-|-|A23|A23|-|Yes|
|PE3|-|-|A19|A19|-|Yes|
|PE4|-|-|A20|A20|-|Yes|
|PE5|-|-|A21|A21|-|Yes|
|PE6|-|-|A22|A22|-|Yes|
|PF0|A0|A0|A0|-|-|-|
|PF1|A1|A1|A1|-|-|-|
|PF2|A2|A2|A2|-|-|-|
|PF3|A3|-|A3|-|-|-|
|PF4|A4|-|A4|-|-|-|
|PF5|A5|-|A5|-|-|-|
|PF6|NIORD|NIORD|-|-|-|-|
|PF7|NREG|NREG|-|-|-|-|
|PF8|NIOWR|NIOWR|-|-|-|-|
|PF9|CD|CD|-|-|-|-|
|PF10|INTR|INTR|-|-|-|-|
|PF11|NIOS16|NIOS16|-|-|-|-|
|PF12|A6|-|A6|-|-|-|
|PF13|A7|-|A7|-|-|-|
|PF14|A8|-|A8|-|-|-|
|PF15|A9|-|A9|-|-|-|
|PG0|A10|-|A10|-|-|-|
|PG1|-|-|A11|-|-|-|
|PE7|D4|D4|D4|DA4|D4|Yes|
|PE8|D5|D5|D5|DA5|D5|Yes|
|PE9|D6|D6|D6|DA6|D6|Yes|
|PE10|D7|D7|D7|DA7|D7|Yes|
|PE11|D8|D8|D8|DA8|D8|Yes|
|PE12|D9|D9|D9|DA9|D9|Yes|
|PE13|D10|D10|D10|DA10|D10|Yes|
|PE14|D11|D11|D11|DA11|D11|Yes|
|PE15|D12|D12|D12|DA12|D12|Yes|
|PD8|D13|D13|D13 DS5792 Rev 13|DA13|D13|Yes|

## CF CF/IDE NOR/PSRAM Mux NAND 16 bit

38/143
# STM32F103xC, STM32F103xD, STM32F103xE Pinouts and pin descriptions

**Table 6. FSMC pin definition (continued)**

## FSMC

## LQFP100

## Pins(1)

||CF|CF/IDE|NOR/PSRAM/||NAND 16 bit|BGA100|
|---|---|---|---|---|---|---|
||||SRAM||||
|PD9|D14|D14|D14|DA14|D14|Yes|
|PD10|D15|D15|D15|DA15|D15|Yes|
|PD11|-|-|A16|A16|CLE|Yes|
|PD12|-|-|A17|A17|ALE|Yes|
|PD13|-|-|A18|A18|-|Yes|
|PD14|D0|D0|D0|DA0|D0|Yes|
|PD15|D1|D1|D1|DA1|D1|Yes|
|PG2|-|-|A12|-|-|-|
|PG3|-|-|A13|-|-|-|
|PG4|-|-|A14|-|-|-|
|PG5|-|-|A15|-|-|-|
|PG6|-|-|-|-|INT2|-|
|PG7|-|-|-|-|INT3|-|
|PD0|D2|D2|D2|DA2|D2|Yes|
|PD1|D3|D3|D3|DA3|D3|Yes|
|PD3|-|-|CLK|CLK|-|Yes|
|PD4|NOE|NOE|NOE|NOE|NOE|Yes|
|PD5|NWE|NWE|NWE|NWE|NWE|Yes|
|PD6|NWAIT|NWAIT|NWAIT|NWAIT|NWAIT|Yes|
|PD7|-|-|NE1|NE1|NCE2|Yes|
|PG9|-|-|NE2|NE2|NCE3|-|
|PG10|NCE4_1|NCE4_1|NE3|NE3|-|-|
|PG11|NCE4_2|NCE4_2|-|-|-|-|
|PG12|-|-|NE4|NE4|-|-|
|PG13|-|-|A24|A24|-|-|
|PG14|-|-|A25|A25|-|-|
|PB7|-|-|NADV|NADV|-|Yes|
|PE0|-|-|NBL0|NBL0|-|Yes|
|PE1|-|-|NBL1|NBL1|-|Yes|

## CF CF/IDE NOR/PSRAM Mux NAND 16 bit

## NOR/PSRAM/ BGA100

1. Ports F and G are not available in devices delivered in 100-pin packages.
## DS5792 Rev 13 39/143
Memory mapping STM32F103xC, STM32F103xD, STM32F103xE
4 Memory mapping
The memory map is shown in Figure 9.
Figure 9. Memory map
OxA000 1000 - OxBFFF FFFF
FSMC register 0xA000 0000 - 0xA000 OFFF
FSMC bank4 PCCARD ‘0x9000 0000 - Ox9FFF FFFF
FSMC bank3 NAND (NAND2) | 0x8000 0000 - 0x8FFF FFFF
FSMC bank2 NAND (NAND1) | 0x7000 0000 - Ox7FFF FFFF
FSMC bank1 NOR/PSRAM 4 _| 0x6C00 0000 - Ox6FFF FFFF
FSMC bank1 NOR/PSRAM 3 | 0x6800 0000 - 0x6BFF FFFF
FSMC bank1 NOR/PSRAM 2 | 0x6400 0000 - 0x67FF FFFF
FSMC bank1 NOR/PSRAM 1 | 0x6000 0000 - 0x63FF FFFF
0x4002 4400 - Ox5FFF FFFF
| CRC | 0x4002 3000 - 0x4002 33FF
0x4002 2400 - 0x4002 2FFF
Flash interface 0x4002 2000 - 0x4002 23FF
0x4002 1400 - 0x4002 1FFF
|  RCC | Ox4002 1000 - 0x4002 13FF
0x4002 0400 - 0x4002 OFFF
0x4002 0400 - 0x4002 O7FF
0x4002 0000 - 0x4002 03FF
0x4001 8400 - 0x4001 FFFF
SDIO 0x4001 8000 - 0x4001 83FF
0x4001 400 - 0x4001 7FFF
0x4001 3C00 - 0x4001 3FFF
USART1 0x4001 3800 - 0x4001 3BFF
0x4001 3400 - 0x4001 37FF
0x4001 3000 - 0x4001 33FF
OXFFFF FFFF I 512-Mbyte 0x4001 2C00 - 0x4001 2FFF
block 7 0x4001 2800 - 0x4001 2BFF
Cortex-M3's 0x4001 2400 - 0x4001 27FF
0xE000 0000] peripherals 0x4001 1C00 - 0x4001 1FFF
OxDFFF FFFF 0x4001 1800 - 0x4001 1BFF
512-Mbyte 0X4001 1400 - 0x4001 17FF
block 6 0x4001 1000 - 0x4001 13FF
0x4001 0C00 - 0x4001 OFFF
Not used 0x4001 0800 - 0x4001 OBFF
0xC000 0000 ExTi 0x4001 0400 - 0x4001 O7FF
OxBFFF FFFF AFIÒO 0x4001 0000 - 0x4001 O3FF
512-Mbyte 0x4000 7800 - 0x4000 FFFF
block 5 0x4000 7400 - 0x4000 77FF
FSMC register 0x4000 7000 - 0x4000 73FF
0x4000 6C00 - 0x4000 6FFF
000 0000 0x4000 6800 - 0x4000 6BFF
512-Mbyte BxCAN 0x4000 6400 - 0x4000 67FF
block 4 Shared USB/CAN SRAM 512 | 0x4000 6000 - 0x4000 63FF
FSMC bank 3 0x4000 5C00 - 0x4000 5FFF
& bank4 0x4000 5800 - 0x4000 5BFF
8000 00001... 0x4000 5400 - 0x4000 57FF
512-Mbyte UART5S 0x4000 5000 - 0x4000 53FF
block 3 UART4 0x4000 4C00 - 0x4000 4FFF
FSMC bank1 USART3 0x4000 4800 - 0x4000 4BFF
& bank2 USART2 0x4000 4400 - 0x4000 47FF
0x6000 0000
Ox5FFF FFFF 0x4000 4000 - 0x4000 43FF
512-Mbyte SPI3/1783 0x4000 3C00 - 0x4000 3FFF
block 2 SPI2/1°82 0x4000 3800 - 0x4000 3BFF
Peripherals 0x4000 3400 - 0x4000 37FF
IWDG -
0x4000 0000 0x4000 3000 - 0x4000 33FF
Ox3FFF FFFF WWDG 0x4000 2C00 - 0x4000 2FFF
512-Mbyte 0x4000 2800 - 0x4000 2BFF
block 1 0x4000 1800 - 0x4000 27FF
SRAM 0x4000 1400 - 0x4000 17FF
0x2000 0000 0x4000 1000 - 0x4000 13FF
Ox1FFF FFFÉ 0x4000 0C00 - 0x4000 OFFF
512-Mbyte |\ 0x4000 0800 - 0x4000 OBFF
block 0 0x4000 0400 - 0x4000 O7FF
Code 0x4000 0000 - 0x4000 O3FF
0x0000 0000 Ox3FFF FFFF
Reserved
0x2001 0000
SRAM (64 KB aliased | 0x2000 FFFF
by bit-banding ‘0x2000 0000
0x1FFF F800 - 0x1FFF F80F
0x1FFF F000- 0x1FFF F7FF
Reserved O0x1FFF EFFF
0x0808 0000
Flash 0x0800 0000
_ 0x0008 0000
Aliased to Flash or system | 0x0007 FFFF
memory depending on '
BOOT pins 0x0000 0000 ai14753d
40/143 DS$5792 Rev 13 £y7
|5.1.1 5.1.5||STM32F103xC, STM32F103xD, STM32F103xE 5 Electrical characteristics 5.1 Parameter conditions Minimum and maximum values the selected temperature range). 5.1.2 Typical values tested. error less than or equal to the value indicated (mean±2Σ) 5.1.3 Typical curves not tested. 5.1.4 Loading capacitor Pin input voltage|Unless otherwise specified, all voltages are referenced to VSS. Unless otherwise specified the minimum and maximum values are guaranteed in the worst conditions of ambient temperature, supply voltage and frequencies by tests in production on 100% of the devices with an ambient temperature at TA = 25 °C and TA = TAmax (given by Data based on characterization results, design simulation and/or technology characteristics are indicated in the table footnotes and are not tested in production. Based on characterization, the minimum and maximum values refer to sample tests and represent the mean value plus or minus three times the standard deviation (mean±3Σ). Unless otherwise specified, typical data are based on TA = 25 °C, VDD = 3.3 V (for the 2V≤ VDD ≤ 3.6 V voltage range). They are given only as design guidelines and are not Typical ADC accuracy values are determined by characterization of a batch of samples from a standard diffusion lot over the full temperature range, where 95% of the devices have an. Unless otherwise specified, all typical curves are given only as design guidelines and are The loading conditions used for pin parameter measurement are shown in The input voltage measurement on a pin of the device is described in|Figure 11|Electrical characteristics Figure 10..|
|---|---|---|---|---|---|
|||Figure 10. Pin loading conditions -#5PIN #P&|6). -36 DS5792 Rev 13|Figure 11. Pin input voltage -#5PIN|-36 41/143|
||||||135|
Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE
5.1.6 Power supply scheme
Figure 12. Power supply scheme
VBAT Hm
®) Backup circuitry
1.8-3.6V (OSC32K,RTC,
CN Wake-up logic
= Backup registers)
<< OUT 5 i
| 10 !
S Kernel logic |!
i (CPU, '
v ! Digital '
DD ! & Memories) |!
Vpp1/2/.../11 È Regulati | '
H eg ulator ] '
11 x 100 nF i i
+1x47 pF È i '
= Vss1/2/.../11 = e — —
‘po VpDA
Vv i H
REF i
IVREF+ DL
10 nF LE L_ ADC/ Analog:
10 nF Vv DAC RCs, PLL
+1 HF REF- , PEL,
+1 pF “PT _ i
la Lo
= > H ai15401
Caution: In Figure 12, the 4.7 pF capacitor must be connected to Vpp3.
5.1.7 Current consumption measurement
Figure 13. Current consumption measurement scheme
g
IDD_VBAT,
® BAT,
"i ]
Ipp
Vpp
(PL
1
- H
ai14126
42/143 DS5792 Rev 13 £y/
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# 5.2 Absolute maximum ratings

Stresses above the absolute maximum ratings listed in *Table 7: Voltage characteristics*,

*Table 8: Current characteristics*, and *Table 9: Thermal characteristics* may cause permanent

damage to the device. These are stress ratings only and functional operation of the device at these conditions is not implied. Exposure to maximum rating conditions for extended periods may affect device reliability.

**Table 7. Voltage characteristics**

## Symbol Ratings Min Max Unit

External main supply voltage (including VDDA VDD–VSS(1)–0.3 4.0 and VDD) V

(2) Input voltage on five volt tolerant pin VSS − 0.3 VDD + 4.0
VIN Input voltage on any other pin VSS −0.3 4.0 |ΔVDDx| Variations between different VDD power pins-50 Variations between all the different ground mV |VSSX −VSS|(3)-50 pins see *Section 5.3.12:* Electrostatic discharge voltage (human body VESD(HBM) *Absolute maximum ratings*- model) *(electrical sensitivity)*

1. All main power (VDD, VDDA) and ground (VSS, VSSA) pins must always be connected to the external power supply, in the permitted range.
2. VIN maximum must always be respected. Refer to *Table 8: Current characteristics* for the maximum allowed injected current values.
3. Include VREF- pin.
**Table 8. Current characteristics**

## Ratings

|Symbol||Max.|Unit|
|---|---|---|---|
|IVDD|Total current into VDD/VDDA power lines (source)|150||
|IVSS IIO IINJ(PIN)|Total current out of VSS ground lines (sink) Output current sunk by any I/O and control pin Output current source by any I/Os and control pin Injected current on five volt tolerant pins Injected current on any other pin|150 25 − 25 -5/+0 ± 5|mA|
|ΣIINJ(PIN)|Total injected current (sum of all I/O and control pins)|± 25||

(1)
(1)
(2)
(3)
(4)
(5)
1. All main power (VDD, VDDA) and ground (VSS, VSSA) pins must always be connected to the external power supply, in the permitted range.
2. Negative injection disturbs the analog performance of the device. See note 3 below *Table 62 on page 108*.
3. Positive injection is not possible on these I/Os. A negative injection is induced by VIN<VSS. IINJ(PIN) must never be exceeded. Refer to *Table 7: Voltage characteristics* for the maximum allowed input voltage values.
4. A positive injection is induced by VIN>VDD while a negative injection is induced by VIN<VSS. IINJ(PIN) must never be exceeded. Refer to *Table 7: Voltage characteristics* for the maximum allowed input voltage values.
5. When several inputs are submitted to a current injection, the maximum ΣIINJ(PIN) is the absolute sum of the positive and negative injected currents (instantaneous values).
## DS5792 Rev 13 43/143
### Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 9. Thermal characteristics Ratings**

|Symbol||Value|Unit|
|---|---|---|---|
|TSTG|Storage temperature range|–65 to +150|°C|
|TJ|Maximum junction temperature|150|°C|

# 5.3 Operating conditions

## 5.3.1 General operating conditions

**Table 10. General operating conditions Parameter**

|Symbol|||Conditions|Min|Max|Unit|
|---|---|---|---|---|---|---|
|f|Internal AHB clock frequency||-|0|72||
|f|Internal APB1 clock frequency||-|0|36|MHz|
|f|Internal APB2 clock frequency||-|0|72||
|VDD|Standard operating voltage Analog operating voltage||-|2 23.6|3.6|V|
|VDDA|(ADC not used) Analog operating voltage (ADC used)|Must be the same potential as VDD||2.4|3.6|V|
|VBAT|Backup operating voltage||-|1.8|3.6|V|
|||LQFP144||-|666||
|||LQFP100||-|434||
||Power dissipation at TA =|LQFP64||-|444||
|PD|85 °C for suffix 6 or TA =|||||mW|
||105 °C for suffix 7|LFBGA100||-|500||
|||LFBGA144||-|500||
|||WLCSP64||-|400||
|TA|Ambient temperature for 6 suffix version|Maximum power dissipation -40 Low-power dissipation||-40|85 105|°C|
||Ambient temperature for 7 suffix version|Maximum power dissipation Low-power dissipation||-40 -40|105 125|°C|
|||6 suffix version||-40|105||
|TJ|Junction temperature range|||||°C|
|||7 suffix version||-40|125||

HCLK PCLK1 PCLK2

(1)
(2)
(3)
(4)
(4)
1. When the ADC is used, refer to *Table 59: ADC characteristics*.
2. It is recommended to power VDD and VDDA from the same source. A maximum difference of 300 mV between VDD and VDDA can be tolerated during power-up and operation.
3. If TA is lower, higher PD values are allowed as long as TJ does not exceed TJmax (see *Table 6.7: Thermal* *characteristics on page 132*).
4. In low-power dissipation state, TA can be extended to this range as long as TJ does not exceed TJmax (see
*Table 6.7: Thermal characteristics on page 132*).

### 44/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# 5.3.2 Operating conditions at power-up / power-down

The parameters given in *Table 11* are derived from tests performed under the ambient temperature condition summarized in *Table 10*.

**Table 11. Operating conditions at power-up / power-down**

**Symbol Parameter Conditions Min Max Unit** <u>VDD rise time rate 0 ∞</u> t VDD-µs/V VDD fall time rate 20 ∞

# 5.3.3 Embedded reset and power control block characteristics

The parameters given in *Table 12* are derived from tests performed under ambient temperature and VDD supply voltage conditions summarized in *Table 10*.

**Table 12. Embedded reset and power control block characteristics**

**Parameter Conditions**

|Symbol|||Min|Typ|Max|Unit|
|---|---|---|---|---|---|---|
|||PLS[2:0]=000 (rising edge)|2.1|2.18|2.26||
|||PLS[2:0]=000 (falling edge)|2|2.08|2.16||
|||PLS[2:0]=001 (rising edge)|2.19|2.28|2.37||
|||PLS[2:0]=001 (falling edge)|2.09|2.18|2.27||
|||PLS[2:0]=010 (rising edge)|2.28|2.38|2.48||
|||PLS[2:0]=010 (falling edge)|2.18|2.28|2.38||
|||PLS[2:0]=011 (rising edge)|2.38|2.48|2.58||
||Programmable voltage|PLS[2:0]=011 (falling edge)|2.28|2.38|2.48||
|VPVD|detector level selection|PLS[2:0]=100 (rising edge)|2.47|2.58|2.69|V|
|||PLS[2:0]=100 (falling edge)|2.37|2.48|2.59||
|||PLS[2:0]=101 (rising edge)|2.57|2.68|2.79||
|||PLS[2:0]=101 (falling edge)|2.47|2.58|2.69||
|||PLS[2:0]=110 (rising edge)|2.66|2.78|2.9||
|||PLS[2:0]=110 (falling edge)|2.56|2.68|2.8||
|||PLS[2:0]=111 (rising edge)|2.76|2.88|3||
|||PLS[2:0]=111 (falling edge)|2.66|2.78|2.9||
|V|PVD hysteresis|-|-|100|-|mV|
||Power on/power down|Falling edge|1.8|1.88|1.96||
|VPOR/PDR|reset threshold|Rising edge|1.84|1.92|2.0|V|
|V|PDR hysteresis|-|-|40|-|mV|
|TRSTTEMPO|Reset temporization|-|1|2.5|4.5|ms|

PVDhyst(2)

(1)
PDRhyst(2)

(2)
1. The product behavior is guaranteed by design down to the minimum VPOR/PDR value.
2. Guaranteed by design.
DS5792 Rev 13 45/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

||5.3.4 Embedded reference voltage The parameters given in Table 13 temperature and VDD supply voltage conditions summarized in|are derived from tests performed under ambient Table 13. Embedded internal reference voltage|Table 10|.|||
|---|---|---|---|---|---|---|
|Symbol|Parameter|Conditions|Min|Typ|Max|Unit|
|||–40 °C < TA < +105 °C|1.16|1.20|1.26||
|VREFINT|Internal reference voltage|–40 °C < TA < +85 °C|1.16|1.20|1.24|V|
|T S_vrefint(1)|ADC sampling time when reading the internal reference voltage|||--5.117.1|(2)|µs|
|T Coeff(2)|Temperature coefficient|-|-|-|100|ppm/°C|
|1. 2. binary code. measurement scheme • • • • •|Shortest sampling time can be determined in the application by multiple iterations. Guaranteed by design. Supply current characteristics The current consumption is measured as described in. reduced code that gives a consumption equivalent to Dhrystone 2.1 code. Maximum current consumption The MCU is placed under the following conditions: All peripherals are disabled except when explicitly mentioned to 24 MHz, 1 wait state from 24 to 48 MHz and 2 wait states above) When the peripherals are enabled fPCLK1 = fHCLK/2, fPCLK2 = fHCLK The parameters given in Table 14, Table 15 under ambient temperature and VDD supply voltage conditions summarized in DS5792 Rev 13|The current consumption is a function of several parameters and factors such as the operating voltage, ambient temperature, I/O pin loading, device software configuration, operating frequencies, I/O pin switching rate, program location in memory and executed All Run-mode current consumption measurements given in this section are performed with a All I/O pins are in input mode with a static value at VDD or VSS (no load) The Flash memory access time is adjusted to the fHCLK frequency (0 wait state from 0 Prefetch in ON (reminder: this bit must be set before clock setting and bus prescaling) and Table 16||Figure 13: Current consumption are derived from tests performed|Table 10|.|

(2) VRERINT Internal reference voltage spread over the temperature range VDD = 3 V ±10 mV - - 10 mV

## 5.3.5

46/143
# STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Table 14. Maximum current consumption in Run mode, code with data processing running from Flash**

**(1)**
**Max**

|Symbol|Parameter|Conditions|f|||Unit|
|---|---|---|---|---|---|---|
|||||TA = 85 °C|TA = 105 °C||
||||72 MHz|69|70||
|||External clock peripherals enabled|48 MHz, all 36 MHz 24 MHz|50 39 27|50.5 39.5 28||
||||16 MHz|20|20.5||
||Supply current in||8 MHz|11|11.5||
|IDD|Run mode||72 MHz|37|37.5|mA|
|||External clock peripherals disabled|48 MHz, all 36 MHz 24 MHz|28 22 16.5|28.5 22.5 17||
||||16 MHz|12.5|13||
|1. Guaranteed by characterization results. 2. External clock is 8 MHz and PLL is on when f|||8 MHz > 8 MHz.|8|8||

**HCLK**

(2)
(2)
HCLK CIAO

**Table 15. Maximum current consumption in Run mode, code with data processing running from RAM**

**(1)**
**Max** **Symbol Parameter Conditions fHCLKUnit** **TA = 85 °C TA = 105 °C** 72 MHz 66 67 48 MHz 43.5 45.5

(2) 36 MHz 33 35
External clock, all peripherals enabled 24 MHz 23 24.5 16 MHz 16 18 Supply current 8 MHz 9 10.5 IDD mA in Run mode 72 MHz 33 33.5 48 MHz 23 23.5

(2) 18 18.5
External clock, all 36 MHz peripherals disabled 24 MHz 13 13.5 16 MHz 10 10.5 8 MHz 6 6.5

|1. Guaranteed by characterization results at VDD max, f|HCLKmax.|
|---|---|
|2. External clock is 8 MHz and PLL is on when f|HCLK> 8 MHz.|

## DS5792 Rev 13 47/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 14. Typical current consumption in Run mode versus frequency (at 3.6 V) -**

## code with data processing running from RAM, peripherals enabled

-(Z -(Z -(Z -(Z **#ONSUMPTIONM!**-(Z -(Z

**4EMPERATURE #** AI

**Figure 15. Typical current consumption in Run mode versus frequency (at 3.6 V)-**

## code with data processing running from RAM, peripherals disabled

-(Z -(Z -(Z -(Z -(Z #ONSUMPTIONM!<u>-(Z</u>

4EMPERATURE�#

AI

48/143 DS5792 Rev 13
# STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Table 16. Maximum current consumption in Sleep mode, code running from Flash or RAM**

**(1)**
**Max** **Symbol Parameter Conditions fHCLKUnit** **TA = 85 °C TA = 105 °C**

72 MHz 45 46

48 MHz 31 32

(2) 36 MHz 24 25
External clock, all peripherals enabled 24 MHz 17 17.5

16 MHz 12.5 13

Supply current 8 MHz 8 8 IDD mA in Sleep mode 72 MHz 8.5 9

48 MHz 7 7.5

(2) 36 MHz 6 6.5
External clock, all peripherals disabled 24 MHz 5 5.5

16 MHz 4.5 5

8 MHz 4 4

|1. Guaranteed by characterization results at VDD max, f|HCLKmax with peripherals enabled.|
|---|---|
|2. External clock is 8 MHz and PLL is on when f|HCLK> 8 MHz.|

DS5792 Rev 13 49/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

|||Table 17. Typical and maximum current consumptions in Stop and Standby modes|||||||
|---|---|---|---|---|---|---|---|---|
|||||(1) Typ|||Max||
|Symbol|Parameter|Conditions|V /V DD BAT = 2.0 V|V /V DD BAT = 2.4 V|V /V DD BAT = 3.3 V|T = A 85 °C|T = A 105 °C|Unit|
||Supply|Regulator in run mode, low- speed and high-speed internal RC oscillators and high-speed oscillator OFF (no independent watchdog)|-|34.5|35|379|1130||
|IDD|current in Stop mode|Regulator in low-power mode, low-speed and high-speed internal RC oscillators and high- speed oscillator OFF (no independent watchdog) Low-speed internal RC oscillator and independent watchdog ON|-|24.5|25 -33.8--|365|1110|µA|
||Supply current in|Low-speed internal RC oscillator ON, independent watchdog OFF|||-2.83.6--||||
||Standby mode|Low-speed internal RC oscillator and independent watchdog OFF, low-speed oscillator and RTC OFF|||-1.92.15|(2)|(2) 6.5||
|IDD_VBAT|Backup domain supply current|Low-speed oscillator and RTC ON|1.05|1.1|1.4|(2) 2|(2) 2.3||
|1. 2. 50/143|Typical values are measured at TA = 25 °C. Guaranteed by characterization results.|DS5792 Rev 13|||||||
STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics
Figure 16. Typical current consumption on Vear with RTC on vs. temperature
at different Var values
2.5
2
= 4 18V
E 1.5 2V
E 4A-24V
2 3.3 V
ò 3.6V
0.5
0
45 25 85 105
Temperature (°C) 117337
Figure 17. Typical current consumption in Stop mode with regulator in run mode
versus temperature at different Vpp values
600
500
_ 400
z
2
= > 2.4V
è 300 S=2.7V
2 4 3.0V
3 E 3.3V
200
= 3.6V
100
0
-45C 25C 85C 105C
Temperature (°C)
ai18521
£y7 D$5792 Rev 13 51/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 18. Typical current consumption in Stop mode with regulator in low-power mode versus temperature at different VDD values**

**ȝ!**

|6 6 6 6 6|||
|---|---|---|
|#|AI||
|||6 6|
|||6 6 6|

#ONSUMPTION

# # # 4EMPERATURE�#

**Figure 19. Typical current consumption in Standby mode versus temperature at different VDD values**

! #ONSUMPTION # # # # 4EMPERATURE�#AI

52/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

|• • • • •|Typical current consumption|The MCU is placed under the following conditions: All I/O pins are in input mode with a static value at VDD or VSS (no load). All peripherals are disabled except if it is explicitly mentioned. wait state from 24 to 48 MHZ and 2 wait states above). Ambient temperature and VDD supply voltage conditions summarized in|The Flash access time is adjusted to fHCLK frequency (0 wait state from 0 to 24 MHz, 1 Prefetch is ON (Reminder: this bit must be set before clock setting and bus prescaling) When the peripherals are enabled fPCLK1 = fHCLK/4, fPCLK2 = fHCLK/2, fADCCLK = fPCLK2/4 Table 18. Typical current consumption in Run mode, code with data processing running from Flash||Table 10|.|
|---|---|---|---|---|---|---|
|||||Typ|(1)||
|Symbol|Parameter|Conditions|f HCLK|All peripherals (2) enabled|All peripherals disabled|Unit|
||||72 MHz|51|30.5||
||||48 MHz|34.6|20.7||
||||36 MHz|26.6|16.2||
||||24 MHz|18.5|11.4||
|||(3) External clock|16 MHz 8 MHz|12.8 7.2|8.2 5|mA|
||||4 MHz|4.2|3.1||
||||2 MHz|2.7|2.1||
||||1 MHz|2|1.7||
||Supply||500 kHz 125 kHz|1.6 1.3|1.4 1.2||
|IDD|current in Run mode||64 MHz|45|27||
||||48 MHz|34|20.1||
|||Running on high speed internal RC (HSI), AHB prescaler used to reduce the frequency|36 MHz 24 MHz 16 MHz 8 MHz 4 MHz 2 MHz|26 17.9 12.2 6.6 3.6 2.1|15.6 10.8 7.6 4.4 2.5 1.5|mA|
||||1 MHz|1.4|1.1||
||||500 kHz|1|0.8||
||||125 kHz|0.7|0.6||
|1.||Typical values are measures at TA = 25 °C, VDD = 3.3 V. DS5792 Rev 13||||53/143|
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

|2. 3.|External clock is 8 MHz and PLL is on when f|consumption occurs only while the ADC is on (ADON bit is set in the ADC_CR2 register). HCLK|Add an additional power consumption of 0.8 mA per ADC for the analog part. In applications, this > 8 MHz. Table 19. Typical current consumption in Sleep mode, code running from Flash or RAM||||
|---|---|---|---|---|---|---|
|||||Typ|(1)||
|Symbol|Parameter|Conditions|f HCLK|All peripherals (2) enabled|All peripherals disabled|Unit|
||||72 MHz|29.5|6.4||
||||48 MHz|20|4.6||
||||36 MHz|15.1|3.6||
||||24 MHz|10.4|2.6||
|||(3) External clock|16 MHz 8 MHz|7.2 3.9|2 1.3||
||||4 MHz|2.6|1.2||
||||2 MHz|1.85|1.15||
||||1 MHz|1.5|1.1||
||Supply||500 kHz 125 kHz|1.3 1.2|1.05 1.05||
|IDD|current in Sleep mode||64 MHz|25.6|5.1|mA|
||||48 MHz|19.4|4||
||||36 MHz|14.5|3||
|||Running on high speed internal RC (HSI), AHB prescaler used to reduce the frequency|24 MHz 16 MHz 8 MHz 4 MHz|9.8 6.6 3.3 2|2 1.4 0.7 0.6||
||||2 MHz|1.25|0.55||
||||1 MHz|0.9|0.5||
||||500 kHz|0.7|0.45||
||||125 kHz|0.6|0.45||
|1. 2. 3.|External clock is 8 MHz and PLL is on when f|Typical values are measures at TA = 25 °C, VDD = 3.3 V. consumption occurs only while the ADC is on (ADON bit is set in the ADC_CR2 register). HCLK DS5792 Rev 13|Add an additional power consumption of 0.8 mA per ADC for the analog part. In applications, this > 8 MHz.||||

54/143
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# On-chip peripheral current consumption

The current consumption of the on-chip peripherals is given in *Table 20*. The MCU is placed under the following conditions:

- all I/O pins are in input mode with a static value at VDD or VSS (no load)
- all peripherals are disabled unless otherwise mentioned
- the given value is calculated by measuring the current consumption – with all peripherals clocked off – with only one peripheral clocked on
- ambient operating temperature and VDD supply voltage conditions summarized in
*Table 7*

**Table 20. Peripheral current consumption**

||Current|Unit|
|---|---|---|
||consumption||
|DMA1|20,42||
|DMA2|19,03||
|FSMC|52,36|μA/MHz|
|CRC|2,36||
|SDIO|33,33||
|BusMatrix|9,72||

Peripheral

AHB (up to 72 MHz)

(1)
DS5792 Rev 13 55/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 20. Peripheral current consumption (continued)**

||Current|Unit|
|---|---|---|
||consumption||
|APB1-Bridge|7,78||
|TIM2|33,06||
|TIM3|31,94||
|TIM4|31,67||
|TIM5|31,94||
|TIM6|8,06||
|TIM7|8,06||
|SPI2/I2S2|8,33||
|SPI3/I2S3|8,33||
|USART2|12,22||
|USART3|12,22|μA/MHz|
|UART4|12,22||
|UART5|12,22||
|I2C1|10,28||
|I2C2|10,00||
|USB|18,06||
|CAN1|18,33||
|DAC|8,06||
|WWDG|3,89||
|PWR|1,11||
|BKP|1,11||
|IWDG|5,28||

Peripheral

(2)
(2)
## APB1 (up to 36 MHz)

(3)
## 56/143 DS5792 Rev 13
# STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Table 20. Peripheral current consumption (continued)**

||Current|Unit|
|---|---|---|
||consumption||
|APB2-Bridge GPIOA 8,47|4,17||
|GPIOB|8,47||
|GPIOC|6,53||
|GPIOD|8,47||
|GPIOE|6,53||
|GPIOF|6,53||
|GPIOG|6,11|μA/MHz|
|SPI1|4,72||
|USART1|12,50||
|TIM1|22,92||
|TIM8|22,92||
|ADC1|17,32||
|ADC2|15,18||
|ADC3|14,82||

Peripheral

## APB2 (up to 72 MHz)

(4)
(4)
(4)
1. The BusMatrix is automatically active when at least one master is ON. (CPU, DMA1 or DMA2).
2. When the I2S is enabled, a current consumption equal to 0.02 mA must be added.
3. When DAC_OU1 or DAC_OUT2 is enabled, a current consumption equal to 0.36 mA must be added.
4. Specific conditions for measuring ADC current consumption: fHCLK = 56 MHz, fAPB1 = fHCLK/2, fAPB2 = f HCLK, fADCCLK = fAPB2/4. When ADON bit in the ADCx_CR2 register is set to 1, a current consumption of analog part equal to 0.54 mA must be added for each ADC.
## DS5792 Rev 13 57/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

|5.3.6 External clock summarized in||source characteristics High-speed external user clock generated from an external source The characteristics given in Table 21 Table 10.|external clock source, and under ambient temperature and supply voltage conditions Table 21. High-speed external user clock characteristics||result from tests performed using an high-speed|||||||
|---|---|---|---|---|---|---|---|---|---|---|---|
|Symbol f HSE_ext||Parameter User external clock source (1) frequency||Conditions||Min||Typ||Max 1825MHz|Unit|
|VHSEH||OSC_IN input pin high level voltage||||0.7VDD||||-V DD||
|V HSEL t w(HSE) t w(HSE)||OSC_IN input pin low level voltage (1) OSC_IN high or low time||-||V SS|5- -|||-0.3V DD|V|
|t r(HSE) t f(HSE)||(1) OSC_IN rise or fall time||||||||--20|ns|
|C in(HSE)||(1) OSC_IN input capacitance||||||||--5-pF||
|DuCy (HSE)||Duty cycle||-||45||-||55|%|
|IL||OSC_IN Input leakage current||VSS ≤VIN ≤VDD||||||--±1µA||
|1. summarized in||Guaranteed by design. Low-speed external user clock generated from an external source The characteristics given in Table 22 Table 10.|external clock source, and under ambient temperature and supply voltage conditions Table 22. Low-speed external user clock characteristics||result from tests performed using an low-speed|||||||
|Symbol||Parameter||Conditions|Min|||Typ||Max|Unit|
|f LSE_ext||User External clock source (1) frequency|||-|||32.768||1000|kHz|
|VLSEH||OSC32_IN input pin high level voltage|||0.7VDD|||||-V DD||
|VLSEL||OSC32_IN input pin low level voltage||-|VSS|||||-0.3V DD|V|
|t w(LSE) t w(LSE)||(1) OSC32_IN high or low time|||450|||-||-||
|t r(LSE) t f(LSE)||(1) OSC32_IN rise or fall time||||||--50|||ns|
|C in(LSE)||(1) OSC32_IN input capacitance||||||--5-pF||||
|DuCy (LSE)||Duty cycle||-|30|||-||70|%|
|IL||OSC32_IN Input leakage current||VSS ≤VIN ≤VDD||||||--±1µA||
|1.||Guaranteed by design. DS5792 Rev 13||||||||||

58/143
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 20. High-speed external clock source AC timing diagram**

6(3%(

|6(3%,|||
|---|---|---|
|TR(3%|TF(3%|T7(3% T|
||4(3%||

T7(3%

|%XTERNAL|F(3%?EXT|),|
|---|---|---|
|CLOCKSOURCE|/3#?).||
|||34-&|

AI

**Figure 21. Low-speed external clock source AC timing diagram**

9/6(+ 9/6(/ WU/6( WI/6( W:/6( W:/6( W 7/6(

|([WHUQDO|I/6(BH[W|,/|
|---|---|---|
|FORFNVRXUFH|26&B,1||
|||670)|

DL

DS5792 Rev 13 59/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

||High-speed external clock generated from a crystal/ceramic resonator resonator oscillator. All the information given in this paragraph are based on characterization results obtained with typical external components specified in the application, the resonator and the load capacitors have to be placed as close as time. Refer to the crystal resonator manufacturer for more details on the resonator characteristics (frequency, package, accuracy).|The high-speed external (HSE) clock can be supplied with a 4 to 16 MHz crystal/ceramic possible to the oscillator pins in order to minimize output distortion and startup stabilization Table 23. HSE 4-16 MHz oscillator characteristics(1)(2)|||Table 23|. In|
|---|---|---|---|---|---|---|
|Symbol|Parameter|Conditions|Min|Typ|Max|Unit|
|f OSC_IN|Oscillator frequency|-|4|8|16|MHz|
|RF|Feedback resistor|-|-|200|-|kΩ|
|C|Recommended load capacitance versus equivalent serial (3) resistance of the crystal (RS)|RS = 30 Ω|||-30-pF||
|i 2|HSE driving current|V = 3.3 V, V =V DD IN SS with 30 pF load|||--1mA||
|g m|Oscillator transconductance|Startup|25|-|-|mA/V|
|t SU(HSE)(4)|Startup time|VDD is stabilized|-|2|-|ms|
|1. 2. 3. 4. t SU(HSE)|Resonator characteristics given by the crystal/ceramic resonator manufacturer. Guaranteed by characterization results. humid environment, due to the induced leakage and the bias condition change. However, it is recommended to take this point into account if the MCU is used in tough humidity conditions. with the crystal manufacturer the requirements of the crystal or resonator (see CL1 and CL2. Refer to the application note AN2867 “Oscillator design guide for ST microcontrollers” available from the ST website|The relatively low value of the RF resistor offers a good protection against issues resulting from use in a is the startup time measured from the moment it is enabled (by software) to a stabilized 8 MHz oscillation is reached. This value is measured for a standard crystal resonator and it can vary significantly For CL1 and CL2, it is recommended to use high-quality external ceramic capacitors in the 5 pF to 25 pF range (typ.), designed for high-frequency applications, and selected to match Figure 22 same size. The crystal manufacturer typically specifies a load capacitance which is the series combination of CL1 and CL2. PCB and MCU pin capacitance must be included (10 pF can be used as a rough estimate of the combined pin and board capacitance) when sizing www.st.com.||). CL1 and CL2 are usually the|||
|1.|DS5792 Rev 13||||||

**Figure 22. Typical application with an 8 MHz crystal**

5HVRQDWRUZLWK LQWHJUDWHGFDSDFLWRUV &/ <u>26&B,1 I+6(</u> %LDV 0+]

5) FRQWUROOHG
UHVRQDWRU JDLQ

&/ 5(;7 26&B287 670) DL

REXT value depends on the crystal characteristics.

60/143
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# Low-speed external clock generated from a crystal/ceramic resonator

The low-speed external (LSE) clock can be supplied with a 32.768 kHz crystal/ceramic resonator oscillator. All the information given in this paragraph are based on characterization results obtained with typical external components specified in *Table 24*. In the application, the resonator and the load capacitors have to be placed as close as possible to the oscillator pins in order to minimize output distortion and startup stabilization time. Refer to the crystal resonator manufacturer for more details on the resonator characteristics (frequency, package, accuracy).

**Table 24. LSE oscillator characteristics (fLSE = 32.768 kHz)(1)(2)**

**Parameter**

|Symbol|||Conditions|Min Typ|Max|Unit|
|---|---|---|---|---|---|---|
|RF|Feedback resistor Recommended load capacitance||-|-5|-|MΩ|
|C|versus equivalent serial resistance of the crystal (RS)||RS = 30 kΩ|--15pF|||
|I|LSE driving current|VDD = 3.3 V, VIN = VSS||--1.4µA|||
|g|Oscillator transconductance||-|5-|-|µA/V|
||||TA = 50 °C|-1.5|-||
||||TA = 25 °C|-2.5|-||
|||V is|TA = 10 °C TA = 0 °C|-4 -6|- -||
|t|Startup time|stabilized|T = -10 °C|-10|-|s|
||||TA = -20 °C|-17|-||
||||TA = -30 °C|-32|-||
|1. Guaranteed by characterization results. 2. Refer to the note and caution paragraphs below the table, and to the application note AN2867 “Oscillator design guide for ST microcontrollers”. 3. t|is the startup time measured from the moment it is enabled (by software) until a stabilized 32.768 kHz oscillation is||TA = -40 °C|-60|-||

(2) 2 m
DD SU(LSE)(3) A

SU(LSE) reached. This value is measured for a standard crystal and it can vary significantly with the crystal manufacturer, PCB layout and humidity.

*Note: For CL1 and CL2, it is recommended to use high-quality ceramic capacitors in the 5 pF to*

*15 pF range selected to match the requirements of the crystal or resonator (see Figure 23).* *CL1 and CL2, are usually the same size. The crystal manufacturer typically specifies a load* *capacitance which is the series combination of CL1 and CL2.* *Load capacitance CL has the following formula: CL =* CL1 *x* CL2 */ (*CL1 *+* CL2*) + Cstray where* *Cstray is the pin capacitance and board or trace PCB-related capacitance. Typically, it is* *between 2 pF and 7 pF.*

**Caution:** To avoid exceeding the maximum value of CL1 and CL2 (15 pF) it is strongly recommended to use a resonator with a load capacitance CL ≤ 7 pF. Never use a resonator with a load capacitance of 12.5 pF. **Example:** if you choose a resonator with a load capacitance of CL = 6 pF, and Cstray = 2 pF, then CL1 = CL2 = 8 pF.

DS5792 Rev 13 61/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 23. Typical application with a 32.768 kHz crystal**

5HVRQDWRUZLWK LQWHJUDWHGFDSDFLWRUV &/ <u>26&B,1 I/6(</u> %LDV N+] 5) FRQWUROOHG UHVRQDWRU JDLQ 26&B287 670) &/ DL

# 5.3.7 Internal clock source characteristics

The parameters given in *Table 25* are derived from tests performed under ambient temperature and VDD supply voltage conditions summarized in *Table 10*.

## High-speed internal (HSI) RC oscillator

**Table 25. HSI oscillator characteristics(1)**

|Symbol|Parameter||Conditions|Min|Typ Max|Unit|
|---|---|---|---|---|---|---|
|f|Frequency|-||-|8-|MHz|
|DuCy|Duty cycle|- User-trimmed with the RCC_CR register||45 --1%|-55|%|
||Accuracy of the HSI||T = –40 to 105 °C|–2|-2.5|%|
|ACCHSI t|oscillator HSI oscillator startup time|Factory- calibrated -1-2µs|TA = –10 to 85 °C T = 0 to 70 °C TA = 25 °C|–1.5 –1.3 –1.1|-2.2 -2 -1.8|% % %|
|IDD(HSI)|HSI oscillator power|-||-|80 100|µA|

HSI (HSI)

(3)
(2) A
(4) A
su(HSI)(4)

(4) consumption
1. VDD = 3.3 V, TA = –40 to 105 °C unless otherwise specified.
2. Refer to application note AN2868 “STM32F10xxx internal RC oscillator (HSI) calibration” available from the ST website *www.st.com*.
3. Guaranteed by design.
4. Guaranteed by characterization results.
62/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# Low-speed internal (LSI) RC oscillator

**Table 26. LSI oscillator characteristics (1)**

**Parameter**

|Symbol||Min|Typ|Max|Unit|
|---|---|---|---|---|---|
|f|Frequency 30||40|60|kHz|
|t|LSI oscillator startup time|-|-|85|µs|
|IDD(LSI)|LSI oscillator power consumption|-|0.65|1.2|µA|

LSI(2) su(LSI)(3)

(3)
1. VDD = 3 V, TA = –40 to 105 °C unless otherwise specified.
2. Guaranteed by characterization results.
3. Guaranteed by design.
# Wakeup time from low-power mode

The wakeup times given in *Table 27* is measured on a wakeup phase with a 8-MHz HSI RC oscillator. The clock source used to wake up the device depends from the current operating mode:

- Stop or Standby mode: the clock source is the RC oscillator
- Sleep mode: the clock source is the clock that was set before entering Sleep mode. All timings are derived from tests performed under ambient temperature and VDD supply voltage conditions summarized in *Table 10*.
**Table 27. Low-power mode wakeup timings**

**Parameter**

|Symbol||Typ|Unit|
|---|---|---|---|
|t|Wakeup from Sleep mode Wakeup from Stop mode (regulator in run mode)|1.8 3.6|µs|
|t|Wakeup from Stop mode (regulator in low-power mode)|5.4|µs|
|t|Wakeup from Standby mode|50|µs|

WUSLEEP(1)

WUSTOP(1)

WUSTDBY(1)

1. The wakeup times are measured from the wakeup event to the point in which the user application code reads the first instruction.
DS5792 Rev 13 63/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

|5.3.8 PLL characteristics|The parameters given in|Table 28 temperature and VDD supply voltage conditions summarized in|Table 28. PLL characteristics||are derived from tests performed under ambient|Table 10||.||||
|---|---|---|---|---|---|---|---|---|---|---|---|
|||||||Value||||||
|Symbol||Parameter (2) PLL input clock||Min||Typ 18.0||(1) Max|25 MHz||Unit|
|f PLL_IN||PLL input clock duty cycle||40||-||60|||%|
|f PLL_OUT||PLL multiplier output clock||16||-||72|||MHz|
|t LOCK||PLL lock time||-||-||200|||µs|
|Jitter||Cycle-to-cycle jitter||-||-||300|||ps|
|1. 2. 5.3.9 Memory characteristics Flash memory|the range defined by f|Guaranteed by characterization results.. PLL_OUT|Take care of using the appropriate multiplier factors so as to have PLL input clock values compatible with The characteristics are given at TA = –40 to 105 °C unless otherwise specified. Table 29. Flash memory characteristics|||||||||
|Symbol||Parameter|Conditions|||Min||Typ|Max|(1)|Unit|
|t prog||16-bit programming time|TA = –40 to +105 °C|||40||52.5|70||µs|
|t ERASE||Page (2 KB) erase time|TA = –40 to +105 °C|||20||-|40||ms|
|t ME||Mass erase time|TA = –40 to +105 °C Read mode f HCLK states, VDD = 3.3 V|= 72 MHz with 2 wait||20||-|40 --28mA||ms|
|IDD||Supply current|Write mode f HCLK Erase mode f HCLK Power-down mode / Halt, VDD = 3.0 to 3.6 V|= 72 MHz, VDD = 3.3 V = 72 MHz, VDD = 3.3 V|||||--7mA --5mA --50µA|||
|V prog||Programming voltage|-|||2||-|3.6||V|
|1.|Guaranteed by design.||DS5792 Rev 13|||||||||

64/143
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

|||Table 30. Flash memory endurance and data retention|||
|---|---|---|---|---|
||||Value||
|Symbol|Parameter|Conditions|(1) Min|Unit|
|NEND|Endurance|T = -40 to +85 °C (6 suffix versions) A TA = -40 to +105 °C (7 suffix versions) (2) 1 kcycle at TA = 85 °C|10 30|kcycles|
|t RET|Data retention|(2) at TA = 105 °C 1 kcycle (2) at TA = 55 °C 10 kcycles|10 20|Years|
|1. 2.|Guaranteed by characterization results. Cycling performed over the whole temperature range.|DS5792 Rev 13||65/143|
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

# 5.3.10 FSMC characteristics

## Asynchronous waveforms and timings

*Figure 24* through *Figure 27* represent asynchronous waveforms and *Table 31* through

*Table 34* provide the corresponding timings. The results shown in these tables are obtained

with the following FSMC configuration:

- AddressSetupTime = 0
- AddressHoldTime = 1
- DataSetupTime = 1
**Figure 24. Asynchronous non-multiplexed SRAM/PSRAM/NOR read waveforms**

WZ1(

)60&B1(
W Y12(B1( W Z12( W K1(B12(

)60&B12(
)60&B1:(
WY$B1( W K$B12(

)60&B$>@
$GGUHVV WY%/B1( W K%/B12(

)60&B1%/>@
W K’DWDB1( WVX’DWDB12( WK’DWDB12( WVX’DWDB1(

)60&B’>@'DWD
W Y1$’9B1( WZ1$’9

)60&B1$’9
069

1. Mode 2/B, C and D only. In Mode 1, FSMC_NADV is not used.
66/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Table 31. Asynchronous non-multiplexed SRAM/PSRAM/NOR read timings(1)**

**Parameter**

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_NE low time|5t – 1.5|5t + 2|ns|
|t|FSMC_NEx low to FSMC_NOE low|0.5|1.5|ns|
|t|FSMC_NOE low time|5t – 1.5|5t + 1.5|ns|
|t|FSMC_NOE high to FSMC_NE high hold time|–1.5|-|ns|
|t|FSMC_NEx low to FSMC_A valid|-|0|ns|
|t|Address hold time after FSMC_NOE high|0.1|-|ns|
|t|FSMC_NEx low to FSMC_BL valid|-|0|ns|
|t|FSMC_BL hold time after FSMC_NOE high|0|-|ns|
|t|Data to FSMC_NEx high setup time|2t + 25|-|ns|
|t|Data to FSMC_NOEx high setup time|2t + 25|-|ns|
|t|Data hold time after FSMC_NOE high|0|-|ns|
|t|Data hold time after FSMC_NEx high|0|-|ns|
|t|FSMC_NEx low to FSMC_NADV low|-|5|ns|
|t|FSMC_NADV low time|-|t + 1.5|ns|

w(NE) HCLK HCLK v(NOE_NE) w(NOE) HCLK HCLK h(NE_NOE) v(A_NE) h(A_NOE) v(BL_NE) h(BL_NOE) su(Data_NE) HCLK su(Data_NOE) HCLK h(Data_NOE) h(Data_NE) v(NADV_NE) w(NADV) HCLK

1. CL = 15 pF.
**Figure 25. Asynchronous non-multiplexed SRAM/PSRAM/NOR write waveforms**

WZ1(

)60&B1([
)60&B12(
WY1:(B1( WZ1:( W K1(B1:(

)60&B1:(
WY$B1( WK$B1:(

)60&B$>@ $GGUHVV
WY%/B1( WK%/B1:(

)60&B1%/>@ 1%/
WY’DWDB1( WK’DWDB1:(

)60&B’>@'DWD
W Y1$’9B1( WZ1$’9

)60&B1$’9
DL

1. Mode 2/B, C and D only. In Mode 1, FSMC_NADV is not used.
DS5792 Rev 13 67/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 32. Asynchronous non-multiplexed SRAM/PSRAM/NOR write timings(1)(2)**

**Parameter**

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_NE low time|3t – 1|3t + 2|ns|
|t|FSMC_NEx low to FSMC_NWE low|t – 0.5|t + 1.5|ns|
|t|FSMC_NWE low time|t – 0.5|t + 1.5|ns|
|t|FSMC_NWE high to FSMC_NE high hold time|t|-ns||
|t|FSMC_NEx low to FSMC_A valid|-|7.5|ns|
|t|Address hold time after FSMC_NWE high|t|-ns||
|t|FSMC_NEx low to FSMC_BL valid|-|0|ns|
|t|FSMC_BL hold time after FSMC_NWE high|t – 0.5|-|ns|
|t|FSMC_NEx low to Data valid|-|t + 7|ns|
|t|Data hold time after FSMC_NWE high|t|-ns||
|t|FSMC_NEx low to FSMC_NADV low|-|5.5|ns|
|t|FSMC_NADV low time|-|t + 1.5|ns|

w(NE) HCLK HCLK v(NWE_NE) HCLK HCLK w(NWE) HCLK HCLK h(NE_NWE) HCLK v(A_NE) h(A_NWE) HCLK v(BL_NE) h(BL_NWE) HCLK v(Data_NE) HCLK h(Data_NWE) HCLK v(NADV_NE) w(NADV) HCLK

1. CL = 15 pF.
2. Guaranteed by characterization results.
**Figure 26. Asynchronous multiplexed PSRAM/NOR read waveforms**

TW.% &3-#?.% TV./%?.% T H.%?./% &3-#?./% T W./% &3-#?.7% TV!?.% TH!?./% &3-#?!;= !DDRESS TV",?.% TH",?./% &3-#?.",;=.", TH$ATA?.% TSU$ATA?.% T V!?.% TSU$ATA?./% TH$ATA?./% &3-#?!$;=!DDRESS $ATA T V.!$6?.% TH!$?.!$6 TW.!$6 &3-#?.!$6 AIB

68/143 DS5792 Rev 13
# STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Table 33. Asynchronous multiplexed PSRAM/NOR read timings(1)(2)**

## Parameter

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_NE low time|7t – 2|7t + 2|ns|
|t|FSMC_NEx low to FSMC_NOE low|3t – 0.5|3t + 1.5|ns|
|t|FSMC_NOE low time|4t – 1|4t + 2|ns|
|t|FSMC_NOE high to FSMC_NE high hold time|–1|-|ns|
|t|FSMC_NEx low to FSMC_A valid|-|0|ns|
|t|FSMC_NEx low to FSMC_NADV low|3|5|ns|
|t|FSMC_NADV low time|t –1.5|t + 1.5|ns|
|t|FSMC_AD (address) valid hold time after FSMC_NADV high|t|- ns||
|t|Address hold time after FSMC_NOE high|t-2|-|ns|
|t|FSMC_BL hold time after FSMC_NOE high|0|-|ns|
|t|FSMC_NEx low to FSMC_BL valid|-|0|ns|
|t|Data to FSMC_NEx high setup time|2t + 24|-|ns|
|t|Data to FSMC_NOE high setup time|2t + 25|-|ns|
|t|Data hold time after FSMC_NEx high|0|-|ns|
|t|Data hold time after FSMC_NOE high|0|-|ns|

w(NE) HCLK HCLK v(NOE_NE) HCLK HCLK w(NOE) HCLK HCLK h(NE_NOE) v(A_NE) v(NADV_NE) w(NADV) HCLK HCLK

h(AD_NADV) HCLK

h(A_NOE) HCLK h(BL_NOE) v(BL_NE) su(Data_NE) HCLK su(Data_NOE) HCLK h(Data_NE) h(Data_NOE)

1. CL = 15 pF.
2. Guaranteed by characterization results.
## DS5792 Rev 13 69/143
||Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE Figure 27. Asynchronous multiplexed PSRAM/NOR write waveforms|||
|---|---|---|---|
||WZ1()60&B1([)60&B12(WY1:(B1(WZ1:(W K1(B1:()60&B1:(WK$B1:(WY$B1()60&B$>@ $GGUHVV WY%/B1(WK%/B1:()60&B1%/>@ 1%/ W Y’DWDB1$’9 WK’DWDB1:(W Y$B1($GGUHVV 'DWD)60&B$’>@ W Y1$’9B1(WK$’B1$’9 WZ1$’9)60&B1$’9 Table 34. Asynchronous multiplexed PSRAM/NOR write timings(1)(2) Symbol Parameter Min Max t FSMC_NE low time 5t – 1 5t + 2 w(NE) HCLK HCLK FSMC_NEx low to FSMC_NWE low 2t 2t + 1 t v(NWE_NE) HCLK HCLK t FSMC_NWE low time 2t – 1 2t + 2 w(NWE) HCLK HCLK FSMC_NWE high to FSMC_NE high hold time t – 1 - t h(NE_NWE) HCLK FSMC_NEx low to FSMC_A valid - 7 t v(A_NE) t FSMC_NEx low to FSMC_NADV low 3 5 v(NADV_NE) FSMC_NADV low time t – 1 t + 1 t w(NADV) HCLK HCLK FSMC_AD (address) valid hold time after – 3 - t t h(AD_NADV) HCLK FSMC_NADV high t Address hold time after FSMC_NWE high 4t h(A_NWE) HCLK FSMC_NEx low to FSMC_BL valid - 1.6 t v(BL_NE) t FSMC_BL hold time after FSMC_NWE high t – 1.5 - h(BL_NWE) HCLK FSMC_NADV high to Data valid-t + 1.5 t v(Data_NADV) HCLK Data hold time after FSMC_NWE high t – 5 - t h(Data_NWE) HCLK 1. CL = 15 pF. 2. BGuaranteed by characterization results.|DL% Unit ns ns ns ns ns ns ns ns -ns ns ns ns ns||
|70/143|DS5792 Rev 13|||
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# Synchronous waveforms and timings

*Figure 28* through *Figure 31* represent synchronous waveforms and *Table 36* through

*Table 38* provide the corresponding timings. The results shown in these tables are obtained

with the following FSMC configuration:

- BurstAccessMode = FSMC_BurstAccessMode_Enable;
- MemoryType = FSMC_MemoryType_CRAM;
- WriteBurst = FSMC_WriteBurst_Enable;
- CLKDivision = 1; (0 is not supported, see the STM32F10xxx reference manual)
- DataLatency = 1 for NOR Flash; DataLatency = 0 for PSRAM
**Figure 28. Synchronous multiplexed NOR/PSRAM read timings**

TW#,+ TW#,+ "53452. &3-#?#,+

$ATALATENCY TD#,+,.%X, TD#,+,.%X( &3-#?.%X TD#,+,.!$6, TD#,+,.!$6( &3-#?.!$6 TD#,+,!6 TD#,+,!)6 &3-#?!;= TD#,+(./%, TD#,+,./%( &3-#?./% TD#,+,!$)6 TH#,+(!$6 TD#,+,!$6 TSU!$6#,+( TSU!$6#,+( TH#,+(!$6

|&3-#?!$;=|!$;=|||$||$|$|
|---|---|---|---|---|---|---|---|
|&3-#?.7!)4||TSU.7!)46#,+(|||TH#,+(.7!)46|||
|7!)4#&’B7!)40/,B &3-#?.7!)4|||TSU.7!)46#,+(|||T H#,+(.7!)46||
|7!)4#&’B7!)40/,B||T SU.7!)46#,+(|||T H#,+(.7!)46|||

AII

DS5792 Rev 13 71/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 35. Synchronous multiplexed NOR/PSRAM read timings(1)(2)**

## Parameter

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_CLK period|27.7|-|ns|
|t|FSMC_CLK low to FSMC_NEx low (x = 0...2)|-|1.5|ns|
|t|FSMC_CLK low to FSMC_NEx high (x = 0...2)|2|-|ns|
|t|FSMC_CLK low to FSMC_NADV low|-|4|ns|
|t|FSMC_CLK low to FSMC_NADV high|5|-|ns|
|t|FSMC_CLK low to FSMC_Ax valid (x = 16...25)|-|0|ns|
|t|FSMC_CLK low to FSMC_Ax invalid (x = 16...25)|2|-|ns|
|t|FSMC_CLK low to FSMC_NOE low|-|1|ns|
|t|FSMC_CLK low to FSMC_NOE high|1.5|-|ns|
|t|FSMC_CLK low to FSMC_AD[15:0] valid|-|12|ns|
|t t|FSMC_CLK low to FSMC_AD[15:0] invalid FSMC_A/D[15:0] valid data before FSMC_CLK|0 6- ns|-|ns|
||high||||
|t|FSMC_A/D[15:0] valid data after FSMC_CLK high|0|-|ns|
|t|FSMC_NWAIT valid before FSMC_CLK high|8|-|ns|
|t|FSMC_NWAIT valid after FSMC_CLK high|2|-|ns|

w(CLK) d(CLKL-NExL) d(CLKL-NExH) d(CLKL-NADVL) d(CLKL-NADVH) d(CLKL-AV) d(CLKL-AIV) d(CLKL-NOEL) d(CLKL-NOEH) d(CLKL-ADV) d(CLKL-ADIV)

su(ADV-CLKH)

h(CLKH-ADV) su(NWAITV-CLKH) h(CLKH-NWAITV)

1. CL = 15 pF.
2. Guaranteed by characterization results.
## 72/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 29. Synchronous multiplexed PSRAM write timings**

TW#,+ TW#,+ "53452. &3-#?#,+

$ATALATENCY TD#,+,.%X, TD#,+,.%X( &3-#?.%X TD#,+,.!$6, TD#,+,.!$6( &3-#?.!$6 TD#,+,!6 TD#,+,!)6 &3-#?!;= TD#,+,.7%, TD#,+,.7%( &3-#?.7% TD#,+,!$)6 TD#,+,$ATA TD#,+,!$6 TD#,+,$ATA &3-#?!$;=!$;= $ $

&3-#?.7!)4 7!)4#&’B7!)40/,B TSU.7!)46#,+( TH#,+(.7!)46 TD#,+,.",( &3-#?.",

AIG

DS5792 Rev 13 73/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 36. Synchronous multiplexed PSRAM write timings(1)(2)**

## Parameter

|Symbol||Min|Max Unit|
|---|---|---|---|
|t|FSMC_CLK period|27.7|-ns|
|t|FSMC_CLK low to FSMC_Nex low (x = 0...2)|-|2 ns|
|t|FSMC_CLK low to FSMC_NEx high (x = 0...2)|2|-ns|
|t|FSMC_CLK low to FSMC_NADV low|-|4 ns|
|t|FSMC_CLK low to FSMC_NADV high|5|-ns|
|t|FSMC_CLK low to FSMC_Ax valid (x = 16...25)|-|0 ns|
|t|FSMC_CLK low to FSMC_Ax invalid (x = 16...25)|2|-ns|
|t|FSMC_CLK low to FSMC_NWE low|-|1 ns|
|t|FSMC_CLK low to FSMC_NWE high|1|-ns|
|t|FSMC_CLK low to FSMC_AD[15:0] valid|-|12 ns|
|t|FSMC_CLK low to FSMC_AD[15:0] invalid|3|-ns|
|t|FSMC_A/D[15:0] valid after FSMC_CLK low|-|6 ns|
|t|FSMC_CLK low to FSMC_NBL high|1|-ns|
|t|FSMC_NWAIT valid before FSMC_CLK high|7|-ns|
|t|FSMC_NWAIT valid after FSMC_CLK high|2|-ns|

w(CLK) d(CLKL-NExL) d(CLKL-NExH) d(CLKL-NADVL) d(CLKL-NADVH) d(CLKL-AV) d(CLKL-AIV) d(CLKL-NWEL) d(CLKL-NWEH) d(CLKL-ADV) d(CLKL-ADIV) d(CLKL-Data) d(CLKL-NBLH) su(NWAITV-CLKH) h(CLKH-NWAITV)

1. CL = 15 pF.
2. Guaranteed by characterization results.
## 74/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 30. Synchronous non-multiplexed NOR/PSRAM read timings**

TW#,+ TW#,+ "53452. &3-#?#,+ TD#,+,.%X, TD#,+,.%X( $ATALATENCY &3-#?.%X TD#,+,.!$6, TD#,+,.!$6( &3-#?.!$6 TD#,+,!6 TD#,+,!)6 &3-#?!;= TD#,+(./%, TD#,+,./%( &3-#?./% TSU$6#,+( TH#,+($6 TSU$6#,+( TH#,+($6 &3-#?$;= $ $ $ TSU.7!)46#,+( TH#,+(.7!)46 &3-#?.7!)4 7!)4#&’B7!)40/,B TSU.7!)46#,+( T <u>H#,+(.7!)46</u> &3-#?.7!)4 7!)4#&’B7!)40/,B TSU.7!)46#,+( TH#,+(.7!)46 AIH

**Table 37. Synchronous non-multiplexed NOR/PSRAM read timings(1)(2)**

**Parameter**

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_CLK period|27.7|-|ns|
|t|FSMC_CLK low to FSMC_NEx low (x = 0...2)|-|1.5|ns|
|t|FSMC_CLK low to FSMC_NEx high (x = 0...2)|2|-|ns|
|t|FSMC_CLK low to FSMC_NADV low|-|4|ns|
|t|FSMC_CLK low to FSMC_NADV high|5|-|ns|
|t|FSMC_CLK low to FSMC_Ax valid (x = 0...25)|-|0|ns|
|t|FSMC_CLK low to FSMC_Ax invalid (x = 0...25)|4|-|ns|
|t|FSMC_CLK low to FSMC_NOE low|-|1.5|ns|
|t|FSMC_CLK low to FSMC_NOE high|1.5|-|ns|
|t|high FSMC_D[15:0] valid data before FSMC_CLK|6.5|-|ns|
|t|FSMC_D[15:0] valid data after FSMC_CLK high|7|-|ns|
|t|FSMC_NWAIT valid before FSMC_SMCLK high|7|-|ns|
|t|FSMC_NWAIT valid after FSMC_CLK high|2|-|ns|

w(CLK) d(CLKL-NExL) d(CLKL-NExH) d(CLKL-NADVL) d(CLKL-NADVH) d(CLKL-AV) d(CLKL-AIV) d(CLKL-NOEL) d(CLKL-NOEH)

su(DV-CLKH)

h(CLKH-DV) su(NWAITV-CLKH) h(CLKH-NWAITV)

1. CL = 15 pF.
2. Guaranteed by characterization results.
DS5792 Rev 13 75/143
||Electrical characteristics|STM32F103xC, STM32F103xD, STM32F103xE Figure 31. Synchronous non-multiplexed PSRAM write timings|||
|---|---|---|---|---|
||t t t t t t t t t t t t t 1. 2.|%867851 WZ&/. WZ&/.)60&B&/. ’DWDODWHQF\ WG&/./1([/ WG&/./1([+)60&B1([WG&/./1$’9/ WG&/./1$’9+)60&B1$’9 WG&/./$,9 WG&/./$9)60&B$>@ WG&/./12(+ WG&/.+12(/)60&B12(WG&/./$’,9 WK&/.+$’9 WVX$’9&/.+ WVX$’9&/.+ WG&/./$’9 WK&/.+$’9)60&B$’>@ $’>@ ’ ’ WVX1:$,79&/.+ WK&/.+1:$,79)60&B1:$,7 :$,7&)* E:$,732/E WVX1:$,79&/.+ W K&/.+1:$,79)60&B1:$,7 :$,7&)* E:$,732/E W W VX1:$,79&/.+ K&/.+1:$,79 Table 38. Synchronous non-multiplexed PSRAM write timings(1)(2) Symbol Parameter Min Max FSMC_CLK period 27.7 - w(CLK) FSMC_CLK low to FSMC_NEx low (x = 0...2) - 2 d(CLKL-NExL) FSMC_CLK low to FSMC_NEx high (x = 0...2) 2 - d(CLKL-NExH) FSMC_CLK low to FSMC_NADV low - 4 d(CLKL-NADVL) FSMC_CLK low to FSMC_NADV high 5 - d(CLKL-NADVH) FSMC_CLK low to FSMC_Ax valid (x = 16...25) - 0 d(CLKL-AV) FSMC_CLK low to FSMC_Ax invalid (x = 16...25) 2 - d(CLKL-AIV) FSMC_CLK low to FSMC_NWE low - 1 d(CLKL-NWEL) FSMC_CLK low to FSMC_NWE high 1 - d(CLKL-NWEH) FSMC_D[15:0] valid data after FSMC_CLK low - 6 d(CLKL-Data) FSMC_CLK low to FSMC_NBL high 1 - d(CLKL-NBLH) FSMC_NWAIT valid before FSMC_CLK high 7 - su(NWAITV-CLKH) FSMC_NWAIT valid after FSMC_CLK high 2 - h(CLKH-NWAITV) CL = 15 pF. Guaranteed by characterization results.|DLK Unit ns ns ns ns ns ns ns ns ns ns ns ns ns||
|76/143||DS5792 Rev 13|||
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# PC Card/CompactFlash controller waveforms and timings

*Figure 32* through *Figure 37* represent synchronous waveforms and *Table 39* provides the

corresponding timings. The results shown in this table are obtained with the following FSMC configuration:

- COM.FSMC_SetupTime = 0x04;
- COM.FSMC_WaitSetupTime = 0x07;
- COM.FSMC_HoldSetupTime = 0x04;
- COM.FSMC_HiZSetupTime = 0x00;
- ATT.FSMC_SetupTime = 0x04;
- ATT.FSMC_WaitSetupTime = 0x07;
- ATT.FSMC_HoldSetupTime = 0x04;
- ATT.FSMC_HiZSetupTime = 0x00;
- IO.FSMC_SetupTime = 0x04;
- IO.FSMC_WaitSetupTime = 0x07;
- IO.FSMC_HoldSetupTime = 0x04;
- IO.FSMC_HiZSetupTime = 0x00;
- TCLRSetupTime = 0;
- TARSetupTime = 0;
**Figure 32. PC Card/CompactFlash controller waveforms for common memory read access**

)60&B1&(B
)60&B1&(B
WY1&([$ WK1&([$,

)60&B$>@
WWK1&([15(* WG15(*1&([ WG1,25’1&([ WK1&([1,25’ K1&([1,2:5

)60&B15(*
)60&B1,2:5
)60&B1,25’
)60&B1:( W<u>G1&(B12(</u> WZ12(
)60&B12(
WVX’12( WK12(’

)60&B’>@
DLE

1. FSMC_NCE4_2 remains high (inactive during 8-bit access.
DS5792 Rev 13 77/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 33. PC Card/CompactFlash controller waveforms for common memory write access**

)60&B1&(B

|)60&B1&(B|+LJK|||
|---|---|---|---|
|)60&B$>@ )60&B15(* )60&B1,2:5 )60&B1,25’||WY1&(B$ WG15(*1&(B WG1,25’1&(B|WK1&(B$, WWK1&(B15(* WK1&(B1,25’ K1&(B1,2:5|
|)60&B1:(|WG1&(B1:(||WG1:(1&(B|

WZ1:(

)60&B12(
<u>0(0[+,=</u> WG’1:( WY1:(’ WK1:(’

)60&B’>@
DLE

78/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 34. PC Card/CompactFlash controller waveforms for attribute memory read access**

)60&B1&(B
WY1&(B$ WK1&(B$,

)60&B1&(B
+LJK

)60&B$>@
)60&B1,2:5
)60&B1,25’
WG15(*1&(B WK1&(B15(*

)60&B15(*
)60&B1:( WG1&(B12( WZ12( WG12(1&(B
)60&B12(
WVX’12( WK12(’

)60&B’>@
DLE

1. Only data bits 0...7 are read (bits 8...15 are disregarded).
DS5792 Rev 13 79/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 35. PC Card/CompactFlash controller waveforms for attribute memory write access**

)60&B1&(B
)60&B1&(B +LJK
WY1&(B$ WK1&(B$,

)60&B$>@
)60&B1,2:5
)60&B1,25’
WG15(*1&(B WK1&(B15(*

)60&B15(* WG1&(B1:( WZ1:(
)60&B1:(
WG1:(1&(B

)60&B12(
WY1:(’

)60&B’>@
DLE

1. Only data bits 0...7 are driven (bits 8...15 remains HiZ).
**Figure 36. PC Card/CompactFlash controller waveforms for I/O space read access**

)60&B1&(B
)60&B1&(B
WY1&([$ WK1&(B$,

)60&B$>@
)60&B15(*
)60&B1:(
)60&B12(
)60&B1,2:5 WG1,25’1&(B WZ1,25’
)60&B1,25’
WVX’1,25’ WG1,25’’

)60&B’>@
DL%

80/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 37. PC Card/CompactFlash controller waveforms for I/O space write access**

)60&B1&(B
)60&B1&(B
WY1&([$ WK1&(B$,

)60&B$>@
)60&B15(*
)60&B1:(
)60&B12(
)60&B1,25’ WG1&(B1,2:5 WZ1,2:5
)60&B1,2:5
<u>$77[+,=</u> WK1,2:5’ WY1,2:5’

)60&B’>@
DLF

**Table 39. Switching characteristics for PC Card/CF read and write cycles(1)(2)**

**Parameter**

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_NCEx low (x = 4_1/4_2) to FSMC_Ay valid (y =||||
|t t|0...10) FSMC_NCE4_1 low (x = 4_1/4_2) to FSMC_Ay valid (y = 0...10) FSMC_NCEx high (x = 4_1/4_2) to FSMC_Ax invalid (x =|-0 ns|||
|t t t|0...10) FSMC_NCE4_1 high (x = 4_1/4_2) to FSMC_Ax invalid (x = 0...10) FSMC_NCEx low to FSMC_NREG valid FSMC_NCE4_1 low to FSMC_NREG valid|2.5 -5 ns|-|ns|
|t t|FSMC_NCEx high to FSMC_NREG invalid FSMC_NCE4_1 high to FSMC_NREG invalid|t + 3|-|ns|
|t|FSMC_NCE4_1 low to FSMC_NOE low|-|5t + 2|ns|
|t|FSMC_NOE low width|8t –1.5|8t + 1|ns|
|t|FSMC_NOE high to FSMC_NCE4_1 high|5t + 2|-|ns|
|t|FSMC_D[15:0] valid data before FSMC_NOE high|25|-|ns|
|t|FSMC_D[15:0] valid data after FSMC_NOE high|15|-|ns|
|t|FSMC_NWE low width|8t – 1|8t + 2|ns|
|t|FSMC_NWE high to FSMC_NCE4_1 high|5t + 2|-|ns|
|t|FSMC_NCE4_1 low to FSMC_NWE low|-|5t + 1.5|ns|
|t|FSMC_NWE low to FSMC_D[15:0] valid|-|0|ns|
|t|FSMC_NWE high to FSMC_D[15:0] invalid|11t|- ns||
|t|FSMC_D[15:0] valid before FSMC_NWE high|13t|- ns|81/143|

v(NCEx-A) v(NCE4_1-A)

h(NCEx-AI) h(NCE4_1-AI)

d(NREG-NCEx) d(NREG-NCE4_1) h(NCEx-NREG) HCLK h(NCE4_1-NREG) d(NCE4_1-NOE) HCLK w(NOE) HCLK HCLK d(NOE-NCE4_1 HCLK su(D-NOE) h(NOE-D) w(NWE) HCLK HCLK d(NWE-NCE4_1) HCLK d(NCE4_1-NWE) HCLK v(NWE-D) h(NWE-D) HCLK d(D-NWE) HCLK

DS5792 Rev 13
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 39. Switching characteristics for PC Card/CF read and write cycles(1)(2) (continued)**

## Parameter

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_NIOWR low width|8t + 3|-|ns|
|t|FSMC_NIOWR low to FSMC_D[15:0] valid|-|5t +1|ns|
|t|FSMC_NIOWR high to FSMC_D[15:0] invalid|11t|- ns||
|t|FSMC_NCE4_1 low to FSMC_NIOWR valid|-|5t +3ns|ns|
|t t|FSMC_NCEx high to FSMC_NIOWR invalid FSMC_NCE4_1 high to FSMC_NIOWR invalid|5t – 5|-|ns|
|t t|FSMC_NCEx low to FSMC_NIORD valid FSMC_NCE4_1 low to FSMC_NIORD valid|-5t|+ 2.5|ns|
|t t|FSMC_NCEx high to FSMC_NIORD invalid FSMC_NCE4_1 high to FSMC_NIORD invalid|5t – 5|-|ns|
|t|FSMC_D[15:0] valid before FSMC_NIORD high|4.5|-|ns|
|t|FSMC_D[15:0] valid after FSMC_NIORD high|9|-|ns|
|t|FSMC_NIORD low width|8t + 2|-|ns|

w(NIOWR) HCLK v(NIOWR-D) HCLK h(NIOWR-D) HCLK d(NCE4_1-NIOWR) HCLK h(NCEx-NIOWR) HCLK h(NCE4_1-NIOWR) d(NIORD-NCEx) HCLK d(NIORD-NCE4_1) h(NCEx-NIORD) HCLK h(NCE4_1-NIORD) su(D-NIORD) d(NIORD-D) w(NIORD) HCLK

1. CL = 15 pF.
2. Guaranteed by characterization results.
## 82/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# NAND controller waveforms and timings

*Figure 38* through *Figure 41* represent synchronous waveforms and *Table 39* provides the

corresponding timings. The results shown in this table are obtained with the following FSMC configuration:

- COM.FSMC_SetupTime = 0x01;
- COM.FSMC_WaitSetupTime = 0x03;
- COM.FSMC_HoldSetupTime = 0x02;
- COM.FSMC_HiZSetupTime = 0x01;
- ATT.FSMC_SetupTime = 0x01;
- ATT.FSMC_WaitSetupTime = 0x03;
- ATT.FSMC_HoldSetupTime = 0x02;
- ATT.FSMC_HiZSetupTime = 0x01;
- Bank = FSMC_Bank_NAND;
- MemoryDataWidth = FSMC_MemoryDataWidth_16b;
- ECC = FSMC_ECC_Enable;
- ECCPageSize = FSMC_ECCPageSize_512Bytes;
- TCLRSetupTime = 0;
- TARSetupTime = 0;
**Figure 38. NAND controller waveforms for read access**

)60&B1&([ /RZ
$/()60&B$ &/()60&B$

)60&B1:(
WG$/(12( WK12($/(

)60&B12(15(
WVX’12( WK12(’

)60&B’>@
DLE

DS5792 Rev 13 83/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 39. NAND controller waveforms for write access**

)60&B1&([
$/()60&B$ &/()60&B$ WG$/(1:( WK1:($/(

)60&B1:(
)60&B12(15(
WY1:(’ WK1:(’

)60&B’>@
AIC

**Figure 40. NAND controller waveforms for common memory read access**

)60&B1&([ /RZ
$/()60&B$ &/()60&B$ WG$/(12( WK12($/(

)60&B1:(
WZ12(

)60&B12(
WVX’12( WK12(’

)60&B’>@
DLE

84/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 41. NAND controller waveforms for common memory write access**

)60&B1&([ /RZ
$/()60&B$ &/()60&B$ WG$/(1:( WZ1:( WK1:($/(

)60&B1:(
)60&B12(
WG’1:( WY1:(’ WK1:(’

)60&B’>@
DLE

**Table 40. Switching characteristics for NAND Flash read and write cycles(1)**

**Parameter**

|Symbol||Min|Max|Unit|
|---|---|---|---|---|
|t|FSMC_D[15:0] valid before FSMC_NWE high|5t + 12|-|ns|
|t|FSMC_NWE low width|4t|4t|ns|
|t||||ns|
||high||||
|t|FSMC_D[15:0] valid data after FSMC_NOE high|7|-|-|
|t|FSMC_NWE low width|4t|4t|ns|
|t|FSMC_NWE low to FSMC_D[15:0] valid|-|0|ns|
|t|FSMC_NWE high to FSMC_D[15:0] invalid|2t + 4|-|ns|
|t|FSMC_ALE valid before FSMC_NWE low|-|3t + 1.5|ns|
|t|FSMC_NWE high to FSMC_ALE invalid|3t + 4.5|-|ns|
|t|FSMC_ALE valid before FSMC_NOE low|-|3t + 2|ns|
|t|FSMC_NWE high to FSMC_ALE invalid|3t + 4.5|-|ns|

d(D-NWE)(2) HCLK w(NOE)(2) HCLK-1.5 HCLK+1.5 FSMC_D[15:0] valid data before su(D-NOE)(2)FSMC_NOE25-

h(NOE-D)(2) w(NWE)(2) HCLK-1 HCLK+1 v(NWE-D)(2) h(NWE-D)(2) HCLK d(ALE-NWE)(3) HCLK h(NWE-ALE)(3) HCLK d(ALE-NOE)(3) HCLK h(NOE-ALE)(3) HCLK

1. CL = 15 pF.
2. Guaranteed by characterization results.
3. Guaranteed by design.
DS5792 Rev 13 85/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

|5.3.11 EMC characteristics • • FTB|Susceptibility tests are performed on a sample basis during device characterization. Functional EMS (electromagnetic susceptibility) While a simple application is executed on the device (toggling 2 LEDs through I/O ports). the device is stressed by two electromagnetic events until a failure occurs. The failure is indicated by the LEDs: Electrostatic discharge (ESD) a functional disturbance occurs. This test is compliant with the IEC 61000-4-2 standard. : A Burst of Fast Transient voltage (positive and negative) is applied to VDD and VSS through a 100 pF capacitor, until a functional disturbance occurs. This test is compliant with the IEC 61000-4-4 standard. A device reset allows normal operations to be resumed. The test results are given in Table 41 defined in application note AN1709. Table 41. EMS characteristics|(positive and negative) is applied to all device pins until. They are based on the EMS levels and classes||
|---|---|---|---|
|Symbol|Parameter|Conditions|Level/ Class|
|VFESD|Voltage limits to be applied on any I/O pin to induce a functional disturbance|= 3.3 V, LQFP144, T = +25 °C, V DD A f = 72 MHz HCLK conforms to IEC 61000-4-2|2B|
|VEFTB • • • second.|Fast transient voltage burst limits to be applied through 100 pF on VDD and VSS pins to induce a functional disturbance Designing hardened software to avoid noise problems EMC characterization and optimization are performed at component level with a typical application environment and simplified MCU software. It should be noted that good EMC performance is highly dependent on the user application and the software in particular. Therefore it is recommended that the user applies EMC software optimization and prequalification tests in relation with the EMC level requested for his application. Software recommendations The software flowchart must include the management of runaway conditions such as: Corrupted program counter Unexpected reset Critical Data corruption (control registers...) Prequalification trials Most of the common failures (unexpected reset and program counter corruption) can be reproduced by manually forcing a low state on the NRST pin or the Oscillator pins for 1 DS5792 Rev 13|= 3.3 V, LQFP144, T = +25 V DD A °C, = 72 MHz f HCLK conforms to IEC 61000-4-4|4A|

86/143
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

||||Electromagnetic Interference (EMI)||to prevent unrecoverable errors occurring (see application note AN1015). executed (toggling 2 LEDs through the I/O ports). This emission test is compliant with IEC 61967-2 standard which specifies the test board and the pin loading.|To complete these trials, ESD stress can be applied directly on the device, over the range of specification values. When unexpected behavior is detected, the software can be hardened The electromagnetic field emitted by the device are monitored while a simple application is Table 42. EMI characteristics|||||||
|---|---|---|---|---|---|---|---|---|---|---|---|---|
|||Symbol|Parameter||Conditions|Monitored frequency band||Max vs. [f 8/48 MHz||/f] HSE HCLK 8/72 MHz||Unit|
|||SEMI|Peak level||VDD = 3.3 V, TA = 25 °C, LQFP144 package compliant with IEC|0.1 to 30 MHz 30 to 130 MHz 130 MHz to 1GHz||8 31 28||12 21 33||dBµV|
|||||61967-2||SAE EMI Level||4||4||-|
|5.3.12|||Electrostatic discharge (ESD)|conforms to the JESD22-A114/C101 standard.|Absolute maximum ratings (electrical sensitivity) stressed in order to determine its performance in terms of electrical sensitivity. Electrostatic discharges (a positive then a negative pulse separated by 1 second) are applied to the pins of each sample according to each pin combination. The sample size Table 43. ESD absolute maximum ratings|Based on three different tests (ESD, LU) using specific measurement methods, the device is depends on the number of supply pins in the device (3 parts × (n+1) supply pins). This test|||||||
|Symbol|||Ratings||Conditions|||Class||Maximum (1) value||Unit|
|VESD(HBM)||(human body model)|Electrostatic discharge voltage||T = +25 °C, conforming to A JESD22-A114|||||22000|||
|VESD(CDM)||(charge device model)|Electrostatic discharge voltage||T = +25 °C, conforming to A JESD22-C101|||III||500||V|
|1.|• •|Guaranteed by characterization results. Static latch-up performance:|||Two complementary static tests are required on six parts to assess the latch-up A supply overvoltage is applied to each power supply pin A current injection is applied to each input, output and configurable I/O pin These tests are compliant with EIA/JESD 78A IC latch-up standard. DS5792 Rev 13|||||||87/143|
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

||||Table 44. Electrical sensitivities|||||
|---|---|---|---|---|---|---|---|
|Symbol||Parameter||Conditions|||Class|
|LU||Static latch-up class 5.3.13 I/O current injection characteristics sample basis during device characterization. Functional susceptibilty to I/O current injection example reset, oscillator frequency deviation). The test results are given in Table 45|TA = +105 °C conforming to JESD78A As a general rule, current injection to the I/O pins, due to external voltage below VSS or above VDD (for standard, 3 V-capable I/O pins) should be avoided during normal product operation. However, in order to give an indication of the robustness of the microcontroller in cases when abnormal injection accidentally happens, susceptibility tests are performed on a While a simple application is executed on the device, the device is stressed by injecting current into the I/O pins programmed in floating input mode. While current is injected into the I/O pin, one at a time, the device is checked for functional failures. The failure is indicated by an out of range parameter: ADC error above a certain limit (>5 LSB TUE), out of spec current injection on adjacent pins or other functional failure (for Table 45. I/O current injection susceptibility|Functional susceptibility|||II level A|
|Symbol||Description Injected current on OSC_IN32, OSC_OUT32, PA4, PA5, PC13||Negative injection -0|Positive injection +0||Unit|
|IINJ||Injected current on all FT pins Injected current on any other pin|DS5792 Rev 13|-5 -5|+0 +5||mA|

88/143
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

||5.3.14 I/O port characteristics compliant.|General input/output characteristics Unless otherwise specified, the parameters given in performed under the conditions summarized in|Table 10 Table 46. I/O static characteristics|Table 46|are derived from tests. All I/Os are CMOS and TTL||
|---|---|---|---|---|---|---|
|Symbol|Parameter|Conditions|Min|Typ|Max|Unit|
||Standard IO input low level voltage||–0.3|-|-2 V)+0.8 V 0.28*(V DD|V|
|VIL|(1) IO FT input low level voltage|-|–0.3|-|-2 V)+0.75 V 0.32*(V DD|V|
||Standard IO input high level voltage|-|0.41*(VDD-2 V)+1.3 V||-V +0.3 DD|V|
|VIH|(1) IO FT input high level voltage|VDD > 2 V V ≤ 2 V DD|-2 V)+1 V 0.42*(V DD|-|5.5 5.2|V|
|V hys|Standard IO Schmitt trigger voltage (2) hysteresis|-|200|-|-|mV|
||IO FT Schmitt trigger (2) voltage hysteresis (4)|VSS ≤VIN ≤VDD Standard I/Os|(3) 5% V DD|--±1|--mV||
|I lkg|Input leakage current|VIN= 5 V, I/O FT|-- 3|||µA|
|RPU|Weak pull-up equivalent (5) resistor|VIN = VSS|30|40|50|kΩ|
|RPD|Weak pull-down (5) equivalent resistor|VIN = VDD|30|40|50|kΩ|
|CIO|I/O pin capacitance|-|-|5|-|pF|
|1. disabled. 2. 3. 4. 5.|With a minimum of 100 mV. MOS/NMOS contribution to the series resistance is minimum (~10% order) in Figure 44 and|Hysteresis voltage between Schmitt trigger switching levels. Guaranteed by characterization results. Leakage could be higher than max. if negative current is injected on adjacent pins. coverage of these requirements is shown in Figure 45|FT = Five-volt tolerant. In order to sustain a voltage higher than VDD+0.3 the internal pull-up/pull-down resistors must be Pull-up and pull-down resistors are designed with a true resistance in series with a switchable PMOS/NMOS. This. All I/Os are CMOS and TTL compliant (no software configuration required). Their characteristics cover more than the strict CMOS-technology or TTL parameters. The Figure 42 for 5 V tolerant I/Os. DS5792 Rev 13|and Figure 43|for standard I/Os, and|89/143|
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 42. Standard I/O input characteristics-CMOS port**

6)(6),6
)(6$$ 6)(6$$
#-/3STANDARDREQUIREMENT6)NPUTRANGE

7)(MIN NOTGUARANTEED

||#-/3STANDARDREQUIREMENT6|), 44,REQUIREMENTS 6)(6|6$$||6$$ 6), Figure 43. Standard I/O input characteristics-TTL port||||
|---|---|---|---|---|---|---|---|---|
||||6$$ 6)(|6),6$$|||||
||#-/3STANDARDREQUIREMENTS6||44,REQUIREMENTS 6),6)(6$$|6)(|Figure 44. 5 V tolerant I/O input characteristics-CMOS port $$ 6 6),6$$||||

7),MAX
6$$6 AIB

6)(6),6
7)(MIN
)NPUTRANGE NOTGUARANTEED

7),MAX
6$$6 AI

6)(6),6
)NPUTRANGE NOTGUARANTEED

),6$$
#-/3STANDARDREQUIRMENT6 6$$6 6$$ AIB

## 90/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

|||Figure 45. 5 V tolerant I/O input characteristics-TTL port|||||
|---|---|---|---|---|---|---|
|• •|IVDD (see IVSS (see Table 10|Output driving current The GPIOs (general purpose input/outputs) can sink or source up to ±8 mA, and sink or source up to ± 20 mA (with a relaxed VOL/VOH) except PC13, PC14 and PC15 which can sink or source up to ±3 mA. When using the GPIOs PC13 to PC15 in output mode, the speed should not exceed 2 MHz with a maximum load of 30 pF. In the user application, the number of I/O pins which can drive current must be limited to respect the absolute maximum rating specified in The sum of the currents sourced by all the I/Os on VDD, plus the maximum Run Table 8). The sum of the currents sunk by all the I/Os on VSS plus the maximum Run consumption of the MCU sunk on VSS cannot exceed the absolute maximum rating Table 8). Output voltage levels Unless otherwise specified, the parameters given in performed under ambient temperature and VDD supply voltage conditions summarized in. All I/Os are CMOS and TTL compliant. Table 47. Output voltage characteristics|Section 5.2 : consumption of the MCU sourced on VDD, cannot exceed the absolute maximum rating Table 47|are derived from tests|||
||Symbol|Parameter|Conditions|Min|Max|Unit|
||(1) VOL|Output low level voltage for an I/O pin when 8 pins are sunk at same time|(3) TTL port||-0.4||
||(2) V OH|Output high level voltage for an I/O pin when 8 pins are sourced at same time|IIO = +8 mA 2.7 V < VDD < 3.6 V|–0.4 V DD|-|V|
||(1) VOL|Output low level voltage for an I/O pin when 8 pins are sunk at same time|(3) CMOS port||-0.4||
||(2) V OH|Output high level voltage for an I/O pin when 8 pins are sourced at same time DS5792 Rev 13|IIO =+ 8mA 2.7 V < VDD < 3.6 V|2.4|-|V 91/143|

6)(6),6 7)(MIN 7),MAX 44,REQUIREMENT6)(6 6)(6$$ 6),6$$ 44,REQUIREMENTS6),6 )NPUTRANGE NOTGUARANTEED 6$$6 AI
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

||Table 47. Output voltage characteristics (continued)|||||
|---|---|---|---|---|---|
|Symbol|Parameter|Conditions|Min|Max|Unit|
|1. 2. Table 8 3. 4.|The IIO current sunk by the device must always respect the absolute maximum rating specified in and the sum of IIO (I/O ports and control pins) must not exceed IVSS. The IIO current sourced by the device must always respect the absolute maximum rating specified in and the sum of IIO (I/O ports and control pins) must not exceed IVDD. TTL and CMOS outputs are compatible with JEDEC standards JESD36 and JESD52. Guaranteed by characterization results. DS5792 Rev 13|||Table 8||

(1)(4) VOL Output low level voltage for an I/O pin when 8 pins are sunk at same time I = +20 mA IO -1.3
(2)(4) VOH Output high level voltage for an I/O pin when 8 pins are sourced at same time 2.7 V < VDD < 3.6 V VDD–1.3 - V
(1)(4) VOL Output low level voltage for an I/O pin when 8 pins are sunk at same time I = +6 mA IO -0.4
(2)(4) VOH Output high level voltage for an I/O pin when 8 pins are sourced at same time 2 V < VDD < 2.7 V VDD–0.4 - V

92/143
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

||Table 48 Table 10.|Input/output AC characteristics The definition and values of input/output AC characteristics are given in, respectively. Unless otherwise specified, the parameters given in|Table 48 performed under ambient temperature and VDD supply voltage conditions summarized in Table 48. I/O AC characteristics(1)|Figure 46 are derived from tests|and||
|---|---|---|---|---|---|---|
|MODEx[1:0] (1) bit value|Symbol f max(IO)out|Parameter (2) Maximum frequency|Conditions CL = 50 pF, VDD = 2 V to 3.6 V|Min -|Max 2|Unit MHz|
|10|t f(IO)out t r(IO)out f max(IO)out|Output high to low level fall time Output low to high level rise time (2) Maximum frequency|CL = 50 pF, VDD = 2 V to 3.6 V CL = 50 pF, VDD = 2 V to 3.6 V|-|(3) -125 (3) -125 10|ns MHz|
|01|t f(IO)out t r(IO)out|Output high to low level fall time Output low to high level rise time|CL = 50 pF, VDD = 2 V to 3.6 V CL = 30 pF, VDD = 2.7 V to 3.6 V|-|(3) -25 (3) -25 50|ns MHz|
||F max(IO)out|(2) Maximum frequency|CL = 50 pF, VDD = 2.7 V to 3.6 V CL = 50 pF, VDD = 2 V to 2.7 V CL = 30 pF, VDD = 2.7 V to 3.6 V|- - -|30 20 (3) 5|MHz MHz|
|11|t f(IO)out t r(IO)out -t EXTIpw|Output high to low level fall time Output low to high level rise time Pulse width of external signals detected by the EXTI controller|CL = 50 pF, VDD = 2.7 V to 3.6 V CL = 50 pF, VDD = 2 V to 2.7 V CL = 30 pF, VDD = 2.7 V to 3.6 V CL = 50 pF, VDD = 2.7 V to 3.6 V CL = 50 pF, VDD = 2 V to 2.7 V|- - - - -|(3) 8 (3) 12 (3) 5 (3) 8 (3) 12 -10-ns|ns|
|1. 2. 3. Guaranteed by design.|GPIO Port configuration register. The maximum frequency is defined in|Figure 46.|The I/O speed is configured using the MODEx[1:0] bits. Refer to the STM32F10xxx reference manual for a description of DS5792 Rev 13|||93/143|
Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE
Figure 46. I/O AC characteristics definition
90% 10%
50% N 50%
10% ! ' 90%
EXTERNAL t(10)out  1——» > tlO)out |
OUTPUT | '
ON CL 1»
Maximum frequency is achieved if (t, + tp) < (2/3)T and if the duty cycle is (45-55%)
when loaded by CL specified in the table “ //O AC characteristics”.
ai14131d
5.3.15 NRST pin characteristics
The NRST pin input driver uses CMOS technology. It is connected to a permanent pull-up
resistor, Rpy (see Table 46).
Unless otherwise specified, the parameters given in Table 49 are derived from tests
performed under ambient temperature and Vpp supply voltage conditions summarized in
Table 10.
Table 49. NRST pin characteristics
symoi | Paramotor | conaitone | mn | avo | max un]
ViLines)") | NRST Input low level voltage | 05 | - | 08 v
NRST Schmitt trigger voltage
Vnhys(NRST) hysteresis 200 mV
1. Guaranteed by design.
2. The pull-up is designed with a true resistance in series with a switchable PMOS. This PMOS contribution
to the series resistance must be minimum (10% order).
94/143 DS5792 Rev 13 £y/
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 47. Recommended NRST pin protection**

9’’ ([WHUQDO UHVHWFLUFXLW 538

||1567|538|,QWHUQDO5HVHW|
|---|---|---|---|
||������||)LOWHU|

,QWHUQDO5HVHW 1567

670)
DLF

1. The reset network protects the device against parasitic resets.
2. The user must ensure that the level on the NRST pin can go below the VIL(NRST) max level specified in
*Table 49*. Otherwise the reset will not be taken into account by the device.

# 5.3.16 TIM timer characteristics

The parameters given in *Table 50* are guaranteed by design.

Refer to *Section 5.3.14: I/O port characteristics* for details on the input/output alternate function characteristics (output compare, input capture, external clock, PWM output).

**Table 50. TIMx(1) characteristics**

## Symbol Parameter Conditions Min Max Unit

<u>-1-tTIMxCLK</u> t res(TIM)Timer resolution time f TIMxCLK = 72 MHz 13.9-ns

Timer external clock -0fTIMxCLK /2 MHz f EXT frequency on CH1 to CH4 f = 72 MHz 0 36 MHz TIMxCLK

## ResTIMTimer resolution--16 bit

16-bit counter clock-1 65536 tTIMxCLK t COUNTERperiod when internal clock is selected fTIMxCLK = 72 MHz 0.0139 910 µs

--65536 × 65536 tTIMxCLK t MAX_COUNTMaximum possible count f TIMxCLK = 72 MHz-59.6 s

1. TIMx is used as a general term to refer to the TIM1, TIM2, TIM3 and TIM4 timers.
## DS5792 Rev 13 95/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

# 5.3.17 Communications interfaces

## I C interface characteristics

The STM32F103xC, STM32F103xD and STM32F103xESTM32F103xF and STM32F103xG performance line I2C interface meets the requirements of the standard I2C communication protocol with the following restrictions: the I/O pins SDA and SCL are mapped to are not “true” open-drain. When configured as open-drain, the PMOS connected between the I/O pin and VDD is disabled, but is still present. The I2C characteristics are described in *Table 51*. Refer also to *Section 5.3.14: I/O port* *characteristics* for more details on the input/output alternate function characteristics (SDA and SCL).

**Table 51. I2C characteristics**

**Standard mode2** (1)**(2)** **2 (1)**(2)**Fast mode I C** **I C**

|Symbol||I C||||Unit|
|---|---|---|---|---|---|---|
|||Min|Max|Min|Max||
|t|SCL clock low time|4.7|-|1.3|-||
|||||||µs|
|t|SCL clock high time|4.0|-|0.6|-||
|t|SDA setup time|250|-|100|-||
|t|SDA data hold time|-|3450|-900|||
|t t|SDA and SCL rise time|-|1000|-|300|ns|
|t t|SDA and SCL fall time|-|300|-|300||
|t|Start condition hold time|4.0|-|0.6|-||
|t|Repeated Start condition setup time|4.7|-|0.6 -||µs|
|t|Stop condition setup time|4.0|-|0.6|-|μs|
|t|Stop to Start condition time (bus free)|4.7|-|1.3|-|μs|
|C|Capacitive load for each bus line Pulse width of the spikes|-|400|-|400|pF|
|t 1. Guaranteed by design.|that are suppressed by the analog filter for standard and fast mode|050||050μs|||
|2. f achieve the fast mode I C frequencies and it must be a multiple of 10 MHz in order to reach the I2C fast mode maximum clock speed of 400 kHz. 3. The device must internally provide a hold time of at least 300ns for the SDA signal in order to bridge the undefined region on the falling edge of SCL. 4. The minimum width of the spikes filtered by the analog filter is above t|must be at least 2 MHz to achieve standard mode I||C frequencies. It must be at least 4 MHz to|(max).|||

**Symbol Parameter Unit**

w(SCLL) w(SCLH) su(SDA)

(3) (3)
h(SDA) r(SDA) r(SCL) f(SDA) f(SCL) h(STA)

su(STA)

su(STO)

w(STO:STA)

b

(4) (4)
SP

2 PCLK1 2

SP

96/143 DS5792 Rev 13
# STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 48. I2C bus AC waveforms and measurement circuit**

9’’B,& 9’’B,&

3 3670

|5|5|5||
|---|---|---|---|
||||6’$|
|||5||
||||6&/|

6 �������6

67$575(3($7(’ 67$57 WVX67$ 67$57 6’$ WI6’$ WU6’$ WVX6’$ WZ67267$ 6723

||WK67$|WZ6&//|WK6’$||||
|---|---|---|---|---|---|---|
|6&/|||||||
|WZ6&/+||WU6&/|WI6&/||||
|||||||DLG|
|1. Measurement points are done at CMOS levels: 0.3VDD and 0.7VDD.|||||||
|2. Rs: Series protection resistors.|||||||
|3. Rp: Pull-up resistors.|||||||
|4. VDD_I2C : I2C bus supply|||||||

WK67$ WZ6&// WK6’$

WVX672

**Table 52. SCL frequency (fPCLK1= 36 MHz.,VDD_I2C = 3.3 V)(1)(2)**

## I2C_CCR value fSCL(kHz)

**RP = 4.7 k**Ω

||400||0x801E|
|---|---|---|---|
||300 200 100 50 20||0x8028 0x803C 0x00B4 0x0168 0x0384|
|1. RP = External pull-up resistance, f||= I C speed.||

2 SCL

2. For speeds around 200 kHz, the tolerance on the achieved speed is of ±5%. For other speed ranges, the tolerance on the achieved speed ±2%. These variations depend on the accuracy of the external components used to design the application.
## DS5792 Rev 13 97/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

# I S-SPI characteristics

Unless otherwise specified, the parameters given in *Table 53* for SPI or in *Table 54* for I2S are derived from tests performed under ambient temperature, fPCLKx frequency and VDD supply voltage conditions summarized in *Table 10*. Refer to *Section 5.3.14: I/O port characteristics* for more details on the input/output alternate function characteristics (NSS, SCK, MOSI, MISO for SPI and WS, CK, SD for I2S).

**Table 53. SPI characteristics**

**Parameter Conditions**

|Symbol||||Min|Max|Unit|
|---|---|---|---|---|---|---|
|f||Master mode||-|18||
|1/t|SPI clock frequency|Slave mode||-|18||
|t|SPI clock rise and fall|Capacitive load: C = 30 pF||-|8|ns|
|t|time||||||
|DuCy(SCK)|SPI slave input clock duty cycle|Slave mode||30|70|%|
|t|NSS setup time|Slave mode||4t|-||
|t|NSS hold time|Slave mode||2t|-||
|t t|SCK high and low time|Master mode, f presc = 4|= 36 MHz,|50|60||
|t||Master mode||5|-||
|t|Data input setup time|Slave mode||5|-||
|t||Master mode||5|-||
|t|Data input hold time|Slave mode||4|-|ns|
|t|Data output access time|Slave mode, f|= 20 MHz|0|3t||
|t|Data output disable time|Slave mode||2|10||
|t|Data output valid time|Slave mode (after enable edge)||-|25||
|t|Data output valid time|Master mode (after enable edge)||-|5||
|t|Data output hold time|Slave mode (after enable edge)||15|-||
|t||Master mode (after enable edge)||2|-||

SCK MHz c(SCK) r(SCK) f(SCK)

su(NSS)(1) PCLK h(NSS)(1) PCLK w(SCKH)(1) PCLK w(SCKL)(1) su(MI) (1) su(SI)(1) h(MI) (1)

(1)
h(SI) a(SO)(1)(2) PCLK PCLK dis(SO)(1)(3) v(SO) (1) v(MO)(1) h(SO)(1)

(1)
h(MO)

1. Guaranteed by characterization results.
2. Min time is for the minimum time to drive the output and the max time is for the maximum time to validate the data.
3. Min time is for the minimum time to invalidate the output and the max time is for the maximum time to put the data in Hi-Z
98/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Figure 49. SPI timing diagram-slave mode and CPHA = 0**

**Figure 50. SPI timing diagram-slave mode and CPHA = 1(1)**

166LQSXW W68166 WF6&. WK166 &3+$ &32/ WZ6&.+ &3+$ WZ6&./ 6&.LQSXW&32/

||W D62|||W Y62||W K62|W WU6&. I6&.|W GLV62|
|---|---|---|---|---|---|---|---|---|
|287387 0,62||W VX6,|06%287|W K6,|%,7287|||/6%287|
|,1387 026,|||06%,1||%,7,1||/6%,1||

DLE

1. Measurement points are done at CMOS levels: 0.3VDD and 0.7VDD.
DS5792 Rev 13 99/143
# Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Figure 51. SPI timing diagram-master mode(1)**

+LJK

166LQSXW

WF6&.

&3+$ &32/ &3+$ 6&.2XWSXW&32/

&3+$ &32/ &3+$ 6&.2XWSXW&32/ WZ6&.+ WU6&. WVX0, WZ6&./ WI6&. 0,62 06%,1 %,7,1 /6%,1 ,1387 WK0, 026, 06%287 %,7287 /6%287 287387 WY02 WK02 DLF

1. Measurement points are done at CMOS levels: 0.3VDD and 0.7VDD.
## 100/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

|||Table 54. I2S characteristics|||||
|---|---|---|---|---|---|---|
|Symbol|Parameter|Conditions||Min|Max|Unit|
|DuCy(SCK)|I2S slave input clock duty cycle|Slave mode||30|70|%|
|f CK|2 I S clock frequency|Master mode (data: 16 bits, Audio frequency = 48 kHz)||1.522|1.525|MHz|
|1/t c(CK)||Slave mode||0|6.5||
|t r(CK) t f(CK)|2 I S clock rise and fall time|Capacitive load C L|=50pF|-|8||
|t v(WS) (1)|WS valid time|Master mode||3|-||
||||I2S2|2|-||
|t h(WS) (1)|WS hold time|Master mode|I2S3|0|-||
|t su(WS) (1)|WS setup time|Slave mode||4|-||
|t h(WS) (1)|WS hold time|Slave mode||0|-||
|t w(CKH) (1)||Master f = 16 MHz, audio PCLK||312.5|-||
||||I2S2|2|-||
|t su(SD_MR) (1)|Data input setup time|Master receiver|I2S3|6.5|-|ns|
|t su(SD_SR) (1)|Data input setup time|Slave receiver||1.5|-||
|t h(SD_MR)(1)(2)||Master receiver||0|-||
|t v(SD_ST) (1)(2)|Data output valid time|Slave transmitter (after enable edge)||- 18|||
|t h(SD_ST) (1)|Data output hold time|Slave transmitter (after enable edge)||11|-||
|t v(SD_MT) (1)(2)|Data output valid time|Master transmitter (after enable edge)||- 3|||
|t h(SD_MT) (1)|Data output hold time|Master transmitter (after enable edge)||0-|||
|1. 2. Depends on f|Guaranteed by design and/or characterization results.. For example, if f PCLK PCLK|=8 MHz, then TPCLK = 1/f =125 ns. PLCLK DS5792 Rev 13||||101/143|

(1) t w(CKL) CK high and low time frequency = 48 kHz 345 -
(1)(2) t h(SD_SR) Data input hold time Slave receiver 0.5 -
||Electrical characteristics|STM32F103xC, STM32F103xD, STM32F103xE|
|---|---|---|
||1. 2. byte. 1. 2. byte.|Figure 52. I2S slave timing diagram (Philips protocol)(1) Measurement points are done at CMOS levels: 0.3 × VDD and 0.7 × VDD. LSB transmit/receive of the previously transmitted byte. No LSB transmit/receive is sent before the first Figure 53. I2S master timing diagram (Philips protocol)(1) Guaranteed by characterization results. LSB transmit/receive of the previously transmitted byte. No LSB transmit/receive is sent before the first|
|102/143||DS5792 Rev 13|
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# SD/SDIO MMC card host interface (SDIO) characteristics

Unless otherwise specified, the parameters given in *Table 55* are derived from tests performed under ambient temperature, fPCLKx frequency and VDD supply voltage conditions summarized in *Table 10*. Refer to *Section 5.3.14: I/O port characteristics* for more details on the input/output alternate function characteristics (D[7:0], CMD, CK).

**Figure 54. SDIO high-speed mode**

**Figure 55. SD default mode**

#+ T/6$ T<u>/($</u> $#-$ OUTPUT

AI

**Table 55. SD / MMC characteristics**

**Parameter**

|Symbol|||Conditions|Min|Max|Unit|
|---|---|---|---|---|---|---|
|f|Clock frequency in data transfer mode||CL ≤ 30 pF|0|48|MHz|
|tW(CKL)|Clock low time, f|= 16 MHz|CL ≤ 30 pF|32|-||
|tW(CKH)|Clock high time, f|= 16 MHz|CL ≤ 30 pF|30|-||
|||||||ns|
|t|Clock rise time||CL ≤ 30 pF|-|4||
|t|Clock fall time|DS5792 Rev 13|CL ≤ 30 pF|-|5|103/143|

PP PP PP r f
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 55. SD / MMC characteristics**

## Parameter

|Symbol||Conditions|Min|Max|Unit|
|---|---|---|---|---|---|
|t|Input setup time|CL ≤ 30 pF|2|-||
||||||ns|
|t CMD, D outputs (referenced to CK) in MMC and SD HS mode|Input hold time|CL ≤ 30 pF|0|-||
|t|Output valid time|CL ≤ 30 pF|-|6||
||||||ns|
|t|Output hold time|CL ≤ 30 pF|0|-||
|t|Output valid default time|CL ≤ 30 pF|-|7||
||||||ns|
|t|Output hold default time|CL ≤ 30 pF|0.5|-||

CMD, D inputs (referenced to CK) ISU IH

OV OH **CMD, D outputs (referenced to CK) i**n SD default mode

(1)
OVD OHD

1. Refer to SDIO_CLKCR, the SDI clock control register to control the CK output.
# USB characteristics

The USB interface is USB-IF certified (Full Speed).

**Table 56. USB startup time**

## Symbol Parameter Max Unit

t STARTUP(1)USB transceiver startup time 1 µs

1. Guaranteed by design.
## 104/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

**Table 57. USB DC electrical characteristics**

**(1) (1)**
**Parameter Conditions**

|Symbol|||Min.|Max.|Unit|
|---|---|---|---|---|---|
|Input levels||||||
|VDD|USB operating voltage|-3.0||3.6|V|
|VDI|Differential input sensitivity|I(USB_DP, USB_DM)|0.2|-||
|VCM|Differential common mode range|Includes VDI range|0.8|2.5|V|
|VSE|Single ended receiver threshold||1.3|2.0||
|Output levels||||||
|VOL|Static output level low|RL of 1.5 kΩ to 3.6 V|-0.3|||
||||||V|
|VOH|Static output level high|RL of 15 kΩ to VSS|2.8|3.6||

(2) (3)
(4)
(4)
(4)
-

(5)
(5)
1. All the voltages are measured from the local ground potential.
2. To be compliant with the USB 2.0 full-speed electrical specification, the USB_DP (D+) pin should be pulled up with a 1.5 kΩ resistor to a 3.0-to-3.6 V voltage range.
3. The STM32F103xC/D/E USB functionality is ensured down to 2.7 V but not the full USB electrical characteristics which are degraded in the 2.7-to-3.0 V VDD voltage range.
4. Guaranteed by characterization results.
5. RL is the load connected on the USB drivers
**Figure 56. USB timings: definition of data signal rise and fall time**

&URVVRYHU SRLQWV ’LIIHUHQWLDO GDWDOLQHV

9&56

WI WU DLE

**Table 58. USB: full-speed electrical characteristics**

**(1)**
**Driver characteristics**

**Parameter**

|Symbol||Conditions|Min|Max|Unit|
|---|---|---|---|---|---|
|t|Rise time|CL = 50 pF|420ns|||
|t|Fall Time|CL = 50 pF|4|20|ns|
|t|Rise/ fall time matching|t /t|90|110|%|
|VCRS|Output signal crossover voltage|-|1.3|2.0|V|

(2)
r

(2)
f rfm r f

1. Guaranteed by design.
2. Measured from 10% to 90% of the data signal. For more detailed informations, please refer to USB Specification-Chapter 7 (version 2.0).
DS5792 Rev 13 105/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

|5.3.18 Note:|CAN (controller area network) interface Refer to function characteristics (CAN_TX and CAN_RX). 5.3.19 12-bit ADC characteristics voltage conditions summarized in|Section 5.3.14: I/O port characteristics Unless otherwise specified, the parameters given in from tests performed under ambient temperature, fPCLK2 frequency and VDDA supply Table 10. It is recommended to perform a calibration after each power-up. Table 59. ADC characteristics|Table 59|for more details on the input/output alternate|are preliminary values derived||
|---|---|---|---|---|---|---|
|Symbol|Parameter|Conditions|Min|Typ|Max|Unit|
|VDDA|Power supply|-|2.4|-|3.6|V|
|VREF+|Positive reference voltage|-|2.4|-|VDDA|V|
|VREF-|Negative reference voltage|-|0|||V|
|IVREF|Current on the V input REF pin|-|-|(1) 160|220|µA|
|f ADC|ADC clock frequency|-|0.6|-|14|MHz|
|f S(2)|Sampling rate|-|0.05|-|1|MHz|
|||f = 14 MHz ADC|-|-|823|kHz|
|f TRIG(2)|External trigger frequency|||---171/f||ADC|
|VAIN|(3) Conversion voltage range|- f = 14 MHz ADC|or V 0 (V SSA REF- tied to ground) 5.9||-V REF+|V µs|
|t CAL(2)|Calibration time||||-831/f|ADC|
||Injection trigger conversion|= 14 MHz f ADC|-|-|0.214|µs|
|t lat(2)|latency|||---3|(4)|1/f ADC|
||Regular trigger conversion|= 14 MHz f ADC|-|-|0.143|µs|
|t latr(2)|latency|||---2|(4)|1/f ADC|
|||f = 14 MHz ADC|0.107|-|17.1|µs|
|t S(2)|Sampling time|-|1.5|-|239.5|1/f ADC|
|t STAB(2)|Power-up time|-|0|0|1|µs|
|||f = 14 MHz ADC|1|-|18|µs|
|t CONV(2) 106/143|Total conversion time (including sampling time)|- DS5792 Rev 13|14 to 252 (t S successive approximation)|for sampling +12.5 for||1/f ADC|

(2) RAIN External input impedance See Equation 1 and Table 60 for details --50 κΩ
(2) RADC Sampling switch resistance - - - 1 κΩ
(2) CADC Internal sample and hold capacitor ---8pF
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

1. Guaranteed by characterization results.
2. Guaranteed by design.
3. VREF+ can be internally connected to VDDA and VREF- can be internally connected to VSSA, depending on the package. Refer to *Section 3: Pinouts and pin descriptions* for further details.
4. For external triggers, a delay of 1/fPCLK2 must be added to the latency specified in *Table 59*.
## Equation 1: RAIN max formula

TS RAIN < --------------------------------------------------------------- N2 + -–RADC f ADC× CADC × ln () 2

The formula above (*Equation 1*) is used to determine the maximum external impedance allowed for an error below 1/4 of LSB. Here N = 12 (from 12-bit resolution).

**Table 60. RAIN max for fADC = 14 MHz(1)**

||T (cycles)||t (µs)||
|---|---|---|---|---|
|1.5||0.11||0.4|
|7.5||0.54||5.9|
|13.5||0.96||11.4|
|28.5||2.04||25.2|
|41.5||2.96||37.2|
|55.5||3.96||50|
|71.5||5.11||NA|
|239.5||17.1||NA|

**s SRAIN max (k**Ω**)**

1. Guaranteed by design.
**Table 61. ADC accuracy-limited test conditions(1)(2)**

**Parameter**

**(3)**

|Symbol||Test conditions|Typ|Max|Unit|
|---|---|---|---|---|---|
|ET|Total unadjusted error|f = 56 MHz,|±1.3|±2||
|EO|Offset error|f = 14 MHz, RAIN < 10 kΩ, VDDA = 3 V to 3.6 V|±1|±1.5||
|EG|Gain error|TA = 25 °C|±0.5|±1.5|LSB|
|ED|Differential linearity error|Measurements made after ADC calibration|±0.7|±1||
|EL|Integral linearity error|VREF+ = VDDA|±0.8|±1.5||

PCLK2 ADC

1. ADC DC accuracy values are measured after internal calibration.
2. ADC Accuracy vs. Negative Injection Current: Injecting negative current on any analog input pins should be avoided as this significantly reduces the accuracy of the conversion being performed on another analog input. It is recommended to add a Schottky diode (pin to ground) to analog pins which may potentially inject negative current. Any positive injection current within the limits specified for IINJ(PIN) and ΣIINJ(PIN) in *Section 5.3.14* does not affect the ADC accuracy.
3. Guaranteed by characterization results.
DS5792 Rev 13 107/143
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

**Table 62. ADC accuracy(1) (2)(3)**

**Parameter**

**(4)**

|Symbol||Test conditions|Typ|Max|Unit|
|---|---|---|---|---|---|
|ET|Total unadjusted error||±2|±5||
|EO|Offset error|f f = 14 MHz, RAIN < 10 kΩ, = 56 MHz,|±1.5|±2.5||
|EG|Gain error|VDDA = 2.4 V to 3.6 V|±1.5|±3|LSB|
|ED|Differential linearity error|Measurements made after ADC calibration|±1|±2||
|EL|Integral linearity error||±1.5|±3||

PCLK2 ADC

1. ADC DC accuracy values are measured after internal calibration.
2. Better performance could be achieved in restricted VDD, frequency, VREF and temperature ranges.
3. ADC Accuracy vs. Negative Injection Current: Injecting negative current on any analog input pins should be avoided as this significantly reduces the accuracy of the conversion being performed on another analog input. It is recommended to add a Schottky diode (pin to ground) to analog pins which may potentially inject negative current. Any positive injection current within the limits specified for IINJ(PIN) and ΣIINJ(PIN) in *Section 5.3.14* does not affect the ADC accuracy.
4. Guaranteed by characterization results.
**Figure 57. ADC accuracy characteristics**

<u>6 2%& 6 $$!</u> ;,3" )$%!, ORDEPENDINGONPACKAGE= %’

<u>%4</u>

<u>%/</u> %,

%$

,3")$%!,

633! 6$$! **AIC**

1. Example of an actual transfer curve.
2. Ideal transfer curve.
3. End point correlation line.
4. ET = Total Unadjusted Error: maximum deviation between the actual and the ideal transfer curves. EO = Offset Error: deviation between the first actual transition and the first ideal one. EG = Gain Error: deviation between the last ideal transition and the last actual one. ED = Differential Linearity Error: maximum deviation between actual steps and the ideal one. EL = Integral Linearity Error: maximum deviation between any actual transition and the end point correlation line.
108/143 DS5792 Rev 13
**STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics**

670)

|5$,1|$,1[|9’’ 97 9|Figure 58. Typical connection diagram using the ADC FRQYHUWHU 5$’&|
|---|---|---|---|
|9$,1 Refer to Table 59 parasitic ADC|&SDUDVLWLF pad capacitance (roughly 7 pF). A high C should be reduced. General PCB design guidelines|97 9 for the values of RAIN, RADC and CADC. parasitic Power supply decoupling should be performed as shown in ceramic (good quality). They should be placed them as close as possible to the chip.|,/����� represents the capacitance of the PCB (dependent on soldering and PCB layout quality) plus the depending on whether VREF+ is connected to VDDA or not. The 10 nF capacitors should be Figure 59. Power supply and reference decoupling (VREF+ not connected to VDDA)|
||||9|
||���)Q)||5() 9 ’’$ 9 66$|

6DPSOHDQGKROG$’&

ELW FRQYHUWHU & $’&

DL

1.
2. C
value will downgrade conversion accuracy. To remedy this, f

*Figure 59* or *Figure 60*,

670)[[ VHHQRWH
���)Q)

9 ���� VHHQRWH

DLE

1. VREF+ and VREF– inputs are available only on 100-pin packages.
DS5792 Rev 13 109/143
||Electrical characteristics|Figure 60. Power supply and reference decoupling (VREF+ connected to VDDA)|STM32F103xC, STM32F103xD, STM32F103xE|
|---|---|---|---|
|||9 5() ���)Q) 9 ����|670)[[9 ’’$ 6HHQRWH 9 66$ 6HHQRWH|
|110/143|1.|VREF+ and VREF– inputs are available only on 100-pin packages. DS5792 Rev 13|DL|
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

||5.3.20 DAC electrical specifications||Table 63. DAC characteristics||||
|---|---|---|---|---|---|---|
|Symbol|Parameter|Min|Typ|Max|Unit|Comments|
|VDDA|Analog supply voltage|2.4|-|3.6|V|-|
|VREF+|Reference supply voltage|2.4|-|3.6|V|VREF+ must always be below VDDA|
|VSSA|Ground|0|-|0|V|-|
|DAC_OUT (1) min|Lower DAC_OUT voltage with buffer ON|0.2 -||-|V|It gives the maximum output excursion of the DAC. It corresponds to 12-bit input code (0x0E0) to (0xF1C) at VREF+ = 3.6 V|
|DAC_OUT (1) max|Higher DAC_OUT voltage with buffer ON||--V|– 0.2 DDA|V|and (0x155) and (0xEAB) at VREF+ = 2.4 V|
|DAC_OUT (1) min|Lower DAC_OUT voltage with buffer OFF||-0.5|-|mV|It gives the maximum output|
|DAC_OUT (1) max|Higher DAC_OUT voltage with buffer OFF||--|V – REF+ 1LSB|V|excursion of the DAC.|
|IDDVREF+|DAC DC current consumption in quiescent mode (Standby mode)||--220||µA|With no load, worst code (0xF1C) at VREF+ = 3.6 V in terms of DC consumption on the inputs|
||DAC DC current||--||380µA|With no load, middle code (0x800) on the inputs|
|IDDA|consumption in quiescent (3) mode consecutive code-1LSB)||-- --|±2 LSB|480µA|With no load, worst code (0xF1C) at = 3.6 V in terms of DC V REF+ consumption on the inputs Given for the DAC in 12-bit configuration|
||Integral non linearity (difference between||-- DS5792 Rev 13||±1LSB|Given for the DAC in 10-bit configuration 111/143|

(1) RLOAD Resistive load with buffer ON 5- -k Ω -
(2) RO Impedance output with buffer OFF -- 15 k Ω When the buffer is OFF, the Minimum resistive load between DAC_OUT and VSS to have a 1% accuracy is 1.5 MΩ
(1) CLOAD Capacitive load - - 50 pF Maximum capacitive load at DAC_OUT pin (when the buffer is ON).
(4) DNL Differential non linearity Difference between two -- ±0.5 LSB Given for the DAC in 10-bit configuration
(3) INL measured value at Code i and the value at Code i on a line drawn between Code 0 and last Code 1023) -- ±4LSB Given for the DAC in 12-bit configuration
## Electrical characteristics STM32F103xC, STM32F103xD, STM32F103xE

|||||Table 63. DAC characteristics (continued)||||
|---|---|---|---|---|---|---|---|
|Symbol||Parameter Offset error (0x800) and the ideal value = VREF+/2)|Min|Typ -- --|Max|Unit ±10mV ±12LSB|Comments-Given for the DAC in 12-bit at V REF+ = 3.6 V|
|Gain (3) error||Gain error|-|-|±0.5|%|Given for the DAC in 12bit configuration|
|t SETTLING(3)||Settling time (full scale: for a 10-bit input code transition between the lowest and the highest input codes when DAC_OUT reaches final value ±1LSB||-3|4 µsC||≤ 50 pF, RLOAD ≥ 5 kΩ LOAD|
|Update (3) rate||Max frequency for a correct DAC_OUT change when small variation in the input code (from code i to i+1LSB)||--|1|MS/ s|≤ 50 pF, R ≥ 5 kΩ C LOAD LOAD|
|t WAKEUP(3)||Wakeup time from off state (Setting the ENx bit in the DAC Control register)||-6.5|10|µs|CLOAD ≤ 50 pF, RLOAD ≥ 5 kΩ input code between lowest and highest possible ones.|
|1. Guaranteed by design. 2. 3. consumption occurs. 4.||Guaranteed by characterization. Guaranteed by characterization results. ELW GLJLWDOWR DQDORJ FRQYHUWHU|%XIIHUHG1RQEXIIHUHG’$&|The quiescent mode corresponds to a state where the DAC maintains a stable output level to ensure that no dynamic|Figure 61. 12-bit buffered /non-buffered DAC %XIIHU|’$&B287[|5 / & / AI6|
|112/143||1. configuring the BOFFx bit in the DAC_CR register.||DS5792 Rev 13|The DAC integrates an output buffer that can be used to reduce the output impedance and to drive external loads directly without the use of an external operational amplifier. The buffer can be bypassed by|||

(3) Offset (difference between measured value at Code -- ±3LSB Given for the DAC in 10-bit at VREF+ = 3.6 V
(1) PSRR+ Power supply rejection ratio (to VDDA) (static DC measurement - –67 –40 dB No RLOAD, CLOAD = 50 pF
## STM32F103xC, STM32F103xD, STM32F103xE Electrical characteristics

# 5.3.21 Temperature sensor characteristics

**Table 64. TS characteristics Parameter**

|Symbol||Min|Typ|Max|Unit|
|---|---|---|---|---|---|
|TL|VSENSE linearity with temperature|-|±1|±2°C||
|Avg_Slope|Average slope|4.0|4.3|4.6|mV/°C|
|V|Voltage at 25 °C|1.34|1.43|1.52|V|
|t|Startup time ADC sampling time when reading the|4|-|10|µs|

25 START(1) TS_temp(2)(1)--17.1 µs temperature

1. Guaranteed by design.
2. Shortest sampling time can be determined in the application by multiple iterations.
## DS5792 Rev 13 113/143
### Package information STM32F103xC, STM32F103xD, STM32F103xE

# 6 Package information

In order to meet environmental requirements, ST offers these devices in different grades of ECOPACK® packages, depending on their level of environmental compliance. ECOPACK® specifications, grade definitions and product status are available at: *www.st.com*. ECOPACK® is an ST trademark.

## 6.1 LFBGA144 package information

**Figure 62. LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm,**

### 0.8 mm pitch, package outline

& 6HDWLQJSODQH

|||||GGG|&|
|---|---|---|---|---|---|
|$ $ $|$ H|$%$// ) 3$’&251(5|$ $ 3$’&251(5|$%$//||
|||)||||

’ % ’

( (

H $ 0 %277209,(: 7239,(:

||��������������|
|---|---|
|� HHH 0|& $ %|
|� III|& 0|

/)%*$B;B0(B9

1. Drawing is not to scale.
**Table 65. LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm,**

### 0.8 mm pitch, package mechanical data

**millimeters inches**

**(1)**
**Symbol** **Min Typ Max Typ Min Max**

(2)

|A|-|-|1.700|-|-|0.0669|
|---|---|---|---|---|---|---|
|A1|0.250|0.300|0.350|0.098|0.0118|0.0138|
|A2|0.810|0.910|1.010|0.0319|0.0358|0.0398|
|A3|0.225|0.26|0.295|0.0089|0.0102|0.0116|
|A4|0.585|0.650 DS5792 Rev 13|0.715|0.0230|0.0256|0.0281|

114/143
# STM32F103xC, STM32F103xD, STM32F103xE Package information

**Table 65. LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm,**

# 0.8 mm pitch, package mechanical data (continued)

**millimeters inches**

**(1)**
## Symbol

## Min Typ Max Typ Min Max

|b|0.350|0.400|0.450|0.0138|0.0157|0.0177|
|---|---|---|---|---|---|---|
|D|9.900|10.000|10.100|0.3898|0.3937|0.3976|
|D1|-|8.800|-|-|0.3465|-|
|E|9.900|10.000|10.100|0.3898|0.3937|0.3976|
|E1|-|8.800|-|-|0.3465|-|
|e|-|0.800|-|-|0.0315|-|
|F|-|0.600|-|-|0.0236|-|
|ddd|-|-|0.100|-|-|0.0039|
|eee|-|-|0.150|-|-|0.0059|
|fff|-|-|0.080|-|-|0.0031|

1. Values in inches are converted from mm and rounded to 4 decimal digits.
2. STATSChipPAC package dimensions.
**Figure 63. LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm,**

# 0.8 mm pitch, package recommended footprint

'SDG ’VP

/)%*$B;B)3B9

**Table 66. LFBGA144 recommended PCB design rules (0.8 mm pitch BGA)**

## Dimension Recommended values

Pitch 0.8 mm Dpad 0.400 mm

## DS5792 Rev 13 115/143
## Package information STM32F103xC, STM32F103xD, STM32F103xE

<u>Table 66. LFBGA144 recommended PCB design rules (0.8 mm pitch BGA) (continued)</u>

**Dimension Recommended values**

|UBM|0.350 mm|
|---|---|
|Dsm|0.470 mm typ. (depends on the solder mask registration tolerance)|
|Stencil opening|0.400 mm|
|Stencil thickness|Between 0.100 mm to 0.125 mm|
|Pad trace width|0.120 mm|
|Ball Diameter|0.400 mm|

# Device marking for LFBGA144 package

The following figure gives an example of topside marking orientation versus ball A1 identifier location.

**Figure 64. LFBGA144 marking example (package top view)**

3URGXFWLGHQWLILFDWLRQ

## 670) =&+

’DWHFRGH %DOO $LGHQWLILHU <::

06Y9

1. Parts marked as ES or E or accompanied by an Engineering Sample notification letter are not yet qualified and therefore not approved for use in production. ST is not responsible for any consequences resulting from such use. In no event will ST be liable for the customer using any of these engineering samples in production. ST’s Quality department must be contacted prior to any decision to use these engineering samples to run a qualification activity
116/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Package information

# 6.2 LFBGA100 package information

**Figure 65. LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package outline**

= 6HDWLQJSODQH GGG =

$ $ $ $ ( $EDOO $EDOO; LGHQWLILHU LQGH[DUHD (

H)
$ )

||��������������|
|---|---|
|� HHH 0|= <;|
|� III|0 =|

||)||
|---|---|---|
||’|’|
||H||
|.||<|

%277209,(: 7239,(: +B0(B9

1. Drawing is not to scale.
**Table 67. LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package mechanical data**

**(1) millimeters inches**
**Symbol** **Min Typ Max Min Typ Max**

|A|-|-|1.700|-|-|0.0669|
|---|---|---|---|---|---|---|
|A1|0.270|-|-|0.0106|-|-|
|A2|-|0.300|-|-|0.0118|-|
|A4|-|-|0.800|-|-|0.0315|
|b|0.450|0.500|0.550|0.0177|0.0197|0.0217|
|D|9.850|10.000|10.150|0.3878|0.3937|0.3996|
|D1|-|7.200|-|-|0.2835|-|
|E|9.850|10.000|10.150|0.3878|0.3937|0.3996|
|E1|-|7.200|-|-|0.2835|-|
|e|-|0.800|-|-|0.0315|-|
|F|-|1.400|-|-|0.0551|-|
|ddd|-|- DS5792 Rev 13|0.120|-|-|0.0047 117/143|
|Package information|STM32F103xC, STM32F103xD, STM32F103xE Table 67. LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package mechanical data (1) millimeters inches Symbol Min Typ Max Min Typ eee - - 0.150 - - fff - - 0.080 - - 1. Values in inches are converted from mm and rounded to 4 decimal digits. Figure 66. LFBGA100 – 100-ball low profile fine pitch ball grid array, 10 x 10 mm, 0.8 mm pitch, package recommended footprintoutline|Max 0.0059 0.0031||
|---|---|---|---|
||'SDG ’VP Table 68. LFBGA100 recommended PCB design rules (0.8 mm pitch BGA) Dimension Recommended values Pitch 0.8 Dpad 0.500 mm 0.570 mm typ. (depends on the soldermask Dsm registration tolerance) Stencil opening 0.500 mm Stencil thickness Between 0.100 mm and 0.125 mm Pad trace width 0.120 mm|+B)3B9||
|118/143|DS5792 Rev 13|||
## STM32F103xC, STM32F103xD, STM32F103xE Package information

# Device marking for LFBGA100 package

The following figure gives an example of topside marking orientation versus ball A1 identifier location.

**Figure 67. LFBGA100 marking example (package top view)**

$GGLWLRQDO; LQIRUPDWLRQ 3URGXFWLGHQWLILFDWLRQ

## 670) 9+

’DWHFRGH

## < ::

%DOO$ LQGHQWLILHU

06Y9

1. Parts marked as ES or E or accompanied by an Engineering Sample notification letter are not yet qualified and therefore not approved for use in production. ST is not responsible for any consequences resulting from such use. In no event will ST be liable for the customer using any of these engineering samples in production. ST’s Quality department must be contacted prior to any decision to use these engineering samples to run a qualification activity
DS5792 Rev 13 119/143
## Package information STM32F103xC, STM32F103xD, STM32F103xE

# 6.3 WLCSP64 package information

**Figure 68. WLCSP, 64-ball 4.466 × 4.395 mm, 0.500 mm pitch, wafer-level chip-scale package outline**

<u>H</u> EEE =

|||||H||||
|---|---|---|---|---|---|---|---|
|||||*||||
|H|%XPSVLGH ’|)|;||||6LGHYLHZ|
|||||<||||
|||||%XPS||||
|||||HHH =||||
|||||(||||
|||||E||||
||$ 2ULHQWDWLRQ|||FFF ;<=||||
||UHIHUHQFH|||= GGG||||

<u>)</u> * $ ’HWDLO$

H + $ $

$

= 6HDWLQJSODQH

DDD ’HWDLO$ [������������� :DIHUEDFNVLGH &5B0(B9

1. Drawing is not to scale.
2. Primary datum Z and seating plane are defined by the spherical crowns of the ball.
**Table 69. WLCSP, 64-ball 4.466 × 4.395 mm, 0.500 mm pitch, wafer-level chip-scale package mechanical data**

**millimeters inches**

**(1)**
## Symbol

## Min Typ Max Min Typ Max

A 0.535 0.585 0.635 0.0211 0.0230 0.0250 A1 0.205 0.230 0.255 0.0081 0.0091 0.0100 A2 0.330 0.355 0.380 0.0130 0.0140 0.0150

## 120/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Package information

**Table 69. WLCSP, 64-ball 4.466 × 4.395 mm, 0.500 mm pitch, wafer-level chip-scale package mechanical data**

**(1) millimeters inches**
**Symbol** **Min Typ Max Min Typ Max**

(2)

|b|0.290|0.320|0.350|0.0114|0.0126|0.0138|
|---|---|---|---|---|---|---|
|e|-|0.500|-|-|0.0197|-|
|e1|-|3.500|-|-|0.1378|-|
|F|-|0.447|-|-|0.0176|-|
|G|-|0.483|-|-|0.0190|-|
|D|4.446|4.466|4.486|0.1750|0.1758|0.1766|
|E|4.375|4.395|4.415|0.1722|0.1730|0.1738|
|H|-|0.250|-|-|0.0098|-|
|L|-|0.200|-|-|0.0079|-|
|eee|-|0.05|-|-|0.0020|-|
|aaa|-|0.10|-|-|0.0039|-|
|Number of balls||||64|||

1. Values in inches are converted from mm and rounded to 4 decimal digits.
2. Dimension is measured at the maximum ball diameter parallel to primary datum Z.
**Figure 69. WLCSP64 - 64-ball, 4.4757 x 4.4049 mm, 0.5 mm pitch wafer level chip scale package recommended footprint**

'SDG ’VP

:/&63B&5B)3B9

**Table 70. WLCSP64 recommended PCB design rules (0.5 mm pitch)**

|Dimension|Recommended values|
|---|---|
|Pitch|0.5|
|Dpad|250 µm|
|Dsm|300 µm|
|Stencil Opening|320 µm|

DS5792 Rev 13 121/143
## STM32F103xC, STM32F103xD, STM32F103xE

**Table 70. WLCSP64 recommended PCB design rules (0.5 mm pitch) (continued)**

## Recommended values

Between 100 µm to 125 µm 100 µm 320 µm

# LQFP144 package information

**Figure 70. LQFP144 - 144-pin, 20 x 20 mm low-profile quad flat package outline**

F

## Package information

## Dimension

Stencil Thickness Pad trace width Ball Diameter

**6.4**
6($7,1* 3/$1( <u>&</u>

$ $ $

|||PP|
|---|---|---|
||FFF &|*$8*(3/$1(|

$ ’ <u>/</u>. ’ <u>/</u> ’

E

3,1 ,’(17,),&$7,21

1. Drawing is not to scale.
122/143

( ( (

H $B0(B9

## DS5792 Rev 13
# STM32F103xC, STM32F103xD, STM32F103xE Package information

**Table 71. LQFP144 - 144-pin, 20 x 20 mm low-profile quad flat package mechanical data**

**millimeters inches**

**(1)**
## Symbol

## Min Typ Max Min Typ Max

|A|-|-|1.600|-|-|0.0630|
|---|---|---|---|---|---|---|
|A1|0.050|-|0.150|0.0020|-|0.0059|
|A2|1.350|1.400|1.450|0.0531|0.0551|0.0571|
|b|0.170|0.220|0.270|0.0067|0.0087|0.0106|
|c|0.090|-|0.200|0.0035|-|0.0079|
|D|21.800|22.000|22.200|0.8583|0.8661|0.8740|
|D1|19.800|20.000|20.200|0.7795|0.7874|0.7953|
|D3|-|17.500|-|-|0.6890|-|
|E|21.800|22.000|22.200|0.8583|0.8661|0.8740|
|E1|19.800|20.000|20.200|0.7795|0.7874|0.7953|
|E3|-|17.500|-|-|0.6890|-|
|e|-|0.500|-|-|0.0197|-|
|L|0.450|0.600|0.750|0.0177|0.0236|0.0295|
|L1 k 0°3.5°7° 0°3.5°7°|-|1.000|-|-|0.0394|-|
|ccc|-|-|0.080|-|-|0.0031|

1. Values in inches are converted from mm and rounded to 4 decimal digits.
## DS5792 Rev 13 123/143
## Package information STM32F103xC, STM32F103xD, STM32F103xE

**Figure 71. LQFP144 - 144-pin,20 x 20 mm low-profile quad flat package recommended footprint**

DLH

1. Dimensions are expressed in millimeters.
124/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Package information

# Device marking for LQFP144 package

The following figure gives an example of topside marking orientation versus pin 1 identifier location.

**Figure 72. LQFP144 marking example (package top view)**

2SWLRQDOJDWHPDUN

||5HYLVLRQFRGH|
|---|---|
|;|’DWHFRGH|
||<::|
|3LQLGHQWLILHU||

670)=(7

3URGXFWLGHQWLILFDWLRQ

06Y9

1. Parts marked as ES or E or accompanied by an Engineering Sample notification letter are not yet qualified and therefore not approved for use in production. ST is not responsible for any consequences resulting from such use. In no event will ST be liable for the customer using any of these engineering samples in production. ST’s Quality department must be contacted prior to any decision to use these engineering samples to run a qualification activity
DS5792 Rev 13 125/143
## Package information STM32F103xC, STM32F103xD, STM32F103xE

# 6.5 LQFP100 package information

**Figure 73. LQFP100 – 14 x 14 mm 100 pin low-profile quad flat package outline**

3%!4).’0,!.% <u>#</u>

|! ! !|||’!5’%0,!.% MM||
|---|---|---|---|---|
||CCC #|$ $|,,|! +|
|||$|||

C

B % % %

0).
)$%.4)&)#!4)/.
E ,?-%?6

1. Drawing is not to scale.
**Table 72. LQPF100 – 14 x 14 mm 100-pin low-profile quad flat package mechanical data**

**millimeters inches**

**(1)**
**Symbol** **Min Typ Max Min Typ Max**

|A|-|-|1.600|-|-|0.0630|
|---|---|---|---|---|---|---|
|A1|0.050|-|0.150|0.0020|-|0.0059|
|A2|1.350|1.400|1.450|0.0531|0.0551|0.0571|
|b|0.170|0.220|0.270|0.0067|0.0087|0.0106|
|c|0.090|-|0.200|0.0035|-|0.0079|
|D|15.800|16.000|16.200|0.6220|0.6299|0.6378|
|D1|13.800|14.000|14.200|0.5433|0.5512|0.5591|
|D3|-|12.000|-|-|0.4724|-|
|E|15.800|16.000|16.200|0.6220|0.6299|0.6378|
|E1 126/143|13.800|14.000|14.200 DS5792 Rev 13|0.5433|0.5512|0.5591|
# STM32F103xC, STM32F103xD, STM32F103xE Package information

**Table 72. LQPF100 – 14 x 14 mm 100-pin low-profile quad flat package mechanical data (continued)**

**(1) millimeters inches**
## Symbol

## Min Typ Max Min Typ Max

|E3|-|12.000|-|-|0.4724|-|
|---|---|---|---|---|---|---|
|e|-|0.500|-|-|0.0197|-|
|L|0.450|0.600|0.750|0.0177|0.0236|0.0295|
|L1 k 0°3.5°7° 0°3.5°7°|-|1.000|-|-|0.0394|-|
|ccc|-|-|0.08|-|-|0.0031|

1. Values in inches are converted from mm and rounded to 4 decimal digits.
**Figure 74. LQFP100 recommended footprint**

AIC

1. Dimensions are in millimeters.
## DS5792 Rev 13 127/143
## Package information STM32F103xC, STM32F103xD, STM32F103xE

## Device marking for LQFP100 package

The following figure gives an example of topside marking orientation versus pin 1 identifier location.

**Figure 75. LQFP100 marking example (package top view)**

2SWLRQDOJDWH PDUN 3URGXFWLGHQWLILFDWLRQ

^dDϯϮ&ϭϬϯ 5HYLVLRQFRGH sϴdϲ y

’DWHFRGH z tt

3LQLGHQWLILHU

06Y9

1. Parts marked as ES or E or accompanied by an Engineering Sample notification letter are not yet qualified and therefore not approved for use in production. ST is not responsible for any consequences resulting from such use. In no event will ST be liable for the customer using any of these engineering samples in production. ST’s Quality department must be contacted prior to any decision to use these engineering samples to run a qualification activity
128/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Package information

# 6.6 LQFP64 package information

**Figure 76. LQFP64 – 10 x 10 mm 64 pin low-profile quad flat package outline**

6($7,1*3/$1(

|&||||||
|---|---|---|---|---|---|
|$ $|$ FFF|&|’ ’ ’|F $|PP *$8*(3/$1( / /|

.

E ( ( (

<u>3,1</u> <u>H</u> ,’(17,),&$7,21 :B0(B9

1. Drawing is not in scale.
**Table 73. LQFP64 – 10 x 10 mm 64 pin low-profile quad flat package mechanical data**

**(1) millimeters inches**
## Symbol

## Min Typ Max Min Typ Max

|A|-|-|1.600|-|-|0.0630|
|---|---|---|---|---|---|---|
|A1|0.050|-|0.150|0.0020|-|0.0059|
|A2|1.350|1.400|1.450|0.0531|0.0551|0.0571|
|b|0.170|0.220|0.270|0.0067|0.0087|0.0106|
|c|0.090|-|0.200|0.0035|-|0.0079|
|D|-|12.000|-|-|0.4724|-|
|D1|-|10.000|-|-|0.3937|-|
|D3|-|7.500|-|-|0.2953|-|
|E|-|12.000|-|-|0.4724|-|
|E1|-|10.000|- DS5792 Rev 13|-|0.3937|- 129/143|
# Package information STM32F103xC, STM32F103xD, STM32F103xE

<u>Table 73. LQFP64 – 10 x 10 mm 64 pin low-profile quad flat package mechanical data (continued)</u>

**millimeters inches**

**(1)**
## Symbol

## Min Typ Max Min Typ Max

|E3|-|7.500|-|-|0.2953|-|
|---|---|---|---|---|---|---|
|e|-|0.500|-|-|0.0197|-|
|θ|0°|3.5°|7°|0°|3.5°|7°|
|L|0.450|0.600|0.750|0.0177|0.0236|0.0295|
|L1|-|1.000|-|-|0.0394|-|
|ccc|-|-|0.080|-|-|0.0031|

1. Values in inches are converted from mm and rounded to 4 decimal digits.
<u>Figure 77. LQFP64 - 64-pin, 10 x 10 mm low-profile quad flat recommended footprint</u>

AIC

1. Dimensions are in millimeters.
## 130/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Package information

## Device marking for LQFP64 package

The following figure gives an example of topside marking orientation versus pin 1 identifier location.

**Figure 78. LQFP64 marking example (package top view)**

5HYLVLRQFRGH 3URGXFWLGHQWLILFDWLRQ ^dDϯϮ&ϭϬϯ Zdϲ

’DWHFRGH 3LQLGHQWLILHU ztt

06Y9

1. Parts marked as ES or E or accompanied by an Engineering Sample notification letter are not yet qualified and therefore not approved for use in production. ST is not responsible for any consequences resulting from such use. In no event will ST be liable for the customer using any of these engineering samples in production. ST’s Quality department must be contacted prior to any decision to use these engineering samples to run a qualification activity
DS5792 Rev 13 131/143
# Package information STM32F103xC, STM32F103xD, STM32F103xE

|Where: • •Θ JA • • application.|6.7 Thermal characteristics The maximum chip junction temperature (TJmax) must never exceed the values given in Table 10: General operating conditions on page 44. The maximum chip-junction temperature, TJ max, in degrees Celsius, may be calculated using the following equation: TJ max = TA max + (PD max x ΘJA) TA max is the maximum ambient temperature in °C, is the package junction-to-ambient thermal resistance, in °C/W, PD max is the sum of PINT max and PI/O max (PD max = PINT max + PI/Omax), PINT max is the product of IDD and VDD, expressed in Watts. This is the maximum chip internal power. PI/O max represents the maximum power dissipation on output pins where: PI/O max = Σ (VOL × IOL) + Σ((VDD – VOH) × IOH), taking into account the actual VOL / IOL and VOH / IOH of the I/Os at low and high level in the Table 74. Package thermal characteristics|||
|---|---|---|---|
|Symbol|Parameter Thermal resistance junction-ambient LFBGA144 - 10 × 10 mm / 0.8 mm pitch Thermal resistance junction-ambient LQFP144 - 20 × 20 mm / 0.5 mm pitch Thermal resistance junction-ambient LFBGA100 - 10 × 10 mm / 0.8 mm pitch|Value 40 30 40|Unit|
|ΘJA|Thermal resistance junction-ambient LQFP100 - 14 × 14 mm / 0.5 mm pitch Thermal resistance junction-ambient LQFP64 - 10 × 10 mm / 0.5 mm pitch Thermal resistance junction-ambient WLCSP64|46 45 50|°C/W|
|6.7.1 Reference document|JESD51-2 Integrated Circuits Thermal Test Method Environment Conditions-Natural Convection (Still Air). Available from www.jedec.org DS5792 Rev 13|||

132/143
## <u>STM32F103xC, STM32F103xD, STM32F103xE Package information</u>

# 6.7.2 Selecting the product temperature range

When ordering the microcontroller, the temperature range is specified in the ordering information scheme shown in *Table 75: Ordering information scheme*. Each temperature range suffix corresponds to a specific guaranteed ambient temperature at maximum dissipation and, to a specific maximum junction temperature. As applications do not commonly use the STM32F103xC, STM32F103xD and STM32F103xE at maximum dissipation, it is useful to calculate the exact power consumption and junction temperature to determine which temperature range will be best suited to the application. The following examples show how to calculate the temperature range needed for a given application.

## Example 1: High-performance application

Assuming the following application conditions: Maximum ambient temperature TAmax = 82 °C (measured according to JESD51-2), IDDmax = 50 mA, VDD = 3.5 V, maximum 20 I/Os used at the same time in output at low level with IOL = 8 mA, VOL= 0.4 V and maximum 8 I/Os used at the same time in output at low level with IOL = 20 mA, VOL= 1.3 V PINTmax = 50 mA × 3.5 V= 175 mW PIOmax = 20 × 8 mA × 0.4 V + 8 × 20 mA × 1.3 V = 272 mW This gives: PINTmax = 175 mW and PIOmax = 272 mW: PDmax = 175 + 272 = 447 mW Thus: PDmax = 447 mW Using the values obtained in *Table 74* TJmax is calculated as follows: – For LQFP100, 46 °C/W TJmax = 82 °C + (46 °C/W × 447 mW) = 82 °C + 20.6 °C = 102.6 °C This is within the range of the suffix 6 version parts (–40 < TJ < 105 °C). In this case, parts must be ordered at least with the temperature range suffix 6 (see

*Table 75: Ordering information scheme*).

## Example 2: High-temperature application

Using the same rules, it is possible to address applications that run at high ambient temperatures with a low dissipation, as long as junction temperature TJ remains within the specified range. Assuming the following application conditions: Maximum ambient temperature TAmax = 115 °C (measured according to JESD51-2), IDDmax = 20 mA, VDD = 3.5 V, maximum 20 I/Os used at the same time in output at low level with IOL = 8 mA, VOL= 0.4 V PINTmax = 20 mA × 3.5 V= 70 mW PIOmax = 20 × 8 mA × 0.4 V = 64 mW This gives: PINTmax = 70 mW and PIOmax = 64 mW: PDmax = 70 + 64 = 134 mW Thus: PDmax = 134 mW

<u>DS5792 Rev 13 133/143</u>
## Package information STM32F103xC, STM32F103xD, STM32F103xE

Using the values obtained in *Table 74* TJmax is calculated as follows: – For LQFP100, 46 °C/W TJmax = 115 °C + (46 °C/W × 134 mW) = 115 °C + 6.2 °C = 121.2 °C This is within the range of the suffix 7 version parts (–40 < TJ < 125 °C). In this case, parts must be ordered at least with the temperature range suffix 7 (see

*Table 75: Ordering information scheme*).

**Figure 79. LQFP100 PD max vs. TA**

700 600 500 400 Suffix 6 (mW)DSuffix 7 300 P 200 100 0 65 75 85 95 105 115 125 135

# TA (°C)

134/143 DS5792 Rev 13
## STM32F103xC, STM32F103xD, STM32F103xE Ordering information

# 7 Ordering information

**Table 75. Ordering information scheme**

Example: STM32 F 103 R C T 6 xxx

## Device family

STM32 = Arm-based 32-bit microcontroller

## Product type

F = general-purpose

## Device subfamily

103 = performance line

## Pin count

R = 64 pins V = 100 pins Z = 144 pins

## Flash memory size

C = 256 Kbytes of Flash memory D = 384 Kbytes of Flash memory E = 512 Kbytes of Flash memory

## Package

H = BGA T = LQFP Y = WLCSP64

## Temperature range

6 = Industrial temperature range, –40 to 85 °C. 7 = Industrial temperature range, –40 to 105 °C.

## Options

xxx = programmed parts TR = tape and real

For a list of available options (speed, package, etc.) or for further information on any aspect of this device, please contact your nearest ST sales office.

## DS5792 Rev 13 135/143
# Revision history STM32F103xC, STM32F103xD, STM32F103xE

|8 Revision history||Table 76.Document revision history|
|---|---|---|
|Date|Revision|Changes|
|07-Apr-2008|1|Initial release.|
|22-May-2008|2|Document status promoted from Target Specification to Preliminary Data. Section 1: Introduction and Section 2.2: Full compatibility throughout the family modified. Small text changes. Note 2 added in Table 2: STM32F103xC, STM32F103xD and STM32F103xE features and peripheral counts on page 11. LQPF100/BGA100 column added to Table 6: FSMC pin definition on page 38. Values and Figures added to Maximum current consumption on page 62 (see Table 18, Table 19, Table 20 and Table 21 and see Figure 14, Figure 15, Figure 17, Figure 18 and Figure 19). Values added to Typical current consumption on page 73 (see Table 22, Table 23 and Table 24). Table 19: Typical current consumption in Standby mode removed. Note 4 and Note 1 added to Table 65: USB DC electrical characteristics and Table 66: USB: full-speed electrical characteristics on page 129, respectively. Table 65: USB DC electrical characteristics on VUSB added to page 129. Figure 68: Recommended footprint(1) on page 143 corrected. Equation 1 corrected. Figure 73: LQFP100 PD max vs. TA on page 149 modified. Tolerance values corrected in Table 74: LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm, 0.8 mm pitch, package data on page 139. DS5792 Rev 13|

136/143
# STM32F103xC, STM32F103xD, STM32F103xE Revision history

**Table 76.Document revision history**

## Date Revision Changes

Document status promoted from Preliminary Data to full datasheet. *FSMC (flexible static memory controller) on page 22* modified. Number of complementary channels corrected in *Figure 1:* *STM32F103xF, STM32F103xD and STM32F103xGSTM32F103xF and* *STM32F103xG performance line block diagram*. *Power supply supervisor on page 23* modified and VDDA added to

*Table 14: General operating conditions on page 59*.

Table notes revised in *Section 5: Electrical characteristics*. Capacitance modified in *Figure 12: Power supply scheme on page 57*.

*Table 60: SCL frequency (fPCLK1= 36 MHz.,VDD = 3.3 V)* updated.

*Table 61: SPI characteristics* modified, th(NSS)modified in *Figure 49:*

*SPI timing diagram-slave mode and CPHA = 0 on page 123*. Minimum SDA and SCL fall time value for Fast mode removed from 21-Jul-2008 3 *Table 59: I2C characteristics on page 120*, note 1 modified. IDD_VBAT values and some IDD values with regulator in run mode added to *Table 21: Typical and maximum current consumptions in Stop and* *Standby modes on page 68*.

*Table 34: Flash memory endurance and data retention on page 87*

updated. t su(NSS) modified in *Table 61: SPI characteristics on page 122*. EO corrected in *Table 70: ADC accuracy on page 132*. *Figure 58:* *Typical connection diagram using the ADC on page 133* and note below corrected. Typical TS_temp value removed from *Table 72: TS characteristics on* *page 137*. *Section 6.1: Package mechanical data on page 138* updated. Small text changes.

## DS5792 Rev 13 137/143
# Revision history STM32F103xC, STM32F103xD, STM32F103xE

**Table 76.Document revision history**

## Date Revision Changes

Timers specified *on page 1* (motor control capability mentioned). *Section 2.2: Full compatibility throughout the family* updated.

*Table 6: High-density timer feature comparison* added.

*General-purpose timers (TIMx)* and *Advanced-control timers (TIM1 and* *TIM8) on page 27* updated.

*Figure 1: STM32F103xF, STM32F103xD and*

*STM32F103xGSTM32F103xF and STM32F103xG performance line* *block diagram* modified. *Note 10* added, main function after reset and *Note 5 on page 44* updated in *Table 8: High-density STM32F103xx pin definitions*. *Note 2* modified below *Table 11: Voltage characteristics on page 58*, |DVDDx| min and |DVDDx| min removed. 12-Dec-2008 4 *Note 2* and PD values for LQFP144 and LFBGA144 packages added to

*Table 14: General operating conditions on page 59*.

Measurement conditions specified in *Section 5.3.5: Supply current* *characteristics on page 62*. Max values at TA = 85 °C and TA = 105 °C updated in *Table 21: Typical* *and maximum current consumptions in Stop and Standby modes on* *page 68*. *Section 5.3.10: FSMC characteristics on page 87* updated. Data added to *Table 50: EMI characteristics on page 111*. IVREF added to *Table 67: ADC characteristics on page 130*.

*Table 81: Package thermal characteristics on page 146* updated.

Small text changes.

## 138/143 DS5792 Rev 13
# STM32F103xC, STM32F103xD, STM32F103xE Revision history

**Table 76.Document revision history**

## Date Revision Changes

I/O information clarified *on page 1*. *Figure 4: STM32F103xC and* *STM32F103xE performance line BGA100 ballout* corrected. I/O information clarified *on page 1*. In *Table 5: High-density STM32F103xx pin definitions*: – I/O level of pins PF11, PF12, PF13, PF14, PF15, G0, G1 and G15 updated – PB4, PB13, PB14, PB15, PB3/TRACESWO moved from Default column to Remap column PG14 pin description modified in *Table 6: FSMC pin definition*.

*Figure 9: Memory map on page 54* modified.

Note modified in *Table 18: Maximum current consumption in Run* *mode, code with data processing running from Flash* and *Table 20:* *Maximum current consumption in Sleep mode, code running from Flash* *or RAM*.

*Figure 17*, *Figure 18* and *Figure 19* show typical curves (titles

changed).

*Table 25: High-speed external user clock characteristics* and *Table 26:*

*Low-speed external user clock characteristics* modified. ACCHSI max values modified in *Table 29: HSI oscillator characteristics*. FSMC configuration modified for *Asynchronous waveforms and* *timings*. Notes modified below *Figure 24: Asynchronous non-* *multiplexed SRAM/PSRAM/NOR read waveforms* and *Figure 25:* *Asynchronous non-multiplexed SRAM/PSRAM/NOR write waveforms*. 30-Mar-2009 5 t w(NADV) values modified in *Table 35: Asynchronous non-multiplexed* *SRAM/PSRAM/NOR read timings* and *Table 39: Asynchronous* *multiplexed PSRAM/NOR write timings*. th(Data_NWE) modified in

*Table 36: Asynchronous non-multiplexed SRAM/PSRAM/NOR write*

*timings* In *Table 41: Synchronous multiplexed PSRAM write timings* and

*Table 43: Synchronous non-multiplexed PSRAM write timings*:

–tv(Data-CLK) renamed as td(CLKL-Data) –td(CLKL-Data)min value removed and max value added –th(CLKL-DV) / th(CLKL-ADV)removed

*Figure 28: Synchronous multiplexed NOR/PSRAM read timings*,

*Figure 29: Synchronous multiplexed PSRAM write timings* and

*Figure 31: Synchronous non-multiplexed PSRAM write timings*

modified.

*Figure 52: I2S slave timing diagram (Philips protocol)(1)* and *Figure 53:*

*I2S master timing diagram (Philips protocol)(1)* modified. WLCSP64 package added (see *Figure 8: STM32F103xC and* *STM32F103xE performance line WLCSP64 ballout, ball side*, *Table 8:* *High-density STM32F103xx pin definitions*, *Figure 65: WLCSP, 64-ball*

*4.466 × 4.395 mm, 0.500 mm pitch, wafer-level chip-scale package* *outline* and *Table 76: WLCSP, 64-ball 4.466 × 4.395 mm, 0.500 mm* *pitch, wafer-level chip-scale package mechanical data*). Small text changes.
## DS5792 Rev 13 139/143
# Revision history STM32F103xC, STM32F103xD, STM32F103xE

|||Table 76.Document revision history|
|---|---|---|
|Date|Revision|Changes|
|21-Jul-2009|6|Figure 1: STM32F103xC, STM32F103xD and STM32F103xE performance line block diagram updated. Note 5 updated and Note 4 added in Table 5: High-density STM32F103xC/D/E pin definitions. added to Table 13: Embedded internal reference VRERINT and T Coeff voltage. Table 16: Maximum current consumption in Sleep mode, code running from Flash or RAM modified. min modified in Table 21: High-speed external user clock f HSE_ext characteristics. and C replaced by C in Table 23: HSE 4-16 MHz oscillator C L1 L2 characteristics and Table 24: LSE oscillator characteristics (f = LSE 32.768 kHz), notes modified and moved below the tables. Note 1 modified below Figure 29: Synchronous multiplexed PSRAM write timings. Table 25: HSI oscillator characteristics modified. Conditions removed from Table 27: Low-power mode wakeup timings. Jitter added to Table 28: PLL characteristics. Figure 47: Recommended NRST pin protection modified. In Table 31: Asynchronous non-multiplexed SRAM/PSRAM/NOR read and t modified. timings : t h(BL_NOE) h(A_NOE) In Table 32: Asynchronous non-multiplexed SRAM/PSRAM/NOR write and t modified. timings : t h(A_NWE) h(Data_NWE) In Table 33: Asynchronous multiplexed PSRAM/NOR read timings : and t modified. t h(AD_NADV) h(A_NOE) In Table 34: Asynchronous multiplexed PSRAM/NOR write timings : modified. t h(A_NWE) In Table 35: Synchronous multiplexed NOR/PSRAM read timings : modified. t h(CLKH-NWAITV) In Table 40: Switching characteristics for NAND Flash read and write modified. cycles : t h(NOE-D) 2 S Table 53: SPI characteristics modified. Values added to Table 54: I characteristics and Table 55: SD / MMC characteristics. Table 59: ADC characteristics. CADC and RAIN parameters modified in Table 60: RAIN max for f = 14 MHz. RAIN max values modified in ADC Table 71: DAC characteristics modified. Figure 61: 12-bit buffered /non- buffered DAC added. Figure 63: LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package outline and Table 75: LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package mechanical data updated.|
|24-Sep-2009|7|Number of DACs corrected in Table 3: STM32F103xx family. Table 17: Typical and maximum current IDD_VBAT updated in consumptions in Stop and Standby modes. with RTC on vs. Figure 16: Typical current consumption on V BAT temperature at different VBAT values added. IEC 1000 standard updated to IEC 61000 and SAE J1752/3 updated to IEC 61967-2 in Section 5.3.11: EMC characteristics on page 86. Table 63: DAC characteristics modified. Small text changes. DS5792 Rev 13|

140/143
## STM32F103xC, STM32F103xD, STM32F103xE Revision history

|||Table 76.Document revision history|
|---|---|---|
|Date|Revision|Changes|
|19-Apr-2011|8|Updated package choice for 103Rx in Table 2 Updated footnotes below Table 7: Voltage characteristics on page 43 and Table 8: Current characteristics on page 43 Updated tw min in Table 21: High-speed external user clock characteristics on page 58 = Updated startup time in Table 24: LSE oscillator characteristics (f LSE 32.768 kHz) on page 61 2 C characteristics on page 96 Updated note 2 in Table 51: I 2 C bus AC waveforms and measurement circuit Updated Figure 48: I Updated Figure 47: Recommended NRST pin protection Updated Section 5.3.14: I/O port characteristics Updated Table 35: Synchronous multiplexed NOR/PSRAM read timings on page 72 Updated FSMC Figure 26 thru Figure 31 Updated Figure 41.: NAND controller waveforms for common memory 2 C bus AC waveforms and measurement write access and Figure 48.: I circuit Added Section 5.3.13: I/O current injection characteristics Updated Figure 67 and added Table 69: WLCSP, 64-ball 4.466 × 4.395 mm, 0.500 mm pitch, wafer-level chip-scale package mechanical data on page 120 LQFP64 package mechanical data updated: see Figure 73.: LQFP64 – 10 x 10 mm 64 pin low-profile quad flat package outline and Table 73: LQFP64 – 10 x 10 mm 64 pin low-profile quad flat package mechanical data on page 129.|
|30-Sept-2014|9|Added Note 7 in Table 5: High-density STM32F103xC/D/E pin definitions on page 31. Updated Note 10 in Table 5: High-density STM32F103xC/D/E pin definitions on page 31. Modified Note 2 in Table 62: ADC accuracy on page 108 Modified Note 3 in Table 62: ADC accuracy on page 108 2 C characteristics on page 96 Modified notes in Table 51: I (1) on page 100 Updated Figure 51: SPI timing diagram-master mode|
|23-Feb-2015|10|Updated Figure 66.: BGA pad footprint, Figure 70: LQFP144 - 144-pin, 20 x 20 mm low-profile quad flat package outline, Figure 73.: LQFP100 – 14 x 14 mm 100 pin low-profile quad flat package outline, Figure 74.: LQFP100 recommended footprint, Figure 76.: LQFP64 – 10 x 10 mm 64 pin low-profile quad flat package outline, Figure 77.: LQFP64 - 64- pin, 10 x 10 mm low-profile quad flat recommended footprint Added Figure 72.: LQFP144 marking example (package top view), Figure 75.: LQFP100 marking example (package top view), Figure 78.: LQFP64 marking example (package top view) Updated Table 72: LQPF100 – 14 x 14 mm 100-pin low-profile quad flat package mechanical data, Table 73: LQFP64 – 10 x 10 mm 64 pin low- profile quad flat package mechanical data DS5792 Rev 13 141/143|
# Revision history STM32F103xC, STM32F103xD, STM32F103xE

|||Table 76.Document revision history|
|---|---|---|
|Date|Revision|Changes|
|31-08-2015|11|Replaced USBDP and USBDM by USB_DP and USB_DM in the whole document. Updated: – Introduction – Reference standard in Table 43: ESD absolute maximum ratings. Table 63: DAC characteristics. – Updated IDDA description in – Section : I2C interface characteristics – Figure 62: LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm, 0.8 mm pitch, package outline – Updated sentence before Figure 78: LQFP64 marking example (package top view). – Figure 65: LFBGA100 - 10 x 10 mm low profile fine pitch ball grid array package outline and sentence before Figure 75: LQFP100 marking example (package top view) – Figure 68: WLCSP, 64-ball 4.466 × 4.395 mm, 0.500 mm pitch, wafer-level chip-scale package outline 2 C bus AC waveforms and measurement circuit on – Figure 48: I page 97 – Section 6.1: LFBGA144 package information and Section 6.2: LFBGA100 package information. – Table 20: Peripheral current consumption Added: – Figure 63: LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm, 0.8 mm pitch, package recommended footprint – Figure 64: LFBGA144 marking example (package top view) – Figure 66: LFBGA100 – 100-ball low profile fine pitch ball grid array, 10 x 10 mm, 0.8 mm pitch, package recommended footprintoutline – Figure 69: WLCSP64 - 64-ball, 4.4757 x 4.4049 mm, 0.5 mm pitch wafer level chip scale package recommended footprint – Table 66: LFBGA144 recommended PCB design rules (0.8 mm pitch BGA) – Table 68: LFBGA100 recommended PCB design rules (0.8 mm pitch BGA) – Table 70: WLCSP64 recommended PCB design rules (0.5 mm pitch).|
|26-Nov-2015|12|Updated: – Table 59: ADC characteristics – Table 65: LFBGA144 – 144-ball low profile fine pitch ball grid array, 10 x 10 mm, 0.8 mm pitch, package mechanical data – Table 66: LFBGA144 recommended PCB design rules (0.8 mm pitch BGA) Added: – Note 3 on Table 7: Voltage characteristics|
|10-Jul-2018|13|Updated: – Table 2: STM32F103xC, STM32F103xD and STM32F103xE features and peripheral counts – Section 7: Ordering information DS5792 Rev 13|

142/143
# <u>STM32F103xC, STM32F103xD, STM32F103xE</u>

**IMPORTANT NOTICE – PLEASE READ CAREFULLY** STMicroelectronics NV and its subsidiaries (“ST”) reserve the right to make changes, corrections, enhancements, modifications, and improvements to ST products and/or to this document at any time without notice. Purchasers should obtain the latest relevant information on ST products before placing orders. ST products are sold pursuant to ST’s terms and conditions of sale in place at the time of order acknowledgement. Purchasers are solely responsible for the choice, selection, and use of ST products and ST assumes no liability for application assistance or the design of Purchasers’ products. No license, express or implied, to any intellectual property right is granted by ST herein. Resale of ST products with provisions different from the information set forth herein shall void any warranty granted by ST for such product. ST and the ST logo are trademarks of ST. All other product or service names are the property of their respective owners. Information in this document supersedes and replaces information previously supplied in any prior versions of this document. © 2018 STMicroelectronics – All rights reserved

## <u>DS5792 Rev 13 143/143</u>