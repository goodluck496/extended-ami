
## Instalation
````bash
$ npm i extended-ami
````
## NodeJS versions 

support `>=6.13.1`

## Asterisk version

support without types `>=1.8`

support with types `>=12`

## Usage
````typescript

new eAmi( {
	host: 'host',
	port: 5038,
	userName: 'manager-login',
	password: 'manager-password',
	additionalOption: {
		eventsByActionID: true,
		excludeEvents: [ 'Newexten', 'NewCallerid', 'RTCPSent'],
		debug: false,
	}

} ).connect().then( (ami: eAmi) => {

	let actionID = new Date().getTime();
    
	ami.events.on("disconnect", () => {
		//ami disconnected...
	})
	
	ami.events.on("events", (data) => {
		//emit all events...
	})
	
    ami.events.on("Action_"+actionID, (data) => {
        console.log("Status[action] - action_%s ...", actionID, data);
    });

    ami.events.on("response_status", (data: I_Status) => {
        console.log("Status[action] - response_status...", data);
    });

    ami.events.on(AMI_EVENTS.STATUS, (data: I_Status) => {
        console.log("Status[event]...", data);
    });

    let actionOne = ami.action<I_ActionStatus>({
            Action: "Status",
            Channel: "SIP/aster-943903",
            ActionID: "response_status"
        }),
        actionTwo = ami.action<I_ActionStatus>({
            Action: "Status",
            Channel: "SIP/aster-943903111",
            ActionID: actionID
        })
        
});

````
