
## Instalation
````bash
$ npm i extended-ami
````
## NodeJS versions 

support ` >= 6.13.1`

## Asterisk version

support without types ` >= 1.8`

support with types ` >= 12`

## Docs & internal details

### Events

* `connect` - emits when client was connected;
* `disconnect` -  emits when client was disconnected;
* `events` - emits when was received a new event of Asterisk;
* `response` -  emits when was received a new response of Asterisk;
* `reconnected` -  emits when client tries reconnect to Asterisk;
* `${eventName}` - emits when was received event with name `eventName` of Asterisk.
* `${Action_ActionID}` - emits when was received response with `ActionID` of Asterisk.

### Methods 

* `.connect(options)` - connect to Asterisk.
* `.action<type>(options_by_type)` - send new action to Asterisk;
* `.getRequest(actionID)` - receive an item from the queue sent by an asterisk;
* `.removeRequest(actionID)` - remove an item from the queue sent by asterisk;

### Properties
 
Getters

* `isLoggedIn` - connection and authorization status in asterisk; 
* `lastConnectTime` - timestamp of the last connection to asterisk;
* `actions` -  declared actions with asterisk;
* `queueRequest` -  the queue of sent asterisk messages (cleared after sending the message);
* `events` -  events sent by asterisk and eAmi;
* `excludeEvents` - excluded from event processing. on them you can`t subscribe with the help of eAmi.events.on (...);

Additional options

* `debug: boolean` - output of responses to the console (the default is false);
* `reconnect: boolean` -  reconnect to asterisk after losing connection or because of a large timeout (the default is true); 
* `maxReconnectCount: number` - the maximum number of such reconnections (the default is 10);
* `heartbeatInterval: number` - connection testing frequency (ping command) in seconds (the default is 1 second);
* `timeOutToDefibrillation: number` - after how many seconds after losing the connection, try to restore it (the default is 5 second);
* `resendAction: boolean` - resend a message for an asterisk if the message is not sent (the default is false);
* `timeOutSend: number` - how many seconds to wait for an asterisk (the default is 3 second);
* `excludeEvents: string[]` -  exclude some events from the processing (convenient for debugging, the default is empty array);
* `emitAllEvents: boolean` - `events` event contains the original asterisk replies. But if events are present in `excludeEvents` then they will be omitted (the default is false);


### Connect options

* `host: string` - address of the server asterisk;
* `port: number` - port of the server asterisk (set null for default - 5038); 
* `userName: string` - user name of the manager;
* `password: string` -  manager password;

## Usage
````typescript

import {eAmi, eAmiActions} from "extended-ami";

new eAmi( {
	host: 'localhost',
	port: 5038,
	userName: 'manager-name',
	password: 'manager-password',
	additionalOptions: {
		debug: true,
	},

} ).connect().then( ( eAmi: eAmi ) => {

	let actionID = new Date().getTime();

	eAmi.events.on( "disconnect", () => {
		//ami disconnected...
	} );

	eAmi.events.on( "events", ( data ) => {
		//emit all events...
	} );

	let actions = new eAmiActions( eAmi );
	// OR eAmi.actions.{some-action}

	// setInterval(() => {
	//
	// 	actions.QueueSummary({
	// 		Queue: "callcenter_q",
	// 	}).then(data => console.log(data))
	//
	// 	console.log('eAmi.queueRequest.length',eAmi.queueRequest.length)
	//
	// }, 1000)


	/*actions.CoreShowChannels({}).then(data => console.log(data))
	[
		{
			Event: 'CoreShowChannel',
			ActionID: 'undefined',
			Channel: 'Message/ast_msg_queue',
			ChannelState: 6,
			ChannelStateDesc: 'Up',
			CallerIDNum: null,
			CallerIDName: null,
			ConnectedLineNum: null,
			ConnectedLineName: null,
			Language: 'en',
			AccountCode: 0,
			Context: 'callcenter',
			Exten: 1877,
			Priority: 4,
			Uniqueid: 1523859314.158187,
			Linkedid: 1523859314.158187,
			Application: 'Hangup',
			ApplicationData: 0,
			Duration: '1415:01:21',
			BridgeId: 0,
			Request: { Action: 'CoreShowChannels' }
		}
    ]

	* */

	/*actions.BridgeList({}).then(async (data: I_BridgeListItem[]) => {

		if(data.length < 1) return;

		let info =  actions.BridgeInfo({BridgeUniqueid: data[0].BridgeUniqueid}).then(info => console.log(info));

		/*
		{ Event: 'BridgeInfoChannel',
		  ActionID: '1528949912884',
		  Channel: 'SIP/mtt-out-000476d1',
		  ChannelState: 6,
		  ChannelStateDesc: 'Up',
		  CallerIDNum: 892*****971,
		  CallerIDName: null,
		  ConnectedLineNum: null,
		  ConnectedLineName: null,
		  Language: 'ru',
		  AccountCode: 0,
		  Context: 'menuivr',
		  Exten: null,
		  Priority: 8,
		  Uniqueid: 1528949412.600756,
		  Linkedid: 1528949412.600756,
		  Request:
		   { BridgeUniqueid: 'e0d47319-337f-4355-bdff-3a2dc7e7c314',
			 Action: 'BridgeInfo',
			 ActionID: 1528949912884 }
		 }
		{ Event: 'BridgeInfoChannel',
		  ActionID: '1528949912884',
		  Channel: 'SIP/103-000476d2',
		  ChannelState: 6,
		  ChannelStateDesc: 'Up',
		  CallerIDNum: null,
		  CallerIDName: null,
		  ConnectedLineNum: 892*****971,
		  ConnectedLineName: null,
		  Language: 'ru',
		  AccountCode: 0,
		  Context: 'callcenter',
		  Exten: null,
		  Priority: 1,
		  Uniqueid: 1528949435.600757,
		  Linkedid: 1528949412.600756,
		  Request:
		   { BridgeUniqueid: 'e0d47319-337f-4355-bdff-3a2dc7e7c314',
			 Action: 'BridgeInfo',
			 ActionID: 1528949912884 }
		 }

		*

	})*/

	//actions.Hangup({ Channel: 'SIP/110-00046ec1' }).then(data => console.log(data)).catch(error => console.log(error))

	//actions.Login({Username: "manager", Secret: "manager-password"})

	//actions.Logout()

	//actions.Ping().then(data => console.log(data)) // true

	/*
	actions.QueueSummary({
		Queue: "queue",
	}).then(data => console.log(data))

	{
		Event: 'QueueSummary',
		Queue: 'queue',
		LoggedIn: 6,
		Available: 2,
		Callers: 0,
		HoldTime: 23,
		TalkTime: 200,
		LongestHoldTime: 0,
		ActionID: 'undefined',
		Request: { Queue: 'queue', Action: 'QueueSummary' }
  	}

	 */


	/*actions.Originate({
		ActionID: actionID,
		Channel: "SIP/110",
		CallerID: 1877,
		Exten: "1877",
		Timeout: 2000,
		Priority: 1,
		Context: "callcenter"
	}).then(data => console.log(data)).catch((error) => console.log(error));*/

} ).catch(error => console.log("Error connection..."));

````


