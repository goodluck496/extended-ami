import { connectionOptions } from "./interfaces/configure.interface";
import {
	I_ActionBridgeInfo,
	I_ActionBridgeList,
	I_ActionCoreShowChannels,
	I_ActionHangup,
	I_ActionLogin,
	I_ActionOriginate,
	I_ActionQueueAdd,
	I_ActionQueuePause,
	I_ActionQueuePenalty,
	I_ActionQueueRemove,
	I_ActionQueueStatus,
	I_ActionQueueSummary,
	I_ActionStatus,
	I_Request,
	I_Response,
} from "./interfaces/actions.interface";
import { Socket } from "net";
import { EventEmitter } from "events";
import { I_BridgeInfoChannel, I_BridgeListItem } from "./interfaces/bridge.interface";
import { I_CoreShowChannel } from "./interfaces/core-interface";
import { I_DualHangup } from "./interfaces/hangup.interface";
import {
	I_QueueMember,
	I_QueueMemberAdded,
	I_QueueMemberPause,
	I_QueueMemberPenalty,
	I_QueueMemberRemoved,
	I_QueueSummary,
} from "./interfaces/queue";
import { I_Status } from "./interfaces/status.interface";

declare namespace extended_ami {


	/**
	 * Configure option interfaces
	 *
	 */
	export interface IeAmiOptions {
		host: string
		port: number
		userName: string
		password: string

		additionalOptions?: IAddinionalOptions
	}
	export interface IAddinionalOptions {

		//Output messages to the console
		debug?: boolean
		//Delay before resending a command (in seconds)
		timeOutSend?: number
		//resend message on after timeout
		resendAction?: boolean
		//reconnect after timeout defibrillation
		reconnect?: boolean
		maxReconnectCount?: number
		emitAllEvents?: boolean
		// in seconds
		timeOutToDefibrillation?: number

		//ping command frequency
		heartbeatInterval?: number

		//list of excluded events
		excludeEvents?: string[]
	}


	/**
	 * Asterisk manager actions
	 *
	 */
	export interface I_Response {
		Event?: string
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		Request?: I_Request

		[p:string]: any
	}
	export interface I_Request {
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		Action?: string
		//Timestamp of start request
		TimeStart?: number
		Completed?: boolean

		[field: string]: any
	}

	//Bridge two channels already in the PBX
	export interface I_ActionBridge {
		Action?: "Bridge"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		// Channel to Bridge to Channel2.
		Channel1: string
		// Channel to Bridge to Channel1.
		Channel2: string
		//Play courtesy tone to Channel 2.
		Tone: "no" | "Channel1" | "Channel2" | "Both"
	}

	//Destroy a bridge.
	//Deletes the bridge, causing channels to continue or hang up.
	export interface I_ActionBridgeDestroy {
		Action: "BridgeDestroy"
		ActionID: number | string
		//The unique ID of the bridge to destroy.
		BridgeUniqueid: string
	}

	//Get information about a bridge
	export interface I_ActionBridgeInfo {
		Action?: "BridgeInfo"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The unique ID of the bridge about which to retrieve information.
		BridgeUniqueid: string
	}

	//Kick a channel from a bridge.
	export interface I_ActionBridgeKick {
		Action?: "BridgeKick"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		BridgeUniqueid?: string
		Channel: string
	}

	//Get a list of bridges in the system
	export interface I_ActionBridgeList {
		Action?: "BridgeList"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//Optional type for filtering the resulting list of bridges.
		BridgeType?: string
	}

	//List currently active channels.
	//List currently defined channels and some information about them.
	export interface I_ActionCoreShowChannels {
		Action?: "CoreShowChannels"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
	}

	//Hangup channel.
	export interface I_ActionHangup {
		Action?: "Hangup"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The exact channel name to be hungup, or to use a regular expression, set this parameter to: /regex/
		Channel: string
		Cause?: string
	}

	//Login Manager
	export interface I_ActionLogin {
		Action?: "Login"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//Username to login with as specified in manager.conf.
		Username: string
		// Secret to login with as specified in manager.conf.
		Secret: string
	}

	//Logoff the current manager session.
	export interface I_ActionLogout {
		Action?: "Logoff"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
	}

	//Generates an outgoing call to a Extension/Context/Priority or Application/Data
	export interface I_ActionOriginate {
		Action?: "Originate"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//Channel name to call
		Channel: string
		//Extension to use (requires Context and Priority)
		Exten: string
		//Context to use (requires Exten and Priority)
		Context: string
		//Priority to use (requires Exten and Context)
		Priority?: number
		//Application to execute.
		Application?: string
		//Data to use (requires Application).
		Data?: string
		//How long to wait for call to be answered (in ms.).
		Timeout: number
		//Caller ID to be set on the outgoing channel.
		CallerID?: number
		//Channel variable to set, multiple Variable: headers are allowed.
		Variable?: string
		Account?: string
		// Set to true to force call bridge on early media..
		EarlyMedia?: boolean
		//Set to true for fast origination.
		Async?: boolean
		//Comma-separated list of codecs to use for this call.
		Codecs?: string
		//Channel UniqueId to be set on the channel.
		ChannelId?: string
		//Channel UniqueId to be set on the second local channel.
		OtherChannelId?: string
	}

	export interface I_ActionPing {
		Action?: "Ping"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
	}


	//Check the status of one or more queues.
	export interface I_ActionQueueStatus {
		Action?: "QueueStatus"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//Limit the response to the status of the specified queue.
		Queue: string
		//Limit the response to the status of the specified member.
		Member?: string
	}

	//Request the manager to send a QueueSummary event.
	export interface I_ActionQueueSummary {
		Action?: "QueueSummary"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//Queue for which the summary is requested.
		Queue: string
	}

	//Add interface to queue.
	export interface I_ActionQueueAdd {
		Action?: "QueueAdd"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		Queue: string
		//The name of the interface (tech/name) to add to the queue.
		Interface: string
		//A penalty (number) to apply to this member. Asterisk will distribute calls to members with higher penalties
		// only after attempting to distribute calls to those with lower penalty.
		Panalty: number
		//To pause or not the member initially (true/false or 1/0).
		Paused: boolean
		//Text alias for the interface.
		MemberName: string
		StateInterface: string
	}

