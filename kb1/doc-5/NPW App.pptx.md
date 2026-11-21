**NPW**

## **Agenda**

1

2

**Home Page**

**NPW Dashboard**

3

**Analysis Page**

- NPW Table

- Variable Chart

- NPW Info

- Filters

- Temporal Traces

- Validation

- Dataset Reference

- Variable Table

## **Home Page**

- 1: Req*1: The TPM shall be able to access to NPW processed through FAST application (suggested name: NPW validation)

**Excel Rows**

**#TicketID**

1

## **NPW Dashboard**

**#TicketID**

2

## **Filters – NPW Dashboard**

**Excel Rows**

**#TicketID**

2

- 2: Req *2: The TPM shall be able to select equipment name (within automatically Fab & Workarea select)
- 3: Req *3: The TPM shall be able to select Module name
- 4: Req *4: User profile shall be linked to a dedicated Fab & Workarea
- 5: Req *4:1 Manager shall be able to check all equipment in a workarea in order to check all "support request" status (orange)
- 6: Req *5_2: The TPM shall be able to select date to load in the table the last 24 Hours
- 7: Req *6 : For a selected equipment & Module, all NPW processed in the same date shall be displayed

## **NPW Table – NPW Dashboard**

**Excel Rows**

**#TicketID**

2

- 9: Req *8: Event start, product, recipe, strategy, material, Context ID, Temporal Traces, Validation TPM, Validator shall be the column name of the table
- 11-12: Req \*10: **\[Event start]** column shall correspond to the time of the NPW material processed. Req * \[Event start] shall be displayed according to ISO 8601
- 16-17: Req \*15.2: **\[Product]** column shall displayed the product of the NPW processed. Req *15_2: For a given \[Product], \[+] button shall be displayed in order to show from newest to oldest each NPW MaterialID processed with the same Strategy/recipe/product including previous PM
- 18: Req \*16: **\[Recipe]** column shall displayed the recipe of the NPW processed
- 19: Req \*17: **\[Strategy]** column shall displayed the strategy of the NPW processed
- 20: Req \*18: **\[Material]** column shall displayed the material of the NPW processed
- 21: Req \*19: **\[Context ID]** column shall displayed the context ID of the NPW processed
- 22-23-24: Req \*20: **\[Temporal traces]** column shall be displayed in order to access to temporal traces of the variables. Req *21: \[Temporal traces] column shall displayed a button/link to check temporal trace of the NPW material ID in the same line. Req *22: When button/link is selected in \[Temporal Traces] Column, the button/link shall open a new page to display the temporal traces of the NPW materialID in the same line
- 25-26-27-28-29: Req 23: **\[Validation TPM]** column shall be displayed to give a status of the NPW materialID processed. Req23.1: Filter shall be available for \[Validation TPM] column in order to see only red status, orange status or green status. Req \*24: \[Validation TPM] column shall read the information in detail temporal traces. Req \*25_2: \[Validation TPM] column shall displayed only the following status: "*OK*", "*NotOK*", "*Support Request*"
- 30: Req \*26: **\[Validator]** Column shall be displayed in order to show the validator of the NPW processed

**Format ISO 8601**

## **NPW Table – NPW Dashboard**

**Excel Rows**

**#TicketID**

2

- 10: Req *9: Each line of the table shall be related to 1 NPW with a related strategy/recipe/product
- 13: Req *12: NPW shall be displayed from newest to oldest thanks to event start column
- 14: Req *13: Each NPW materialID with the same strategy/recipe/product shall be grouped
- 15: Req *14: If there is several NPW with the same strategy/Recipe/product, only the newest NPW should be display.

## **Analysis Page**

**#TicketID**

3

## **NPW Info – Analysis Page**

**Excel Rows**

**#TicketID**

3

- 31-32: Req \*28: **\[Date and time]** column Shall be displayed in this page. Req *29: \[Date and time] column shall read the information from the Summary table \[Event Start] that belong to the line of the link/button pressed
- 33-34: Req \*30: **\[Product]** column shall be displayed. Req *31: \[Product] column shall read the information from the Summary table \[Product] that belong to the line of the link/button pressed
- 35-36: Req \*32: **\[Recipe]** column shall be displayed. Req *33: \[Recipe] column shall read the infromation from the Summary Table \[Recipe] that belong to the line of the link/button pressed
- 37-38: Req \*34: **\[Strategy]** column shall be displayed. Req *35: \[Strategy] column shall read the information from the summary Table \[Strategy] that belong to the line of the link/button pressed
- 39-40: Req \*36: **\[Material]** column shall be displayed. Req *37: \[Material] column shall read the information from the summary Table \[Material] that belong to the line of the link/button pressed

