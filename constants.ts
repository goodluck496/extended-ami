export enum AMI_EVENTS {

	BRIDGE_CREATE = "BridgeCreate",
	BRIDGE_DESTROY = "BridgeDestroy",
	BRIDGE_ENTER = "BridgeEnter",
	BRIDGE_INFO_CHANNEL = "BridgeInfoChannel",
	BRIDGE_INFO = "BridgeInfoComplete",
	BRIDGE_LEAVE = "BridgeLeave",
	BRIDGE_MERGE = "BridgeMerge",
	BRIDGE_LIST_ITEM = "BridgeListItem",

	CEL = "CEL",

	DIAL1 = "DialBegin",
	DIAL2 = "DialEnd",
	DIAL_STATE = "DialState",

	DTMF1 = "DTMFBegin",
	DTMF2 = "DTMFEnd",

	HANGUP = "Hangup",
	HANGUP_REQUEST = "HangupRequest",

	HOLD = "Hold",

	NEW_CALLERID = "NewCallerid",
	NEW_CHANNEL = "Newchannel",
	NEW_CONNECTED_LINE = "NewConnectedLine",
	NEW_EXTEN = "NewExten",
	NEW_STATE = "NewState",

	ORIGINATE_RESPONSE = "OriginateResponse",

	Q_SUMMARY = "QueueSummary",
	Q_MEMBER_ADDED = "QueueMemberAdded",
	Q_MEMBER_PAUSE = "QueueMemberPause",
	Q_MEMBER_REMOVED = "QueueMemberRemoved",
	Q_MEMBER_RING_IN_USE = "QueueMemberRinginuse",
	Q_MEMBER = "QueueMember",
	Q_MEMBER_STATUS = "QueueMemberStatus",

	RTCP_SENT = "RTCPSent",
	RTCP_RECEIVED = "RTCPReceived",

	STATUS = "Status",
}

export const CRLF = "\r\n";
export const END = "\r\n\r\n";
export const TIMEOUT_FOR_SEND = 3;
export const HEARTBEAT_TIMEOUT = 1;
export const HEARTBEAT_INTERVAL = 1;
export const TIMEOUT_TO_DEFIBRILLATION = 5;