	//Remove interface from queue.
	export interface I_ActionQueueRemove {
		Action?: "QueueRemove"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The name of the queue to take action on.
		Queue: string
		//The interface (tech/name) to remove from queue.
		Interface: string
	}

	// Set the penalty for a queue member.
	// Change the penalty of a queue member
	export interface I_ActionQueuePenalty {
		Action?: "QueuePenalty"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The interface (tech/name) of the member whose penalty to change.
		Interface: string
		//The new penalty (number) for the member. Must be nonnegative.
		Penalty: number
		//If specified, only set the penalty for the member of this queue.
		// Otherwise, set the penalty for the member in all queues to which the member belongs.
		Queue: string

	}


	//Show queues information.
	export interface I_ActionQueues {
		Action?: "Queues"
	}

	//Makes a queue member temporarily unavailable.
	//Pause or unpause a member in a queue.
	export interface I_ActionQueuePause {
		Action?: "QueuePause"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The name of the interface (tech/name) to pause or unpause.
		Interface: string
		//Pause or unpause the interface. Set to 'true' to pause the member or 'false' to unpause.
		Paused: boolean
		//The name of the queue in which to pause or unpause this member.
		// If not specified, the member will be paused or unpaused in all the queues it is a member of.
		Queue: string
		//Text description, returned in the event QueueMemberPaused.
		Reason?: string
	}

	//List SIP peers (text format).
	//Lists SIP peers in text format with details on current status.
	// Peerlist will follow as separate events, followed by a final event called PeerlistComplete.
	export interface I_ActionSIPpeers {
		Action?: "SIPpeers"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
	}

	//Show the status of one or all of the sip peers.
	//Retrieves the status of one or all of the sip peers. If no peer name is specified, status for all of the sip peers will be retrieved.
	export interface I_ActonSIPpeerstatus {
		Action?: "SIPpeerstatus"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The peer name you want to check.
		Peer?: string
	}

	//show SIP peer (text format).
	//Show one SIP peer with details on current status.
	export interface I_ActionSIPshowpeer {
		Action?: "SIPpeerstatus"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The peer name you want to check.
		Peer?: string
	}

	//Show SIP registrations (text format).
	//Lists all registration requests and status. Registrations will follow as separate events
	// followed by a final event called RegistrationsComplete.
	export interface I_ActionSIPshowregistry {
		Action?: "SIPshowregistry"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
	}

	//List channel status.
	//Will return the status information of each channel along with the value for the specified channel variables.
	export interface I_ActionStatus {
		Action?: "Status"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//The name of the channel to query for status.
		Channel: string
		//Comma , separated list of variable to include.
		Variables?: string
		//If set to "true", the Status event will include all channel variables for the requested channel(s).
		AllVariables?: boolean
	}

	//Send an arbitrary event.
	//Send an event to manager sessions.
	export interface I_ActionUserEvent {
		Action?: "UserEvent"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		// Event string to send.
		UserEvent: string
		//Contents
		Header1: string
		[HeaderN: string]: any
	}

	//Wait for an event to occur.
	//This action will ellicit a Success response. Whenever a manager event is queued.
	// Once WaitEvent has been called on an HTTP manager session, events will be generated and queued.
	export interface I_ActionWaitEvent {
		Action?: "waitEvent"
		//ActionID for this transaction. Will be returned.
		ActionID?: number | string
		//Maximum time (in seconds) to wait for events, -1 means forever.
		Timeout: number
	}


	/**
	 * Bridge event interfaces
	 *
	 */
	export interface I_BridgeEnter {
		Event: string                   //'BridgeEnter',
		Privilege: string               //'call,all',
		BridgeUniqueid: string          //'009e8c7a-7204-466b-bc08-83ed629669d6',
		//The type of bridge
		BridgeType: string              //'basic',
		//Technology in use by the bridge
		BridgeTechnology: string        //'simple_bridge',
		//Entity that created the bridge if applicable
		BridgeCreator: string           //null,
		//Name used to refer to the bridge by its BridgeCreator if applicable
		BridgeName: string              //null,
		// Number of channels in the bridge
		BridgeNumChannels: number       //1,                  2
		//The video source mode for the bridge.
		BridgeVideoSourceMode: "talker" | "single" | string   //'none',
		//If there is a video source for the bridge, the unique ID of the channel that is the video source.
		BridgeVideoSource: string
		Channel: string                 //'SIP/107-00042237',   SIP/mtt-out-00042236
		//A numeric code for the channel's current state, related to ChannelStateDesc
		ChannelState: number            //6,
		ChannelStateDesc: "Down" |
			"Rsrvd" |
			"offHook" |
			"Diealing" |
			"Ring" |
			"Ringing" |
			"Up" |
			"Busy" |
			"Dialing Offhook" |
			"Pre-ring" |
			"Unknown" |
			string        //'Up',
		CallerIDNum: number             //null,          89******353
		CallerIDName: string            //null,
		ConnectedLineNum: number        //89*******53,        null
		ConnectedLineName: string       //null,
		Language: string                //'ru',
		AccountCode: string             //'',
		Context: string                 //'callcenter',         menuivr
		Exten: string                   // null,
		Priority: number                // 1,                  8
		Uniqueid: number                //'1527245698.556770',  1527245675.556769
		//Uniqueid of the oldest channel associated with this channel.
		Linkedid: number                //'1527245675.556769'   1527245675.556769
		SwapUniqueid: number
	}

	export interface I_BridgeCreate {
		Event: string
		BridgeUniqueid: string
		BridgeType: string
		BridgeTechnology: string
		// Entity that created the bridge if applicable
		BridgeCreator: string
		//Name used to refer to the bridge by its BridgeCreator if applicable
		BridgeName: string
		BridgeNumChannels: number
		//The video source mode for the bridge.
		BridgeVideoSourceMode: "talker" | "single" | string   //'none',
		//If there is a video source for the bridge, the unique ID of the channel that is the video source.
		BridgeVideoSource: string
	}

