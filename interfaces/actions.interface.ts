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
	Action: string

	[field: string]: any
}

//Bridge two channels already in the PBX
export interface I_ActionBridge {
	Action: "Bridge"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	// Channel to Bridge to Channel2.
	Channel1: string
	// Channel to Bridge to Channel1.
	Channel2: string
	//Play courtesy tone to Channel 2.
	Tone: "no" | "Channel1" | "Channel2" | "Both"
}

//Get information about a bridge
export interface I_ActionBridgeInfo {
	Action: "BridgeInfo"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//The unique ID of the bridge about which to retrieve information.
	BridgeUniqueid: string
}

//Kick a channel from a bridge.
export interface I_ActionBridgeKick {
	Action: "BridgeKick"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	BridgeUniqueid?: string
	Channel: string
}

//Get a list of bridges in the system
export interface I_ActionBridgeList {
	Action: "BridgeList"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//Optional type for filtering the resulting list of bridges.
	BridgeType: string
}

//Hangup channel.
export interface I_ActionHangup {
	Action: "Hangup"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//The exact channel name to be hungup, or to use a regular expression, set this parameter to: /regex/
	Channel: string
	Cause: string
}

//Login Manager
export interface I_ActionLogin {
	Action: "Login"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//Username to login with as specified in manager.conf.
	Username: string
	// Secret to login with as specified in manager.conf.
	Secret: string
}

//Logoff the current manager session.
export interface I_ActionLogout {
	Action: "Logoff"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
}

//Generates an outgoing call to a Extension/Context/Priority or Application/Data
export interface I_ActionOriginate {
	Action: "Originate"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//Channel name to call
	Channel: string
	//Extension to use (requires Context and Priority)
	Exten: number
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
	CallerID: number
	//Channel variable to set, multiple Variable: headers are allowed.
	Variable: string
	Account: string
	// Set to true to force call bridge on early media..
	EarlyMedia?: boolean
	//Set to true for fast origination.
	Async?: boolean
	//Comma-separated list of codecs to use for this call.
	Codecs: string
	//Channel UniqueId to be set on the channel.
	ChannelId: string
	//Channel UniqueId to be set on the second local channel.
	OtherChannelId: string
}

export interface I_ActionPing {
	Action: "Ping"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
}


//Check the status of one or more queues.
export interface I_ActionQueueStatus {
	Action: "QueueStatus"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//Limit the response to the status of the specified queue.
	Queue: string
	//Limit the response to the status of the specified member.
	Member?: string
}

//Request the manager to send a QueueSummary event.
export interface I_ActionQueueSummary {
	Action: "QueueSummary"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//Queue for which the summary is requested.
	Queue: string
}

//Add interface to queue.
export interface I_ActionQueueAdd {
	Action: "QueueAdd"
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
	Action: "QueueRemove"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//The name of the queue to take action on.
	Queue: string
	//The interface (tech/name) to remove from queue.
	Interface: string
}

//Show queues information.
export interface I_ActionQueues {
	Action: "Queues"
}

//Makes a queue member temporarily unavailable.
//Pause or unpause a member in a queue.
export interface I_ActionQueuePause {
	Action: "QueuePause"
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
	Action: "SIPpeers"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
}

//Show the status of one or all of the sip peers.
//Retrieves the status of one or all of the sip peers. If no peer name is specified, status for all of the sip peers will be retrieved.
export interface I_ActonSIPpeerstatus {
	Action: "SIPpeerstatus"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//The peer name you want to check.
	Peer?: string
}

//show SIP peer (text format).
//Show one SIP peer with details on current status.
export interface I_ActionSIPshowpeer {
	Action: "SIPpeerstatus"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//The peer name you want to check.
	Peer?: string
}

//Show SIP registrations (text format).
//Lists all registration requests and status. Registrations will follow as separate events
// followed by a final event called RegistrationsComplete.
export interface I_ActionSIPshowregistry {
	Action: "SIPshowregistry"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
}

//List channel status.
//Will return the status information of each channel along with the value for the specified channel variables.
export interface I_ActionStatus {
	Action: "Status"
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
	Action: "UserEvent"
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
	Action: "waitEvent"
	//ActionID for this transaction. Will be returned.
	ActionID?: number | string
	//Maximum time (in seconds) to wait for events, -1 means forever.
	Timeout: number
}


