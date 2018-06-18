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