	export interface I_BridgeLeave {
		Event: string                   //'BridgeLeave',
		Privilege: string               //'call,all',
		BridgeUniqueid: string          //'009e8c7a-7204-466b-bc08-83ed629669d6',
		//The type of bridge
		BridgeType: string              //'basic',
		//Technology in use by the bridge
		BridgeTechnology: string        //'simple_bridge',
		//Entity that created the bridge if applicable
		BridgeCreator: string           //null,
		//Name used to refer to the bridge by its BridgeCreator if applicable
		BridgeName: string              //null,
		// Number of channels in the bridge
		BridgeNumChannels: number       //1,                  2
		//The video source mode for the bridge.
		BridgeVideoSourceMode: "talker" | "single" | string   //'none',
		//If there is a video source for the bridge, the unique ID of the channel that is the video source.
		BridgeVideoSource: string
		Channel: string                 //'SIP/107-00042237',   SIP/mtt-out-00042236
		//A numeric code for the channel's current state, related to ChannelStateDesc
		ChannelState: number            //6,
		ChannelStateDesc: "Down" |
			"Rsrvd" |
			"offHook" |
			"Diealing" |
			"Ring" |
			"Ringing" |
			"Up" |
			"Busy" |
			"Dialing Offhook" |
			"Pre-ring" |
			"Unknown" |
			string        //'Up',
		CallerIDNum: number             //null,          891******53
		CallerIDName: string            //null,
		ConnectedLineNum: number        //89******53,        null
		ConnectedLineName: string       //null,
		Language: string                //'ru',
		AccountCode: string             //'',
		Context: string                 //'callcenter',         menuivr
		Exten: string                   // null,
		Priority: number                // 1,                  8
		Uniqueid: number                //'1527245698.556770',  1527245675.556769
		//Uniqueid of the oldest channel associated with this channel.
		Linkedid: number                //'1527245675.556769'   1527245675.556769
		SwapUniqueid: number
	}

	export interface I_BridgeDestroy {
		Event: string
		BridgeUniqueid: string
		BridgeType: string
		BridgeTechnology: string
		// Entity that created the bridge if applicable
		BridgeCreator: string
		//Name used to refer to the bridge by its BridgeCreator if applicable
		BridgeName: string
		BridgeNumChannels: number
		//The video source mode for the bridge.
		BridgeVideoSourceMode: "talker" | "single" | string   //'none',
		//If there is a video source for the bridge, the unique ID of the channel that is the video source.
		BridgeVideoSource: string
	}

	export interface I_BridgeMerge {
		Event: string
		ToBridgeUniqueid: string
		ToBridgeType: string
		ToBridgeTechnology: string
		//Entity that created the bridge if applicable
		ToBridgeCreator: string
		//Name used to refer to the bridge by its BridgeCreator if applicable
		ToBridgeName: string
		//Number of channels in the bridge
		ToBridgeNumChannels: number
		ToBridgeVideoSourceMode: string
		ToBridgeVideoSource: string
		FromBridgeUniqueid: string
		FromBridgeType: string
		FromBridgeTechnology: string
		FromBridgeCreator: string
		FromBridgeName: string
		FromBridgeNumChannels: number
		FromBridgeVideoSourceMode: string
		FromBridgeVideoSource: string
	}

	export interface I_BridgeInfoComplete {
		Event: string
		BridgeUniqueid: string
		BridgeType: string
		BridgeTechnology: string
		//Entity that created the bridge if applicable
		BridgeCreator: string
		//Name used to refer to the bridge by its BridgeCreator if applicable
		BridgeName: string
		//Number of channels in the bridge
		BridgeNumChannels: number
		BridgeVideoSourceMode: string
		BridgeVideoSource: string
	}

	export interface I_BridgeInfoChannel {
		Event: string
		Channel: string                 //'SIP/107-00042237',   SIP/mtt-out-00042236
		//A numeric code for the channel's current state, related to ChannelStateDesc
		ChannelState: number            //6,
		ChannelStateDesc: "Down" |
			"Rsrvd" |
			"offHook" |
			"Diealing" |
			"Ring" |
			"Ringing" |
			"Up" |
			"Busy" |
			"Dialing Offhook" |
			"Pre-ring" |
			"Unknown" |
			string        //'Up',
		CallerIDNum: number             //null,          89******353
		CallerIDName: string            //null,
		ConnectedLineNum: number        //89******353,        null
		ConnectedLineName: string       //null,
		Language: string                //'ru',
		AccountCode: string             //'',
		Context: string                 //'callcenter',         menuivr
		Exten: string                   // null,
		Priority: number                // 1,                  8
		Uniqueid: number                //'1527245698.556770',  1527245675.556769
		//Uniqueid of the oldest channel associated with this channel.
		Linkedid: number                //'1527245675.556769'   1527245675.556769
	}


	export interface I_BridgeListComplete {
		Event: string						// BridgeListComplete
		ActionID: string | number,			// 1528887557034
		EventList: 'Complete' | string,  	// Complete
		ListItems: number					// 2
	}

	export interface I_BridgeListItem {
		Event: string 					//'BridgeListItem',
		ActionID: string | number 		//'1528887557034',
		BridgeUniqueid: string 			//'13c53335-7c92-41e0-86f5-923c71fae6ad',
		BridgeType: string 				// 'basic',
		BridgeTechnology: string 		//'simple_bridge',
		BridgeCreator: string 			//null,
		BridgeName: string 				//null,
		BridgeNumChannels: number 		//2,
		BridgeVideoSourceMode: string 	//'none',
	}


	/**
	 * Core interfaces
	 *
	 */
		//Raised in response to a CoreShowChannels command.
	export interface I_CoreShowChannel {
		Event: string
		ActionID: number | string
		Channel: string
		ChannelState: number
		ChannelStateDesc: string
		CallerIDNum: number
		CallerIDName: string
		ConnectedLineNum: number
		ConnectedLineName: string
		AccountCode: number
		Context: string
		Exten: number
		Priority: number
		Uniqueid: number
		Linkedid: number
		BridgeId: string
		Application: string
		ApplicationData: string
		//The amount of time the channel has existed
		Duration: string
	}