## **Variable Table – Analysis Page**

**Excel Rows**

**#TicketID**

3

- 47: Req *43: A variable table should be displayed in the page to show all variables linked to a NPW Material ID
- 48: Req *44: Variables shall be displayed according to the highest to lowest average out of envelop % \[OOE%]
- 49-59: Req \*45: **\[Var. Name]** column shall display all Variables name linked to the NPW Material ID selected. Req *52: The TPM shall be able to click on \[Var. Name] data in order to show corresponding temporal trace of the selected variable
- 50-51: Req \*46: **\[Criticality]** column shall display Criticality of the Variable. Req \*47: \[Criticality] column shall display only the following status: "*C1*", "*C2*", "*C3*", "*C4*", "*undefined*"
- 52-53-54: Req \*48: **\[OOE%]** column shall display out of envelop average of the variable compared to the reference population (in %). Req *49: Red color shall be displayed when \[OOE%] data is above 20%. Req *50: Green color shall be displayed when \[OOE%] data is below 20%
- 55-56-57: Req \*51: **\[OOE% Worst Step]** shall display worst step out of envelop of the variable compared to the reference population (in %). Req *49.1: Red color shall be displayed when \[OOE% Worst Step] data is above 20%. Req *50.1: Green color shall be displayed when \[OOE% Worst Step] data is below 20%
- 58: Req \*52.1: **\[Comments]** table shall be displayed to let TPM enter comments

Show temporal traces on click

## **Variable Chart – Analysis Page**

**Excel Rows**

**#TicketID**

3

- 41: Req *38: Circle shart shall be displayed to show proportion of variable good/bad without justification / bad with justification
- 42: Req *38.1: A good variable shall be a variable below the out of envelop rate threshold
- 43: Req *39: The out of envelop rate threshold shall be 20%
- 44: Req *40: A bad without justification variable shall be a variable above the out of envelop rate threshold and without comments in the corresponding variable table in the page \[Comments]
- 45: Req *41: A bad with justification variable shall be a variable above the out of envelop rate threshold and with comments in the corresponding variable table in the page \[Comments]
- 46: Req *42: The total number of variables shall be displayed in the middle of the Pie chart

## **Temporal Traces – Analysis Page**

**Excel Rows**

**#TicketID**

3

- 60: Req *53: Temporal traces of a selected Variable in \[Var. Name] shall be displayed
- 61: Req *54: Temporal traces shall display each STEP ID with the proportion of OOE% by step
- 62: Req *55: Temporal traces shall be delimited by step ID
- 63: Req \*56: **Envelop** of the reference population shall be displayed in Temporal Traces (blue color)
- 64: Req \*57: **Reference trace** shall be displayed in Temporal traces (green color)
- 65: Req \*58: **Out of envelop** shall be displayed in Temporal traces (pink color)
- 66: Req \*59: **Unqualified traces** shall be displayed in Temporal traces (black color)
- 67: Req \*60: **Qualified traces** shall be displayed in Temporal traces (yellow color)

## **Dataset Reference – Analysis Page**

**Excel Rows**

**#TicketID**

3

- 68: Req *61: Reference of the dataset shall be displayed in the page
- 69: Req \*62: **Active version** of the Reference dataset shall be displayed in the page
- 70: Req \*62.1: **Number of context** of the Reference dataset shall be displayed in the page
- 71: Req \*63: **Last update** of the Reference Dataset shall be displayed in the page
- 72: Req \*64: **Envelope Timeframe** of the Reference Dataset shall be displayed in the page

## **Validation – Analysis Page**

**Excel Rows**

**#TicketID**

3

- 73: Req *65: TPM shall be able to provide a validation of the NPW selected
- 74: Req *65.1: If there is no variables with OOE% > 20 %, NPW shall be automatically set to status : OK
- 75: Req *66_2: TPM shall be able to select : OK, NOK, Support Request
- 76: Req *67: OK button shall be displayed in Green
- 77: Req *68: NOK button shall be displayed in red
- 78: Req *69: Support request shall be displayed in Yellow