	//Raised at the end of the CoreShowChannel list produced by the CoreShowChannels command.
	export interface I_CoreShowChannelsComplete {
		Event: string
		// ActionID for this transaction. Will be returned.
		ActionID: number | string
		//Conveys the status of the command reponse list
		EventList: string
		//The total number of list items produced
		ListItems: number
	}


	/**
	 * Dial event interfaces
	 *
	 */
	export interface I_DialBegin {
		Privilege: string               //'call,all'
		Channel: string                 //'IAX2/aster-17127'
		ChannelState: number            // 6
		ChannelStateDesc: string        //'Up'
		CallerIDNum: number             // 89*****4387
		CallerIDName: string            // null,
		ConnectedLineNum: number        // 110
		ConnectedLineName: string       //'110 test'
		Language: string                //'en'
		AccountCode: string             // null
		Context: string                 // 'callcenter'
		Exten: string                   // 1877
		Priority: number                // 3
		Uniqueid: number                // 1528262325.580184
		Linkedid: number                // 1528262325.580183

		DestChannel: string             //'IAX2/aster-25872'
		DestChannelState: number        // 5
		DestChannelStateDesc: string    //'Ringing'
		DestCallerIDNum:  number        // 1877
		DestCallerIDName: string        //'110 test'
		DestConnectedLineNum: number    // 89*****4387
		DestConnectedLineName: string   // null
		DestLanguage: string            //'en'
		DestAccountCode: string         // null
		DestContext: string             //'callcenter'
		DestExten: string               // 1877
		DestPriority: number            // 1
		DestUniqueid: number            // 1528262348.580187
		DestLinkedid: number            // 1528262325.580183'
		DialStatus: string              //'RINGING'
	}
	export interface I_DialEnd {
		Privilege: string               //'call,all'
		Channel: string                 //'IAX2/aster-17127'
		ChannelState: number            // 6
		ChannelStateDesc: string        //'Up'
		CallerIDNum: number             // 89*****4387
		CallerIDName: string            // null,
		ConnectedLineNum: number        // 110
		ConnectedLineName: string       //'110 test'
		Language: string                //'en'
		AccountCode: string             // null
		Context: string                 // 'callcenter'
		Exten: string                   // 1877
		Priority: number                // 3
		Uniqueid: number                // 1528262325.580184
		Linkedid: number                // 1528262325.580183

		DestChannel: string             //'IAX2/aster-25872'
		DestChannelState: number        // 5
		DestChannelStateDesc: string    //'Ringing'
		DestCallerIDNum:  number        // 1877
		DestCallerIDName: string        //'110 test'
		DestConnectedLineNum: number    // 89*****4387
		DestConnectedLineName: string   // null
		DestLanguage: string            //'en'
		DestAccountCode: string         // null
		DestContext: string             //'callcenter'
		DestExten: string               // 1877
		DestPriority: number            // 1
		DestUniqueid: number            // 1528262348.580187
		DestLinkedid: number            // 1528262325.580183'
		DialStatus: string              //'RINGING'
	}
	export interface I_DialState {
		Privilege: string               //'call,all'
		Channel: string                 //'IAX2/aster-17127'
		ChannelState: number            // 6
		ChannelStateDesc: string        //'Up'
		CallerIDNum: number             // 89*****4387
		CallerIDName: string            // null,
		ConnectedLineNum: number        // 110
		ConnectedLineName: string       //'110 test'
		Language: string                //'en'
		AccountCode: string             // null
		Context: string                 // 'callcenter'
		Exten: string                   // 1877
		Priority: number                // 3
		Uniqueid: number                // 1528262325.580184
		Linkedid: number                // 1528262325.580183

		DestChannel: string             //'IAX2/aster-25872'
		DestChannelState: number        // 5
		DestChannelStateDesc: string    //'Ringing'
		DestCallerIDNum:  number        // 1877
		DestCallerIDName: string        //'110 test'
		DestConnectedLineNum: number    // 89*****4387
		DestConnectedLineName: string   // null
		DestLanguage: string            //'en'
		DestAccountCode: string         // null
		DestContext: string             //'callcenter'
		DestExten: string               // 1877
		DestPriority: number            // 1
		DestUniqueid: number            // 1528262348.580187
		DestLinkedid: number            // 1528262325.580183'
		DialStatus: string              //'RINGING'
	}

	/**
	 * DTMF event interfaces
	 *
	 */
	export interface I_DTMFBegin {
		Event: string
		Channel: string
		ChannelState: string
		ChannelStateDesc: string
		CallerIDNum: number
		CallerIDName: string
		ConnectedLineNum: number
		ConnectedLineName: string
		AccountCode: string
		Context: string
		Exten: string
		Priority: number
		Uniqueid: number
		Linkedid: number
		//DTMF digit received or transmitted (0-9, A-E, # or *
		Digit: string
		Direction: "Received" | "Sent"
	}
	export interface I_DTMFEnd {
		Event: string
		Channel: string
		ChannelState: string
		ChannelStateDesc: string
		CallerIDNum: number
		CallerIDName: string
		ConnectedLineNum: number
		ConnectedLineName: string
		AccountCode: string
		Context: string
		Exten: string
		Priority: number
		Uniqueid: number
		Linkedid: number
		//DTMF digit received or transmitted (0-9, A-E, # or *
		Digit: string
		//Duration (in milliseconds) DTMF was sent/received
		DurationMs: number
		Direction: "Received" | "Sent"
	}

	/**
	 * Hangup event interfaces
	 *
	 */
	export interface I_HangupRequest {
		Event: string               //'HangupRequest',
		Privilege: string           //'call,all',
		Channel: string             //'IAX2/aster-25439',
		ChannelState: number        // 5
		ChannelStateDesc: string    //'Ringing',
		CallerIDNum: number         // 89*****4387
		CallerIDName: string        // null
		ConnectedLineNum: number    // 110
		ConnectedLineName: string   //'110 test',
		Language: string            //'en',
		AccountCode: string         // null,
		Context: string             //'callcenter',
		Exten: string               // 89*****4387
		Priority: number            // 1
		Uniqueid: number            // 1527245623.556767
		Linkedid: number            // 1527245623.556766
	}

	export interface I_Hangup {
		Event: string               //'Hangup',
		Privilege: string           //'call,all',
		Channel: string             //'IAX2/aster-25439',
		ChannelState: number        // 5
		ChannelStateDesc: string    //'Ringing',
		CallerIDNum: number         // 89*****4387
		CallerIDName: string        // null
		ConnectedLineNum: number    // 110
		ConnectedLineName: string   //'110 test',
		Language: string            //'en',
		AccountCode: string         // null,
		Context: string             //'callcenter',
		Exten: string               // 89*****4387
		Priority: number            // 1
		Uniqueid: number            // 1527245623.556767
		Linkedid: number            // 1527245623.556766
	}

	export interface I_DualHangup {
		hangup: I_Hangup
		hangupRequest: I_HangupRequest
	}


	/**
	 * NewChannel|Extend|State|ConnectedLine event interfaces
	 *
	 */
		//Raised when a new channel is created.
	export interface I_NewChannel {
		Event: string               //'Newchannel',
		Privilege: string           //'call,all',
		Channel: string             //'SIP/110-00042242',
		ChannelState: number        // 0
		ChannelStateDesc: string    //'Down',
		CallerIDNum: number         // 110
		CallerIDName: string        //'110 test',
		ConnectedLineNum: number    // null
		ConnectedLineName: string   // null',
		Language: string            //'en',
		AccountCode: string         // null
		Context: string             //'callcenter',
		Exten: string               // 89*****4387
		Priority: number            // 1
		Uniqueid: number            // 1527247326.556790
		Linkedid: number            // 1527247326.556790
	}

	//Raised when a channel's state changes.
	export interface I_NewState {
		Event: string               //'Newchannel',
		Privilege: string           //'call,all',
		Channel: string             //'SIP/110-00042242',
		ChannelState: number        // 0
		ChannelStateDesc: string    //'Down',
		CallerIDNum: number         // 110
		CallerIDName: string        //'110 test',
		ConnectedLineNum: number    // null
		ConnectedLineName: string   // null',
		Language: string            //'en',
		AccountCode: string         // null
		Context: string             //'callcenter',
		Exten: string               // 89*****4387
		Priority: number            // 1
		Uniqueid: number            // 1527247326.556790
		Linkedid: number            // 1527247326.556790
	}

	//Raised when a channel's connected line information is changed.
	export interface I_NewConnectedLine {
		Event: string               //'NewConnectedLine',
		Privilege: string           //'call,all',
		Channel: string             //'SIP/110-00042242',
		ChannelState: number        // 0
		ChannelStateDesc: string    //'Down',
		CallerIDNum: number         // 110
		CallerIDName: string        //'110 test',
		ConnectedLineNum: number    // null
		ConnectedLineName: string   // null',
		Language: string            //'en',
		AccountCode: string         // null
		Context: string             //'callcenter',
		Exten: string               // 89*****4387
		Priority: number            // 1
		Uniqueid: number            // 1527247326.556790
		Linkedid: number            // 1527247326.556790
	}

	//Raised when a channel enters a new context, extension, priority.
	export interface I_NewExten {
		Event: string               //'NewConnectedLine',
		Channel: string             //'SIP/110-00042242',
		ChannelState: number        // 0
		ChannelStateDesc: string    //'Down',
		CallerIDNum: number         // 110
		CallerIDName: string        //'110 test',
		ConnectedLineNum: number    // null
		ConnectedLineName: string   // null',
		AccountCode: string         // null
		Context: string             //'callcenter',
		Exten: string               // 89*****4387
		Priority: number            // 1
		Uniqueid: number            // 1527247326.556790
		Linkedid: number            // 1527247326.556790
		// Deprecated in 12, but kept for backward compatability. Please use 'Exten' instead.
		Extension: string
		//The application about to be executed
		Application: string
		//The data to be passed to the application.
		AppData: string
	}

	/**
	 * Originate event interface
	 * 
	 */
	export interface I_OriginateResponse {
		Event: "OriginateResponse"
		ActionID?: number | string
		Response: string
		Channel: string
		Context: string
		Exten: string
		Application: string
		Data: string
		Reason: string
		Uniqueid: number
		CallerIDNum: number
		CallerIDName: string
	}

	/**
	 * Queue event interfaces
	 * 
	 */
		//Response by QueueStatus action
		//Вызывается для каждого оператора очереди
	export interface I_QueueMember {
		Event: string
		//The name of the queue.
		Queue: string
		//The name of the queue member.
		MemberName: string
		//The queue member's channel technology or location.
		Interface: string
		//Channel technology or location from which to read device state changes.
		StateInterface: string

		Membership: "dynamic" | "realtime" | "static" | string

		//The penalty associated with the queue member.
		Penalty: number
		//The number of calls this queue member has serviced.
		CallsTaken: number
		//The time this member last took a call, expressed in seconds since 00:00, Jan 1, 1970 UTC.
		LastCall: number
		//The time when started last paused the queue member.
		LastPause: number
		// Set to 1 if member is in call. Set to 0 after LastCall time is updated.
		InCall: 0 | 1
		//The numeric device state status of the queue member.
		Status:  0 // AST_DEVICE_UNKNOWN
			|1 // AST_DEVICE_NOT_INUSE
			|2 // AST_DEVICE_INUSE
			|3 // AST_DEVICE_BUSY
			|4 // AST_DEVICE_INVALID
			|5 // AST_DEVICE_UNAVAILABLE
			|6 // AST_DEVICE_RINGING
			|7 // AST_DEVICE_RINGINUSE
			|8 // AST_DEVICE_ONHOLD

		Paused: 0 | 1
		//If set when paused, the reason the queue member was paused.
		PausedReason: string
		Ringinuse: 0 | 1
	}

	//Raised when a member is added to the queue.
	export interface I_QueueMemberAdded {
		Event: "QueueMemberAdded"
		Queue: string
		MemberName: string
		Interface: string
		StateInterface: string
		Membership: "dynamic" | "realtime" | "static" | string
		Penalty: number
		CallsTaken: number
		LastCall: number
		Status: number
		Paused: boolean
		Ringinuse: 0 | 1
	}

	//Raised when a member is removed from the queue.
	export interface I_QueueMemberRemoved {
		Event: "QueueMemberRemoved"
		Queue: string
		MemberName: string
		Interface: string
		StateInterface: string
		Membership: "dynamic" | "realtime" | "static" | string
		Penalty: number
		CallsTaken: number
		LastCall: number
		Status: number
		Paused: boolean
		Ringinuse: 0 | 1
	}

	//Raised when a member's penalty is changed.
	export interface I_QueueMemberPenalty {
		Event: "QueueMemberPenalty"
		Queue: string
		MemberName: string
		Interface: string
		StateInterface: string
		Membership: "dynamic" | "realtime" | "static" | string
		Penalty: number
		CallsTaken: number
		LastCall: number
		Status: number
		Paused: boolean
		Ringinuse: 0 | 1
	}


	//Raised when a Queue member's status has changed.
	export interface I_QueueMemberStatus {
		Event: string
		//The name of the queue.
		Queue: string
		//The name of the queue member.
		MemberName: string
		//The queue member's channel technology or location.
		Interface: string
		//Channel technology or location from which to read device state changes.
		StateInterface: string

		Membership: "dynamic" | "realtime" | "static" | string

		//The penalty associated with the queue member.
		Penalty: number
		//The number of calls this queue member has serviced.
		CallsTaken: number
		//The time this member last took a call, expressed in seconds since 00:00, Jan 1, 1970 UTC.
		LastCall: number
		//The time when started last paused the queue member.
		LastPause: number
		// Set to 1 if member is in call. Set to 0 after LastCall time is updated.
		InCall: 0 | 1
		//The numeric device state status of the queue member.
		Status:  0 // AST_DEVICE_UNKNOWN
			|1 // AST_DEVICE_NOT_INUSE
			|2 // AST_DEVICE_INUSE
			|3 // AST_DEVICE_BUSY
			|4 // AST_DEVICE_INVALID
			|5 // AST_DEVICE_UNAVAILABLE
			|6 // AST_DEVICE_RINGING
			|7 // AST_DEVICE_RINGINUSE
			|8 // AST_DEVICE_ONHOLD

		Paused: 0 | 1
		//If set when paused, the reason the queue member was paused.
		PausedReason: string
		Ringinuse: 0 | 1
	}

	//Raised when a member is paused/unpaused in the queue.
	export interface I_QueueMemberPause {
		Event: string
		//The name of the queue.
		Queue: string
		//The name of the queue member.
		MemberName: string
		//The queue member's channel technology or location.
		Interface: string
		//Channel technology or location from which to read device state changes.
		StateInterface: string

		Membership: "dynamic" | "realtime" | "static" | string

		//The penalty associated with the queue member.
		Penalty: number
		//The number of calls this queue member has serviced.
		CallsTaken: number
		//The time this member last took a call, expressed in seconds since 00:00, Jan 1, 1970 UTC.
		LastCall: number
		//The time when started last paused the queue member.
		LastPause: number
		// Set to 1 if member is in call. Set to 0 after LastCall time is updated.
		InCall: 0 | 1
		//The numeric device state status of the queue member.
		Status:  0 // AST_DEVICE_UNKNOWN
			|1 // AST_DEVICE_NOT_INUSE
			|2 // AST_DEVICE_INUSE
			|3 // AST_DEVICE_BUSY
			|4 // AST_DEVICE_INVALID
			|5 // AST_DEVICE_UNAVAILABLE
			|6 // AST_DEVICE_RINGING
			|7 // AST_DEVICE_RINGINUSE
			|8 // AST_DEVICE_ONHOLD

		Paused: 0 | 1
		//If set when paused, the reason the queue member was paused.
		PausedReason: string
		Ringinuse: 0 | 1
		// The reason a member was paused.
		Reason
	}

	//Response by QueueSummary action
	export interface I_QueueSummary {
		Available: number
		Callers: number
		HoldTime: number
		TalkTime: number
		LoggedIn: number
		LongestHoldTime: number
	}

	/**
	 * RTCP event interfaces
	 *
	 */
		//Raised when an RTCP packet is sent.
	export interface I_RTCPSent {
		Event: 'RTCPSent',
		Privilege: string 					//'reporting,all',
		Channel: string 					//'SIP/105-000461ca',
		ChannelState: number 				//4,
		ChannelStateDesc: string 			//'Ring',
		CallerIDNum: number 				//110,
		CallerIDName: string 				//110 test,
		ConnectedLineNum: number 			//null,
		ConnectedLineName: string 			//null,
		Language: string 					//'ru',
		AccountCode: number 				//0,
		Context: string 					//'callcenter',
		Exten: string 						//891*****387,
		Priority: number 					//1,
		Uniqueid: number 					//1528531544.589918,
		Linkedid: number 					//1528531521.589916,
		To: string   						//'10.0.12.47:15001',
		//The address the report was received from.
		From: string 						//'10.0.14.33:18539',
		//The SSRC identifier for the remote system
		SSRC: number 						//913***63,
		//The type of packet for this RTCP report.
		PT: "200(SR)" | "201(SR)" 			//'200(SR)',
		//The number of reports that were received.
		//The report count determines the number of ReportX headers in the message.
		// The X for each set of report headers will range from 0 to ReportCount - 1.
		ReportCount: number 				// 1,
		//The time the sender generated the report. Only valid when PT is 200(SR).
		SentNTP: number 					//1528531551.953682,
		//The sender's last RTP timestamp. Only valid when PT is 200(SR).
		SentRTP: number 					//2075878680,
		//The number of packets the sender has sent. Only valid when PT is 200(SR).
		SentPackets: number 				//251,
		//The number of bytes the sender has sent. Only valid when PT is 200(SR).
		SentOctets: number 					//40160,
		//The SSRC for the source of this report block.
		Report0SourceSSRC: number 			//18762,
		//The fraction of RTP data packets from ReportXSourceSSRC lost since the previous SR or RR report was sent.
		Report0FractionLost: number 		//0,
		//he total number of RTP data packets from ReportXSourceSSRC lost since the beginning of reception.
		Report0CumulativeLost: number 		//0,
		//The highest sequence number received in an RTP data packet from ReportXSourceSSRC.
		Report0HighestSequence: number 		//32839,
		//The number of sequence number cycles seen for the RTP data received from ReportXSourceSSRC.
		Report0SequenceNumberCycles: number //0,
		// An estimate of the statistical variance of the RTP data packet interarrival time, measured in timestamp units.
		Report0IAJitter: number 			//3,
		Report0LSR: number 					//0,
		Report0DLSR: number 				//0,
	}

	//Raised when an RTCP packet is received.
	export interface I_RTCPReceived {
		Event: 'RTCPReceived',
		Privilege: string 					//'reporting,all',
		Channel: string 					//'SIP/110-000463cb',
		ChannelState: number 				//4,
		ChannelStateDesc: string 			//'Ring',
		CallerIDNum: number 				//110,
		CallerIDName: string 				//'110 test',
		ConnectedLineNum: number 			//null,
		ConnectedLineName: string 			//null,
		Language: string 					//'ru',
		AccountCode: number 				//0,
		Context: string 					//'callcenter',
		Exten: string 						//891*****387,
		Priority: number 					//3,
		Uniqueid: number 					//1528532694.589938,
		Linkedid: number 					//1528532694.589938,
		To: string   						//'10.0.14.33:18539',
		//The address the report was received from.
		From: string 						//'10.0.12.47:15001',
		//The SSRC identifier for the remote system
		SSRC: number 						//4****3357,
		//The type of packet for this RTCP report.
		PT: "200(SR)" | "201(SR)" 			//'200(SR)',
		//The number of reports that were received.
		//The report count determines the number of ReportX headers in the message.
		// The X for each set of report headers will range from 0 to ReportCount - 1.
		ReportCount: number 				// 1,
		//The time the sender generated the report. Only valid when PT is 200(SR).
		SentNTP: number 					//1528532574.173034,
		//The sender's last RTP timestamp. Only valid when PT is 200(SR).
		SentRTP: number 					//3741925649,
		//The number of packets the sender has sent. Only valid when PT is 200(SR).
		SentPackets: number 				//238,
		//The number of bytes the sender has sent. Only valid when PT is 200(SR).
		SentOctets: number 					//38080,
		//The SSRC for the source of this report block.
		Report0SourceSSRC: number 			//2100990771,
		//The fraction of RTP data packets from ReportXSourceSSRC lost since the previous SR or RR report was sent.
		Report0FractionLost: number 		//0,
		//he total number of RTP data packets from ReportXSourceSSRC lost since the beginning of reception.
		Report0CumulativeLost: number 		//0,
		//The highest sequence number received in an RTP data packet from ReportXSourceSSRC.
		Report0HighestSequence: number 		//32839,
		//The number of sequence number cycles seen for the RTP data received from ReportXSourceSSRC.
		Report0SequenceNumberCycles: number //0,
		// An estimate of the statistical variance of the RTP data packet interarrival time, measured in timestamp units.
		Report0IAJitter: number 			//3,
		Report0LSR: number 					//0,
		Report0DLSR: number 				//0,

	}

	/**
	 * Status event interface
	 * 
	 */
		//Raised in response to a Status command.
	export interface I_Status {
		Event: string                       //'Status',
		Privilege: string                   //'Call',
		Channel: string                     //'SIP/mtt-out-00042248',
		ChannelState: string                // 6
		ChannelStateDesc: string            //'Up',
		CallerIDNum: string                 // 8********67
		CallerIDName: string                // null
		ConnectedLineNum: string            // null
		ConnectedLineName: string           // null
		Language: string                    //'ru',
		AccountCode: string                 // ,
		Context: string                     //'menuivr',
		Exten: string                       // null,
		Priority: string                    // 8
		Uniqueid: string                    // 1527247624.556805',
		Linkedid: string                    // 1527247624.556805',
		Type: string                        //'SIP',
		//Dialed number identifier
		DNID: string                        // 2****57
		//Absolute lifetime of the channel
		TimeToHangup: string                // 0
		// Identifier of the bridge the channel is in, may be empty if not in one
		BridgeID: string                    //'07a1f7e2-ed60-4223-a57f-d2f983ade5dd',
		//Application currently executing on the channel
		Application: string                 //'Queue',
		//Data given to the currently executing channel
		Data: string                        //'callcenter_q,t',
		//Media formats the connected party is willing to send or receive
		Nativeformats: string               //'(ulaw)',
		//Media formats that frames from the channel are received in
		Readformat: string                  //'ulaw',
		//Translation path for media received in native formats
		Readtrans: string                   // null
		// Media formats that frames to the channel are accepted in
		Writeformat: string                 //'alaw',
		// Translation path for media sent to the connected party
		Writetrans: string                  //'(alaw@8000)->(ulaw@8000)',
		//Configured call group on the channel
		Callgroup: string                   // 0
		//Configured pickup group on the channel
		Pickupgroup: string                 // 0
		//Number of seconds the channel has been active
		Seconds: string                     // 51
		Variable: string                    //'SIPURI=sip:79*******67@80.**.**.83:5060',
		ActionID: string                    //'--spec_1527247555970'
	}

	/**
	 * UserEvent event interface
	 */
		//A user defined event raised from the dialplan.
		//Event may contain additional arbitrary parameters in addition to optional bridge and endpoint snapshots.
		// Multiple snapshots of the same type are prefixed with a numeric value.
	export interface I_UserEvent {
		Event: "UserEvent"
		Channel: string
		ChannelState: number
		ChannelStateDesc: string
		CallerIDNum: number
		CallerIDName: string
		ConnectedLineNum: number
		ConnectedLineName: string
		AccountCode: string
		Context: string
		Exten: string
		Priority: number
		Uniqueid: number
		Linkedid: number
		//The event name, as specified in the dialplan.

		UserEvent: string
	}


	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isUndefined( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isNull( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isEmpty( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isNaN( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isNumber( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {number}
	 */
	function _toNumber( value: any ): number;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isFinite( value: any ): boolean;

	/**
	 *
	 * @param {any[]} array
	 * @param value
	 * @returns {number index or -1 for error}
	 */
	function _indexOfArray( array: any[], value: any ): number;

	class eAmi {
		constructor( options: connectionOptions );

		public debug: boolean;

		private _host: string;
		private _port: number;
		private _userName: string;
		private _password: string;

		private _isLoggedIn: boolean;
		private _emitAllEvents: boolean;
		private _reconnect: boolean;
		private _resendAction: boolean;
		private _heartbeatOk: boolean;

		private _lastConnectedTime: number;
		private _maxReconnectCount: number;
		private _heartbeatInterval: number;
		private _timeOutSend: number;
		private _timeOutToDefibrillation: number;
		private _heartbeatHandler: number;
		private _heartbeatTimeout: number;
		private _countPreDefibrillation: number;
		private _countReconnect: number;

		private _excludeEvents: string[];

		private _queueRequest: I_Request[];
		private _socketHandler: Socket;
		private _actions: eAmiActions;
		private _events: EventEmitter;

		/**
		 * 
		 * Getters
		 */
		public excludeEvents: string[];
		public isLoggedIn: boolean;
		public lastConnectTime: number
		public actions: eAmiActions
		public events: EventEmitter
		public queueRequest: I_Request[]
		
		
		private destroySocket(): void;

		/**
		 *
		 * @param {I_Request} request
		 */
		private addRequest( request: I_Request ): void;

		/**
		 *
		 * @param actionID
		 * @returns {boolean}
		 */
		public removeRequest( actionID: any ): boolean;

		/**
		 *
		 * @param actionID
		 * @returns {I_Request | boolean}
		 */
		public getRequest( actionID: any ): I_Request | boolean;

		/**
		 *
		 * @param actionID
		 * @param {I_Request} newRequest
		 */
		private setRequest( actionID: any, newRequest: I_Request ): void;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		private keepConnection(): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		private login(): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		private logout(): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<this | boolean>} false - only error
		 */
		public connect(): Promise<boolean | this>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		public reconnect(): Promise<boolean>;

		/**
		 *
		 * @param {T} request ** {T} = I_Action<SomeAction>
		 * @returns {Promise<boolean | T>} false - timeOut or error
		 */
		public action<T>( request: T ): Promise<T | boolean>;

		/**
		 *
		 * @param {Buffer} buffer
		 * @returns {I_Response}
		 */
		private getData( buffer: BufferSource ): I_Response;

	}

	class eAmiActions {

		private eAmi: eAmi;

		constructor( eAmi: eAmi );

		/**
		 *
		 * @param {I_ActionBridgeInfo} options
		 * @returns {Promise<I_BridgeInfoChannel>}
		 */
		public BridgeInfo( options: I_ActionBridgeInfo ): Promise<I_BridgeInfoChannel>;

		/**
		 *
		 * @param {I_ActionBridgeList} options
		 * @returns {Promise<I_BridgeListItem[]>}
		 */
		public BridgeList( options: I_ActionBridgeList ): Promise<I_BridgeListItem[]>;

		/**
		 *
		 * @param {I_ActionCoreShowChannels} options
		 * @returns {Promise<I_CoreShowChannel[]>}
		 */
		public CoreShowChannels( options: I_ActionCoreShowChannels ): Promise<I_CoreShowChannel[]>;

		/**
		 *
		 * @param {I_ActionHangup} options
		 * @returns {Promise<I_DualHangup>}
		 */
		public Hangup( options: I_ActionHangup ): Promise<I_DualHangup>;

		/**
		 *
		 * @param {I_ActionLogin} options
		 * @returns {Promise<boolean>}
		 */
		public Login( options: I_ActionLogin ): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		public Logout(): Promise<boolean>;

		/**
		 *
		 * @param {I_ActionOriginate} options
		 * @returns {Promise<boolean>}
		 */
		public Originate( options: I_ActionOriginate ): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		public Ping(): Promise<boolean>;

		/**
		 *
		 * @param {I_ActionQueueAdd} options
		 * @returns {Promise<I_QueueMemberAdded>}
		 */
		public QueueMemberAdd( options: I_ActionQueueAdd ): Promise<I_QueueMemberAdded>;

		/**
		 *
		 * @param {I_ActionQueueRemove} options
		 * @returns {Promise<I_QueueMemberRemoved>}
		 */
		public QueueMemberRemove( options: I_ActionQueueRemove ): Promise<I_QueueMemberRemoved>;

		/**
		 *
		 * @param {I_ActionQueuePenalty} options
		 * @returns {Promise<I_QueueMemberPenalty>}
		 */
		public QueueMemberPenalty( options: I_ActionQueuePenalty ): Promise<I_QueueMemberPenalty>;

		/**
		 *
		 * @param {I_ActionQueuePause} options
		 * @returns {Promise<I_QueueMemberPause>}
		 */
		public QueueMemberPause( options: I_ActionQueuePause ): Promise<I_QueueMemberPause>;

		/**
		 *
		 * @param {I_ActionQueueStatus} options
		 * @returns {Promise<I_QueueMember[]>}
		 */
		public QueueStatus( options: I_ActionQueueStatus ): Promise<I_QueueMember[]>;

		/**
		 *
		 * @param {I_ActionQueueSummary} options
		 * @returns {Promise<I_QueueSummary>}
		 */
		public QueueSummary( options: I_ActionQueueSummary ): Promise<I_QueueSummary>;

		/**
		 *
		 * @param {I_ActionStatus} options
		 * @returns {Promise<I_Status>}
		 */
		public Status( options: I_ActionStatus ): Promise<I_Status>;
	}
}

export = extended_ami;